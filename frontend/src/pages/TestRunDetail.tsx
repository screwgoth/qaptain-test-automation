/**
 * Test Run Detail Page
 * Real-time test execution monitoring with WebSocket updates
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';
import socketService from '../services/socket';
import { TestRun, TestResult } from '../types/testRun';

const TestRunDetail = () => {
  const { runId } = useParams<{ runId: string }>();
  const queryClient = useQueryClient();
  const [liveResults, setLiveResults] = useState<TestResult[]>([]);

  // Fetch test run details
  const { data: testRun, isLoading } = useQuery<TestRun>({
    queryKey: ['test-runs', runId],
    queryFn: async () => {
      const response = await api.get(`/api/test-runs/${runId}`);
      return response.data.testRun;
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      // Stop refetching if run is complete
      const data = query.state.data;
      return data && ['completed', 'failed', 'cancelled'].includes(data.status) ? false : 3000;
    },
  });

  // Cancel test run mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/test-runs/${runId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-runs', runId] });
    },
  });

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!runId) return;

    socketService.connect();
    socketService.joinTestRun(runId);

    const handleProgress = (data: any) => {
      console.log('Test run progress:', data);
      queryClient.invalidateQueries({ queryKey: ['test-runs', runId] });
    };

    const handleComplete = (data: any) => {
      console.log('Test run complete:', data);
      queryClient.invalidateQueries({ queryKey: ['test-runs', runId] });
    };

    socketService.onTestRunProgress(handleProgress);
    socketService.onTestRunComplete(handleComplete);

    return () => {
      socketService.leaveTestRun(runId);
      socketService.offTestRunProgress(handleProgress);
      socketService.offTestRunComplete(handleComplete);
    };
  }, [runId, queryClient]);

  // Update live results when testRun changes
  useEffect(() => {
    if (testRun?.testResults) {
      setLiveResults(testRun.testResults);
    }
  }, [testRun]);

  const handleCancel = async () => {
    if (window.confirm('Cancel this test run?')) {
      try {
        await cancelMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to cancel test run:', error);
        alert('Failed to cancel test run');
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test run...</p>
        </div>
      </Layout>
    );
  }

  if (!testRun) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Test run not found</h2>
          <Link to="/apps" className="mt-4 btn btn-primary inline-block">
            Back to Apps
          </Link>
        </div>
      </Layout>
    );
  }

  const isRunning = testRun.status === 'RUNNING' || testRun.status === 'QUEUED';
  const progressPercent = testRun.totalTests > 0 
    ? Math.round(((testRun.passed || 0) + (testRun.failed || 0) + (testRun.skipped || 0)) / testRun.totalTests * 100)
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Run</h1>
            <p className="text-gray-600 mt-1">Run ID: {testRun.id}</p>
          </div>
          {isRunning && (
            <button
              onClick={handleCancel}
              className="btn btn-secondary text-red-600 hover:bg-red-50"
              disabled={cancelMutation.isPending}
            >
              Cancel Run
            </button>
          )}
        </div>

        {/* Status Card */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    testRun.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : testRun.status === 'RUNNING'
                      ? 'bg-blue-100 text-blue-800'
                      : testRun.status === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : testRun.status === 'CANCELLED'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {testRun.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Progress</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{progressPercent}%</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Browser</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {testRun.browser || 'chromium'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {testRun.durationMs
                  ? `${Math.round(testRun.durationMs / 1000)}s`
                  : isRunning
                  ? 'Running...'
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Tests</div>
            <div className="text-3xl font-bold text-blue-900 mt-1">
              {testRun.totalTests}
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <div className="text-sm text-green-600 font-medium">Passed</div>
            <div className="text-3xl font-bold text-green-900 mt-1">
              {testRun.passed || 0}
            </div>
          </div>

          <div className="card bg-red-50 border-red-200">
            <div className="text-sm text-red-600 font-medium">Failed</div>
            <div className="text-3xl font-bold text-red-900 mt-1">
              {testRun.failed || 0}
            </div>
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="text-sm text-gray-600 font-medium">Skipped</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {testRun.skipped || 0}
            </div>
          </div>
        </div>

        {/* Live Results */}
        {isRunning && (
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-pulse w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="font-semibold text-blue-900">Live Results</span>
            </div>
            <p className="text-sm text-blue-700">
              Test results will appear here in real-time as tests execute...
            </p>
          </div>
        )}

        {/* Test Results Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>

          {liveResults.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              {isRunning ? 'Waiting for test results...' : 'No results available'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liveResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.testFile?.name || `Test ${result.id.slice(0, 8)}`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            result.status === 'PASSED'
                              ? 'bg-green-100 text-green-800'
                              : result.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Math.round(result.durationMs)}ms
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {result.errorMessage && (
                          <details className="cursor-pointer">
                            <summary className="text-red-600 hover:underline">
                              View Error
                            </summary>
                            <div className="mt-2 p-3 bg-red-50 rounded text-xs">
                              <div className="font-mono text-red-900">{result.errorMessage}</div>
                              {result.stackTrace && (
                                <pre className="mt-2 text-red-800 overflow-x-auto">
                                  {result.stackTrace}
                                </pre>
                              )}
                            </div>
                          </details>
                        )}
                        {result.screenshotUrl && (
                          <a
                            href={result.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline ml-2"
                          >
                            📸 Screenshot
                          </a>
                        )}
                        {result.videoUrl && (
                          <a
                            href={result.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline ml-2"
                          >
                            🎥 Video
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestRunDetail;
