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
      return response.data.app?.environments || [];
    },
  });

  const runMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Submitting test run:', data);
      const response = await api.post('/api/test-runs', data);
      console.log('Test run response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Test run started successfully:', data);
      // Navigate to the test run page
      navigate(`/test-runs/${data.testRun.id}`);
      onClose();
    },
    onError: (err: any) => {
      console.error('Test run error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start test run');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Get environment ID if selected
    const selectedEnv = environments.find((env: any) => env.name === config.environment);

    const payload = {
      appId: suite.appId,
      suiteId: suite.id,
      environmentId: selectedEnv?.id,
      browser: config.browser,
      workers: config.parallel ? 4 : 1,
      retries: config.retries,
      headless: config.headless,
      screenshot: 'on-failure',
      video: 'on-failure',
    };

    console.log('Starting test run with config:', payload);
    runMutation.mutate(payload);
  };

  const enabledFilesCount = suite.testFiles?.filter((f) => f.isEnabled).length || 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-100">▶️ Run Tests</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
              disabled={runMutation.isPending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
            <div className="font-semibold text-primary-300 flex items-center gap-2">
              🧪 {suite.name}
            </div>
            <div className="text-sm text-slate-400 mt-2">
              {enabledFilesCount} test file{enabledFilesCount !== 1 ? 's' : ''} enabled
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <div className="font-semibold mb-1">❌ Error</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                Browser
              </label>
              <select
                value={config.browser}
                onChange={(e) => setConfig({ ...config, browser: e.target.value as any })}
                className="select"
                disabled={runMutation.isPending}
              >
                <option value="chromium">Chromium</option>
                <option value="firefox">Firefox</option>
                <option value="webkit">WebKit</option>
              </select>
            </div>

            {environments.length > 0 && (
              <div>
                <label className="label">
                  Environment (Optional)
                </label>
                <select
                  value={config.environment || ''}
                  onChange={(e) =>
                    setConfig({ ...config, environment: e.target.value || undefined })
                  }
                  className="select"
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
              <label className="label">
                Retries on Failure
              </label>
              <input
                type="number"
                value={config.retries}
                onChange={(e) => setConfig({ ...config, retries: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="5"
                disabled={runMutation.isPending}
              />
              <p className="text-xs text-slate-500 mt-1">Number of times to retry failed tests</p>
            </div>

            <div className="space-y-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.headless}
                  onChange={(e) => setConfig({ ...config, headless: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 
                           focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  disabled={runMutation.isPending}
                />
                <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-slate-200">
                  Headless Mode
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.parallel}
                  onChange={(e) => setConfig({ ...config, parallel: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 
                           focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  disabled={runMutation.isPending}
                />
                <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-slate-200">
                  Parallel Execution (4 workers)
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost flex-1"
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
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner w-4 h-4"></div>
                    Starting...
                  </span>
                ) : (
                  '▶️ Run Tests'
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
