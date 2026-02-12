/**
 * Create Test Suite Modal
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { CreateTestSuiteData, TestSuiteSettings } from '../../types/app';

interface CreateTestSuiteModalProps {
  appId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTestSuiteModal = ({ appId, onClose, onSuccess }: CreateTestSuiteModalProps) => {
  const [formData, setFormData] = useState<CreateTestSuiteData>({
    name: '',
    description: '',
    settings: {
      browser: 'chromium',
      retries: 2,
      timeout: 30000,
      headless: true,
      parallel: false,
    },
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data: CreateTestSuiteData) => {
      const response = await api.post(`/api/apps/${appId}/test-suites`, data);
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create test suite');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Suite name is required');
      return;
    }

    createMutation.mutate(formData);
  };

  const updateSettings = (key: keyof TestSuiteSettings, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create Test Suite</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={createMutation.isPending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Suite Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Smoke Tests"
                required
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={2}
                placeholder="Quick smoke tests to verify basic functionality..."
                disabled={createMutation.isPending}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Browser
                  </label>
                  <select
                    value={formData.settings?.browser}
                    onChange={(e) => updateSettings('browser', e.target.value)}
                    className="input"
                    disabled={createMutation.isPending}
                  >
                    <option value="chromium">Chromium</option>
                    <option value="firefox">Firefox</option>
                    <option value="webkit">WebKit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Retries
                  </label>
                  <input
                    type="number"
                    value={formData.settings?.retries}
                    onChange={(e) => updateSettings('retries', parseInt(e.target.value))}
                    className="input"
                    min="0"
                    max="5"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.settings?.timeout}
                    onChange={(e) => updateSettings('timeout', parseInt(e.target.value))}
                    className="input"
                    step="1000"
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings?.headless}
                      onChange={(e) => updateSettings('headless', e.target.checked)}
                      className="mr-2"
                      disabled={createMutation.isPending}
                    />
                    <span className="text-sm font-medium text-gray-700">Headless Mode</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings?.parallel}
                      onChange={(e) => updateSettings('parallel', e.target.checked)}
                      className="mr-2"
                      disabled={createMutation.isPending}
                    />
                    <span className="text-sm font-medium text-gray-700">Parallel Execution</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={createMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Suite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTestSuiteModal;
