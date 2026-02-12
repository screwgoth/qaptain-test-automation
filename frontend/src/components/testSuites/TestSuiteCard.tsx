/**
 * Test Suite Card Component
 * Displays test suite info with file management and run capabilities
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tantml:parameter>
<parameter name="content">import api from '../../services/api';
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

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">{suite.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  suite.isEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {suite.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {suite.description && (
              <p className="text-gray-600 text-sm mt-1">{suite.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center text-gray-600">
            <span className="font-medium mr-2">Files:</span>
            <span>{suite.testFiles?.length || 0}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="font-medium mr-2">Browser:</span>
            <span>{suite.config?.browser || 'chromium'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <span className="font-medium mr-2">Retries:</span>
            <span>{suite.config?.retries || 0}</span>
          </div>
        </div>

        {/* File List */}
        {isExpanded && suite.testFiles && suite.testFiles.length > 0 && (
          <div className="mb-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Test Files:</h4>
            <div className="space-y-2">
              {suite.testFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={file.isEnabled}
                      onChange={(e) =>
                        toggleFileMutation.mutate({
                          fileId: file.id,
                          enabled: e.target.checked,
                        })
                      }
                      className="mr-1"
                    />
                    <span className="font-mono text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.name)}
                    className="text-red-600 hover:text-red-800 ml-2"
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

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsRunTestOpen(true)}
            className="btn btn-primary text-sm"
            disabled={!suite.isEnabled || !suite.testFiles || suite.testFiles.length === 0}
          >
            ▶ Run Tests
          </button>
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="btn btn-secondary text-sm"
          >
            ⚫ Record Test
          </button>
          <button
            onClick={() => setIsFileUploadOpen(true)}
            className="btn btn-secondary text-sm"
          >
            📁 Upload Files
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary text-sm"
          >
            {isExpanded ? 'Hide' : 'Show'} Files
          </button>
          <button
            onClick={() => toggleMutation.mutate(!suite.isEnabled)}
            className="btn btn-secondary text-sm"
          >
            {suite.isEnabled ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-secondary text-sm text-red-600 hover:bg-red-50"
          >
            Delete
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
          onClose={() => setIsRecorderOpen(false)}
        />
      )}
    </>
  );
};

export default TestSuiteCard;
