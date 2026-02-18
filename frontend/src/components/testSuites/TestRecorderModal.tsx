/**
 * Test Recorder Modal
 * Headless Playwright test recorder with screenshot preview
 */

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';

interface RecordedAction {
  id: string;
  type: 'click' | 'fill' | 'press' | 'navigate' | 'select' | 'check' | 'uncheck' | 'hover' | 'screenshot' | 'assert';
  selector?: string;
  value?: string;
  url?: string;
  key?: string;
  timestamp: number;
  description: string;
}

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'completed' | 'error';

interface TestRecorderModalProps {
  suiteId: string;
  appUrl?: string;
  onClose: () => void;
  onSaved?: () => void;
}

const actionIcons: Record<string, string> = {
  click: '👆',
  fill: '⌨️',
  press: '⏎',
  navigate: '🔗',
  select: '📋',
  check: '☑️',
  uncheck: '⬜',
  hover: '🖱️',
  screenshot: '📸',
  assert: '✅',
};

const TestRecorderModal = ({ suiteId, appUrl, onClose, onSaved }: TestRecorderModalProps) => {
  const [targetUrl, setTargetUrl] = useState(appUrl || '');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Generate default filename with timestamp to avoid collisions
  const [fileName, setFileName] = useState(() => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    return `recorded-test-${timestamp}`;
  });
  const [saving, setSaving] = useState(false);
  
  // Headless mode state
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [actionType, setActionType] = useState<string>('click');
  const [actionSelector, setActionSelector] = useState('');
  const [actionValue, setActionValue] = useState('');
  const [executing, setExecuting] = useState(false);
  
  const screenshotRef = useRef<HTMLImageElement>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Recorder socket connected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join recorder room and listen for updates
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('recorder:join', sessionId);

      socket.on('action:recorded', (action: RecordedAction) => {
        setActions((prev) => [...prev, action]);
      });

      socket.on('action:executed', ({ screenshot: newScreenshot }: { screenshot: string }) => {
        if (newScreenshot) {
          setScreenshot(newScreenshot);
        }
      });

      socket.on('recording:completed', ({ actions, code }: { actions: RecordedAction[]; code: string }) => {
        setActions(actions);
        setGeneratedCode(code);
        setStatus('completed');
      });

      return () => {
        socket.emit('recorder:leave', sessionId);
        socket.off('action:recorded');
        socket.off('action:executed');
        socket.off('recording:completed');
      };
    }
    return undefined;
  }, [socket, sessionId]);

  // Start recording (headless)
  const handleStart = async () => {
    if (!targetUrl) {
      setError('Please enter a target URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/api/recorder/start', {
        targetUrl,
        browserType: 'chromium',
        headless: true,
      });

      if (response.data.success) {
        setSessionId(response.data.session.id);
        setStatus('recording');
        setActions([]);
        setGeneratedCode('');
        
        // Set initial screenshot if provided
        if (response.data.session.screenshotBase64) {
          setScreenshot(response.data.session.screenshotBase64);
        } else {
          // Fetch screenshot
          await refreshScreenshot(response.data.session.id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start recording');
    } finally {
      setLoading(false);
    }
  };

  // Refresh screenshot
  const refreshScreenshot = async (sid?: string) => {
    const id = sid || sessionId;
    if (!id) return;
    
    try {
      const response = await api.get(`/api/recorder/${id}/page-screenshot`);
      if (response.data.success && response.data.screenshot) {
        setScreenshot(response.data.screenshot);
      }
    } catch (err) {
      console.error('Failed to get screenshot:', err);
    }
  };

  // Execute action
  const handleExecuteAction = async () => {
    if (!sessionId) return;
    if (!actionSelector && actionType !== 'navigate') {
      setError('Please enter a selector');
      return;
    }

    try {
      setExecuting(true);
      setError(null);

      const response = await api.post(`/api/recorder/${sessionId}/execute`, {
        type: actionType,
        selector: actionSelector,
        value: actionValue,
        url: actionType === 'navigate' ? actionValue : undefined,
      });

      if (response.data.success) {
        if (response.data.screenshot) {
          setScreenshot(response.data.screenshot);
        }
        // Clear inputs after successful action
        setActionSelector('');
        setActionValue('');
      } else {
        setError(response.data.error || 'Action failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to execute action');
    } finally {
      setExecuting(false);
    }
  };

  // Stop recording
  const handleStop = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await api.post(`/api/recorder/${sessionId}/stop`);

      if (response.data.success) {
        setGeneratedCode(response.data.code);
        setActions(response.data.actions);
        setStatus('completed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to stop recording');
    } finally {
      setLoading(false);
    }
  };

  // Save as test file
  const handleSave = async () => {
    if (!sessionId || !fileName) {
      setError('Please enter a file name');
      return;
    }

    try {
      setSaving(true);
      setError(null); // Clear any previous errors
      
      const response = await api.post(`/api/recorder/${sessionId}/save`, {
        suiteId,
        fileName,
      });
      
      console.log('Test file saved successfully:', response.data);
      
      // Show message if file was auto-renamed
      if (response.data.message) {
        console.log('Server message:', response.data.message);
      }
      
      // Call onSaved callback BEFORE closing (so parent can invalidate queries)
      if (onSaved) {
        await onSaved();
      }
      
      // Small delay to ensure query invalidation completes
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onClose();
    } catch (err: any) {
      console.error('Failed to save test file:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save test';
      setError(errorMsg);
      
      // If it's a duplicate name error, suggest appending timestamp
      if (errorMsg.includes('already exists')) {
        const timestamp = new Date().getTime();
        setFileName(`${fileName}-${timestamp}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete action
  const handleDeleteAction = async (actionId: string) => {
    if (!sessionId) return;
    try {
      await api.delete(`/api/recorder/${sessionId}/actions/${actionId}`);
      setActions((prev) => prev.filter((a) => a.id !== actionId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete action');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Test Recorder</h2>
              <p className="text-sm text-gray-500">Headless recording mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <div className={`w-3 h-3 rounded-full ${
                status === 'recording' ? 'bg-red-500 animate-pulse' :
                status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium capitalize">{status}</span>
              {actions.length > 0 && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {actions.length} actions
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Help Banner - Headless Recording Explanation */}
        {status === 'recording' && (
          <div className="mx-4 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">How to interact with the page:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Screenshot shows the current page state</strong></li>
                  <li>• <strong>Use the "Add Action" panel</strong> to interact (click, type, navigate)</li>
                  <li>• <strong>Enter CSS selectors</strong> for buttons/inputs (e.g., <code className="bg-blue-100 px-1 rounded">#submit-btn</code>)</li>
                  <li>• Click "Execute Action" to run each interaction</li>
                  <li>• Use "Refresh" to update the screenshot after each action</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left panel - Screenshot preview */}
          <div className="flex-1 p-4 border-r overflow-auto bg-gray-100">
            {status === 'idle' ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-lg font-semibold mb-4">Enter URL to start recording</h3>
                <div className="w-full max-w-md space-y-3">
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                  <button
                    onClick={handleStart}
                    disabled={loading || !targetUrl}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 text-lg font-medium"
                  >
                    <span className="w-4 h-4 bg-white rounded-full" />
                    {loading ? 'Starting...' : 'Start Recording'}
                  </button>
                </div>
              </div>
            ) : screenshot ? (
              <div className="relative">
                <img
                  ref={screenshotRef}
                  src={`data:image/jpeg;base64,${screenshot}`}
                  alt="Page screenshot"
                  className="w-full border rounded-lg shadow-lg"
                />
                <button
                  onClick={() => refreshScreenshot()}
                  className="absolute top-2 right-2 px-3 py-1 bg-white/90 rounded-lg text-sm hover:bg-white shadow"
                >
                  🔄 Refresh
                </button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Loading page preview...
              </div>
            )}
          </div>

          {/* Right panel - Actions */}
          <div className="w-96 flex flex-col overflow-hidden">
            {/* Action input (when recording) */}
            {status === 'recording' && (
              <div className="p-4 border-b bg-blue-50">
                <h3 className="font-semibold text-gray-900 mb-3">Add Action</h3>
                <div className="space-y-2">
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="click">👆 Click</option>
                    <option value="fill">⌨️ Fill/Type</option>
                    <option value="press">⏎ Press Key</option>
                    <option value="select">📋 Select Option</option>
                    <option value="navigate">🔗 Navigate</option>
                  </select>
                  
                  {actionType !== 'navigate' && (
                    <input
                      type="text"
                      value={actionSelector}
                      onChange={(e) => setActionSelector(e.target.value)}
                      placeholder="CSS Selector (e.g., #login-btn, .submit)"
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    />
                  )}
                  
                  {(actionType === 'fill' || actionType === 'press' || actionType === 'select' || actionType === 'navigate') && (
                    <input
                      type="text"
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      placeholder={
                        actionType === 'navigate' ? 'URL' :
                        actionType === 'press' ? 'Key (Enter, Tab, etc.)' :
                        actionType === 'select' ? 'Option value' :
                        'Text to type'
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  )}
                  
                  <button
                    onClick={handleExecuteAction}
                    disabled={executing}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {executing ? 'Executing...' : '▶ Execute Action'}
                  </button>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={handleStop}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    {loading ? 'Stopping...' : '⏹ Stop Recording'}
                  </button>
                </div>
              </div>
            )}

            {/* Actions list */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Recorded Actions ({actions.length})
              </h3>
              {actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {status === 'idle' ? 'Start recording to capture actions' : 'Add actions using the form above'}
                </div>
              ) : (
                <div className="space-y-1">
                  {actions.map((action, index) => (
                    <div key={action.id} className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">
                      <span className="w-6 text-center text-gray-400">{index + 1}</span>
                      <span className="mr-2">{actionIcons[action.type] || '❓'}</span>
                      <span className="flex-1 truncate">{action.description}</span>
                      {status !== 'completed' && (
                        <button
                          onClick={() => handleDeleteAction(action.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generated code (when completed) */}
            {status === 'completed' && generatedCode && (
              <div className="p-4 border-t bg-gray-900 max-h-48 overflow-auto">
                <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{generatedCode}</pre>
              </div>
            )}

            {/* Save form (when completed) */}
            {status === 'completed' && (
              <div className="p-4 border-t bg-green-50">
                <h3 className="font-semibold text-green-900 mb-2">Save Test</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="test-name"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving || !fileName}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 Use CSS selectors like <code className="bg-gray-200 px-1 rounded">#id</code>, <code className="bg-gray-200 px-1 rounded">.class</code>, or <code className="bg-gray-200 px-1 rounded">[data-testid="x"]</code>
          </div>
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
            {status === 'completed' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestRecorderModal;
