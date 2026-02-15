/**
 * Test Recorder Modal
 * Integrated Playwright test recorder within a modal
 */

import { useState, useEffect } from 'react';
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
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);

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
      setError('Failed to connect to recording service');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join/leave recorder room when session changes
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('recorder:join', sessionId);

      socket.on('action:recorded', (action: RecordedAction) => {
        setActions((prev) => [...prev, action]);
      });

      socket.on('action:deleted', ({ actionId }: { actionId: string }) => {
        setActions((prev) => prev.filter((a) => a.id !== actionId));
      });

      socket.on('recording:paused', () => {
        setStatus('paused');
      });

      socket.on('recording:resumed', () => {
        setStatus('recording');
      });

      socket.on('recording:completed', ({ actions, code }: { actions: RecordedAction[]; code: string }) => {
        setActions(actions);
        setGeneratedCode(code);
        setStatus('completed');
      });

      return () => {
        socket.emit('recorder:leave', sessionId);
        socket.off('action:recorded');
        socket.off('action:deleted');
        socket.off('recording:paused');
        socket.off('recording:resumed');
        socket.off('recording:completed');
      };
    }
    return undefined;
  }, [socket, sessionId]);

  // Start recording
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
      });

      if (response.data.success) {
        setSessionId(response.data.session.id);
        setStatus('recording');
        setActions([]);
        setGeneratedCode('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start recording');
    } finally {
      setLoading(false);
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

  // Pause recording
  const handlePause = async () => {
    if (!sessionId) return;
    try {
      await api.post(`/api/recorder/${sessionId}/pause`);
      setStatus('paused');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to pause');
    }
  };

  // Resume recording
  const handleResume = async () => {
    if (!sessionId) return;
    try {
      await api.post(`/api/recorder/${sessionId}/resume`);
      setStatus('recording');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resume');
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
      await api.post(`/api/recorder/${sessionId}/save`, {
        suiteId,
        fileName,
      });
      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save test');
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Test Recorder</h2>
              <p className="text-sm text-gray-500">Record browser interactions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="flex items-center gap-2 mr-4">
              <div className={`w-3 h-3 rounded-full ${
                status === 'recording' ? 'bg-red-500 animate-pulse' :
                status === 'paused' ? 'bg-yellow-500' :
                status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium capitalize">{status}</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* URL Input - only when idle */}
          {status === 'idle' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleStart}
                  disabled={loading || !targetUrl}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="w-3 h-3 bg-white rounded-full" />
                  {loading ? 'Starting...' : 'Start Recording'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                A browser window will open. Interact with the page to record actions.
              </p>
            </div>
          )}

          {/* Recording controls */}
          {(status === 'recording' || status === 'paused') && (
            <div className="flex gap-2 mb-4">
              {status === 'recording' ? (
                <button onClick={handlePause} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                  ⏸ Pause
                </button>
              ) : (
                <button onClick={handleResume} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  ▶ Resume
                </button>
              )}
              <button onClick={handleStop} disabled={loading} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
                {loading ? 'Stopping...' : '⏹ Stop Recording'}
              </button>
            </div>
          )}

          {/* Actions list */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Recorded Actions ({actions.length})
            </h3>
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {actions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {status === 'idle' ? 'Start recording to capture actions' : 'Interact with the page to record actions'}
                </div>
              ) : (
                <div className="divide-y">
                  {actions.map((action, index) => (
                    <div key={action.id} className="flex items-center p-2 hover:bg-gray-50">
                      <span className="w-8 text-center text-gray-400 text-sm">{index + 1}</span>
                      <span className="text-xl mr-2">{actionIcons[action.type] || '❓'}</span>
                      <span className="flex-1 text-sm">{action.description}</span>
                      {status !== 'completed' && (
                        <button
                          onClick={() => handleDeleteAction(action.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generated code preview */}
          {status === 'completed' && generatedCode && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Generated Code</h3>
              <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-auto">
                <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{generatedCode}</pre>
              </div>
            </div>
          )}

          {/* Save form */}
          {status === 'completed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Save as Test File</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="my-test"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <span className="py-2 text-gray-500">.spec.ts</span>
                <button
                  onClick={handleSave}
                  disabled={saving || !fileName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Test'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
            {status === 'completed' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestRecorderModal;
