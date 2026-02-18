/**
 * Test Suite Card Component
 * Displays test suite info with file management and run capabilities
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { TestSuite } from '../../types/app';
import FileUploadModal from './FileUploadModal';
import RunTestModal from './RunTestModal';
import TestRecorderModal from './TestRecorderModal';

interface TestSuiteCardProps {
  suite: TestSuite;
  appId: string;
}

const TestSuiteCard = ({ suite, appId }: TestSuiteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isRunTestOpen, setIsRunTestOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const queryClient = useQueryClient();

  // Delete suite mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/test-suites/${suite.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
    },
  });

  // Toggle suite enabled/disabled
  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await api.put(`/api/test-suites/${suite.id}`, { isEnabled: enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
    },
  });

  // Delete test file
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/api/test-files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
    },
  });

  // Toggle test file enabled/disabled
  const toggleFileMutation = useMutation({
    mutationFn: async ({ fileId, enabled }: { fileId: string; enabled: boolean }) => {
      await api.put(`/api/test-files/${fileId}`, { isEnabled: enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
    },
  });

  const handleDelete = async () => {
    if (window.confirm(`Delete "${suite.name}"? This will also delete all test files.`)) {
      try {
        await deleteMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to delete suite:', error);
        alert('Failed to delete suite');
      }
    }
  };

  const handleDeleteFile = async (fileId: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await deleteFileMutation.mutateAsync(fileId);
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Failed to delete file');
      }
    }
  };

  const enabledFilesCount = suite.testFiles?.filter((f) => f.isEnabled).length || 0;
  const canRun = suite.isEnabled && enabledFilesCount > 0;

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">{suite.name}</h3>
              <span
                className={`badge ${
                  suite.isEnabled ? 'badge-success' : 'badge-default'
                }`}
              >
                {suite.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {suite.description && (
              <p className="text-gray-600 text-sm mt-2">{suite.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">Test Files</div>
            <div className="text-2xl font-semibold text-gray-900">
              {suite.testFiles?.length || 0}
            </div>
            <div className="text-xs text-emerald-600 mt-1">
              {enabledFilesCount} enabled
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-gray-600 mb-1">Browser</div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {suite.config?.browser || 'chromium'}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="text-xs text-gray-600 mb-1">Retries</div>
            <div className="text-2xl font-semibold text-gray-900">
              {suite.config?.retries || 0}
            </div>
          </div>
        </div>

        {/* File List */}
        {isExpanded && suite.testFiles && suite.testFiles.length > 0 && (
          <div className="mb-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              📁 Test Files
            </h4>
            <div className="space-y-2">
              {suite.testFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={file.isEnabled}
                        onChange={(e) =>
                          toggleFileMutation.mutate({
                            fileId: file.id,
                            enabled: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 
                                 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                      />
                    </label>
                    <div className="flex-1">
                      <div className="font-mono text-sm text-gray-900">{file.name}</div>
                      {file.description && (
                        <div className="text-xs text-gray-500 mt-1">{file.description}</div>
                      )}
                    </div>
                    {!file.isEnabled && (
                      <span className="badge badge-default text-xs">Disabled</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.name)}
                    className="ml-3 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning when no enabled files */}
        {suite.isEnabled && enabledFilesCount === 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            ⚠️ No test files enabled. Enable at least one file or upload new files to run tests.
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsRunTestOpen(true)}
            className={`btn ${canRun ? 'btn-primary' : 'btn-ghost'}`}
            disabled={!canRun}
            title={!canRun ? 'Enable the suite and add test files first' : 'Run all enabled tests'}
          >
            ▶️ Run Tests {enabledFilesCount > 0 && `(${enabledFilesCount})`}
          </button>
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="btn btn-secondary"
          >
            🎬 Record Test
          </button>
          <button
            onClick={() => setIsFileUploadOpen(true)}
            className="btn btn-secondary"
          >
            📁 Upload Files
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-ghost"
          >
            {isExpanded ? '🔼 Hide' : '🔽 Show'} Files ({suite.testFiles?.length || 0})
          </button>
          <button
            onClick={() => toggleMutation.mutate(!suite.isEnabled)}
            className="btn btn-ghost"
          >
            {suite.isEnabled ? '⏸️ Disable' : '▶️ Enable'}
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Modals */}
      {isFileUploadOpen && (
        <FileUploadModal
          suiteId={suite.id}
          onClose={() => setIsFileUploadOpen(false)}
          onSuccess={() => {
            setIsFileUploadOpen(false);
            queryClient.invalidateQueries({ queryKey: ['apps', appId] });
          }}
        />
      )}

      {isRunTestOpen && (
        <RunTestModal
          suite={suite}
          onClose={() => setIsRunTestOpen(false)}
        />
      )}

      {isRecorderOpen && (
        <TestRecorderModal
          suiteId={suite.id}
          onClose={() => setIsRecorderOpen(false)}
          onSaved={() => {
            setIsRecorderOpen(false);
            queryClient.invalidateQueries({ queryKey: ['apps', appId] });
          }}
        />
      )}
    </>
  );
};

export default TestSuiteCard;
