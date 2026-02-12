/**
 * Run Test Modal
 * Configure and execute test runs
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { TestSuite } from '../../types/app';
import { TestRunConfig } from '../../types/testRun';

interface RunTestModalProps {
  suite: TestSuite;
  onClose: () => void;
}

const RunTestModal = ({ suite, onClose }: RunTestModalProps) => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TestRunConfig>({
    browser: suite.config?.browser || 'chromium',
    environment: undefined,
    retries: suite.config?.retries || 2,
    headless: suite.config?.headless !== false,
    parallel: suite.config?.parallel || false,
  });
  const [error, setError] = useState('');

  // Fetch environments for this app
  const { data: environments = [] } = useQuery({
    queryKey: ['apps', suite.appId, 'environments'],
    queryFn: async () => {
      const response = await api.get(`/api/apps/${suite.appId}`);
      return response.data.environments || [];
    },
  });

  const runMutation = useMutation({
    mutationFn: async (data: { testSuiteId: string; config: TestRunConfig }) => {
      const response = await api.post('/api/test-runs', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Navigate to the test run page
      navigate(`/test-runs/${data.id}`);
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to start test run');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    runMutation.mutate({
      testSuiteId: suite.id,
      config,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Run Tests</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={runMutation.isPending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-900">{suite.name}</div>
            <div className="text-sm text-blue-700 mt-1">
              {suite.testFiles?.filter((f) => f.isEnabled).length || 0} test files enabled
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Browser
              </label>
              <select
                value={config.browser}
                onChange={(e) => setConfig({ ...config, browser: e.target.value as any })}
                className="input"
                disabled={runMutation.isPending}
              >
                <option value="chromium">Chromium</option>
                <option value="firefox">Firefox</option>
                <option value="webkit">WebKit</option>
              </select>
            </div>

            {environments.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Environment (Optional)
                </label>
                <select
                  value={config.environment || ''}
                  onChange={(e) =>
                    setConfig({ ...config, environment: e.target.value || undefined })
                  }
                  className="input"
                  disabled={runMutation.isPending}
                >
                  <option value="">Default</option>
                  {environments.map((env: any) => (
                    <option key={env.id} value={env.name}>
                      {env.name} ({env.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Retries on Failure
              </label>
              <input
                type="number"
                value={config.retries}
                onChange={(e) => setConfig({ ...config, retries: parseInt(e.target.value) })}
                className="input"
                min="0"
                max="5"
                disabled={runMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.headless}
                  onChange={(e) => setConfig({ ...config, headless: e.target.checked })}
                  className="mr-2"
                  disabled={runMutation.isPending}
                />
                <span className="text-sm font-medium text-gray-700">Headless Mode</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.parallel}
                  onChange={(e) => setConfig({ ...config, parallel: e.target.checked })}
                  className="mr-2"
                  disabled={runMutation.isPending}
                />
                <span className="text-sm font-medium text-gray-700">Parallel Execution</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={runMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={runMutation.isPending}
              >
                {runMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </span>
                ) : (
                  '▶ Run Tests'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RunTestModal;
