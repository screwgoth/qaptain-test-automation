/**
 * Dashboard Page
 * Overview of apps, recent test runs, and quick stats
 */

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { App } from '../types/app';
import { TestRun } from '../types/testRun';

const Dashboard = () => {
  // Fetch apps
  const { data: apps = [], isLoading: appsLoading } = useQuery<App[]>({
    queryKey: ['apps'],
    queryFn: async () => {
      const response = await api.get('/api/apps');
      return response.data.apps || [];
    },
  });

  // Fetch recent test runs
  const { data: recentRuns = [], isLoading: runsLoading } = useQuery<TestRun[]>({
    queryKey: ['test-runs', 'recent'],
    queryFn: async () => {
      const response = await api.get('/api/test-runs?limit=10');
      return response.data.testRuns || [];
    },
  });

  // Calculate stats
  const totalApps = apps.length;
  const totalSuites = apps.reduce((sum, app) => sum + (app.testSuites?.length || 0), 0);
  const recentRunsCount = recentRuns.length;
  const passRate = recentRuns.length > 0
    ? Math.round(
        (recentRuns.filter((r) => r.status === 'completed').length / recentRuns.length) * 100
      )
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to Qaptain - Your Playwright test automation platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Apps</div>
                <div className="text-3xl font-bold text-blue-900 mt-1">{totalApps}</div>
              </div>
              <div className="text-4xl">📱</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">Test Suites</div>
                <div className="text-3xl font-bold text-purple-900 mt-1">{totalSuites}</div>
              </div>
              <div className="text-4xl">🧪</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Recent Runs</div>
                <div className="text-3xl font-bold text-green-900 mt-1">{recentRunsCount}</div>
              </div>
              <div className="text-4xl">▶️</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-600 font-medium">Pass Rate</div>
                <div className="text-3xl font-bold text-orange-900 mt-1">{passRate}%</div>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/apps" className="btn btn-primary">
              📱 View All Apps
            </Link>
            <Link to="/apps" className="btn btn-secondary">
              + Create New App
            </Link>
          </div>
        </div>

        {/* Recent Apps */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Apps</h2>
            <Link to="/apps" className="text-primary-600 hover:underline text-sm">
              View All →
            </Link>
          </div>

          {appsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl">📱</span>
              <p className="mt-2 text-gray-600">No apps yet. Create your first app to get started!</p>
              <Link to="/apps" className="mt-4 btn btn-primary inline-block">
                + Create App
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {apps.slice(0, 6).map((app) => (
                <Link
                  key={app.id}
                  to={`/apps/${app.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900">{app.name}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    {app.testSuites?.length || 0} test suites
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Test Runs */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Test Runs</h2>

          {runsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl">🧪</span>
              <p className="mt-2 text-gray-600">No test runs yet. Run your first test to see results here!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Passed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Failed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            run.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : run.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : run.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : run.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{run.totalTests}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        {run.passedTests}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-medium">
                        {run.failedTests}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(run.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/test-runs/${run.id}`}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          View Details
                        </Link>
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

export default Dashboard;
