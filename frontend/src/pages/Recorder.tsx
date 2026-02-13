/**
 * Recorder Page
 * Playwright Test Recorder UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { RecorderControls, RecordingStatus } from '../components/recorder/RecorderControls';
import { ActionList, RecordedAction } from '../components/recorder/ActionList';
import { CodePreview } from '../components/recorder/CodePreview';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Recorder: React.FC = () => {
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [browserType, setBrowserType] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
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

      // Listen for real-time actions
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

      const response = await api.post('/recorder/start', {
        targetUrl,
        browserType,
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
      const response = await api.post(`/recorder/${sessionId}/stop`);

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
      await api.post(`/recorder/${sessionId}/pause`);
      setStatus('paused');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to pause recording');
    }
  };

  // Resume recording
  const handleResume = async () => {
    if (!sessionId) return;

    try {
      await api.post(`/recorder/${sessionId}/resume`);
      setStatus('recording');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resume recording');
    }
  };

  // Take screenshot
  const handleScreenshot = async () => {
    if (!sessionId) return;

    try {
      await api.post(`/recorder/${sessionId}/screenshot`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to take screenshot');
    }
  };

  // Delete action
  const handleDeleteAction = async (actionId: string) => {
    if (!sessionId) return;

    try {
      await api.delete(`/recorder/${sessionId}/actions/${actionId}`);
      setActions((prev) => prev.filter((a) => a.id !== actionId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete action');
    }
  };

  // Reset recorder
  const handleReset = () => {
    setSessionId(null);
    setStatus('idle');
    setActions([]);
    setGeneratedCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🎬 Test Recorder</h1>
                <p className="text-sm text-gray-500">Record browser interactions and generate Playwright tests</p>
              </div>
            </div>
            {status === 'completed' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  New Recording
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save as Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* URL Input - only when idle */}
        {status === 'idle' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Recording Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target URL
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Browser
                </label>
                <div className="flex space-x-4">
                  {(['chromium', 'firefox', 'webkit'] as const).map((browser) => (
                    <label
                      key={browser}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        browserType === browser
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="browser"
                        value={browser}
                        checked={browserType === browser}
                        onChange={(e) => setBrowserType(e.target.value as typeof browserType)}
                        className="hidden"
                      />
                      <span className="capitalize">{browser}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recorder Controls */}
        <div className="mb-6">
          <RecorderControls
            status={status}
            onStart={handleStart}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
            onScreenshot={handleScreenshot}
            disabled={loading}
            actionCount={actions.length}
          />
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actions panel */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-900">Recorded Actions</h2>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <ActionList
                actions={actions}
                onDelete={status !== 'completed' ? handleDeleteAction : undefined}
              />
            </div>
          </div>

          {/* Code preview panel */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-900">Generated Code</h2>
            </div>
            <div className="p-4">
              <CodePreview code={generatedCode} />
            </div>
          </div>
        </div>

        {/* Tips section - when idle */}
        {status === 'idle' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Recording Tips</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>A browser window will open when you start recording</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>All your clicks, typing, and navigation will be recorded</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>You can pause recording to perform actions you don't want to capture</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>Delete unwanted actions from the list before saving</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>•</span>
                <span>The generated code uses Playwright's best practices for selectors</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveTestModal
          sessionId={sessionId!}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => {
            setShowSaveModal(false);
            navigate('/apps');
          }}
        />
      )}
    </div>
  );
};

// Save Test Modal Component
interface SaveTestModalProps {
  sessionId: string;
  onClose: () => void;
  onSaved: () => void;
}

const SaveTestModal: React.FC<SaveTestModalProps> = ({ sessionId, onClose, onSaved }) => {
  const [suiteId, setSuiteId] = useState('');
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [suites, setSuites] = useState<Array<{ id: string; name: string; app: { name: string } }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load test suites
  useEffect(() => {
    const loadSuites = async () => {
      try {
        const response = await api.get('/test-suites');
        setSuites(response.data.suites || []);
      } catch (err) {
        console.error('Failed to load suites:', err);
      }
    };
    loadSuites();
  }, []);

  const handleSave = async () => {
    if (!suiteId || !fileName) {
      setError('Please select a test suite and enter a file name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post(`/recorder/${sessionId}/save`, {
        suiteId,
        fileName,
        description,
      });

      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Save as Test File</h2>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Suite *
            </label>
            <select
              value={suiteId}
              onChange={(e) => setSuiteId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a test suite...</option>
              {suites.map((suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.app?.name} / {suite.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name *
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="login-flow"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Will be saved as {fileName || 'filename'}.spec.ts
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recorder;
