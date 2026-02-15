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
        (recentRuns.filter((r) => r.status === 'COMPLETED').length / recentRuns.length) * 100
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

  const getStatusBadge = (status: string) => {
    const badges = {
      COMPLETED: 'badge-success',
      RUNNING: 'badge-info',
      FAILED: 'badge-error',
      CANCELLED: 'badge-default',
      QUEUED: 'badge-warning',
    };
    return badges[status as keyof typeof badges] || 'badge-default';
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-100">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Welcome to Qaptain - Your Playwright test automation platform
          </p>
        </div>

        {/* Stats Cards - Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card from-primary-500/10 to-primary-600/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400 font-medium mb-1">Total Apps</div>
                <div className="text-4xl font-display font-bold text-slate-100">{totalApps}</div>
                <div className="text-xs text-primary-400 mt-2 font-medium">Active applications</div>
              </div>
              <div className="text-5xl opacity-20">📱</div>
            </div>
          </div>

          <div className="stat-card from-purple-500/10 to-purple-600/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400 font-medium mb-1">Test Suites</div>
                <div className="text-4xl font-display font-bold text-slate-100">{totalSuites}</div>
                <div className="text-xs text-purple-400 mt-2 font-medium">Configured suites</div>
              </div>
              <div className="text-5xl opacity-20">🧪</div>
            </div>
          </div>

          <div className="stat-card from-emerald-500/10 to-emerald-600/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400 font-medium mb-1">Recent Runs</div>
                <div className="text-4xl font-display font-bold text-slate-100">{recentRunsCount}</div>
                <div className="text-xs text-emerald-400 mt-2 font-medium">Last 10 executions</div>
              </div>
              <div className="text-5xl opacity-20">▶️</div>
            </div>
          </div>

          <div className="stat-card from-amber-500/10 to-amber-600/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400 font-medium mb-1">Pass Rate</div>
                <div className="text-4xl font-display font-bold text-slate-100">{passRate}%</div>
                <div className="text-xs text-amber-400 mt-2 font-medium">Success percentage</div>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-2xl font-display font-semibold text-slate-100 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/apps" className="btn btn-primary">
              📱 View All Apps
            </Link>
            <Link to="/apps" className="btn btn-secondary">
              + Create New App
            </Link>
            <Link to="/recorder" className="btn btn-ghost">
              🎬 Open Recorder
            </Link>
          </div>
        </div>

        {/* Recent Apps */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-semibold text-slate-100">Your Apps</h2>
            <Link to="/apps" className="link text-sm font-medium">
              View All →
            </Link>
          </div>

          {appsLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner w-10 h-10"></div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-7xl opacity-30">📱</span>
              <p className="mt-4 text-slate-400 text-lg">No apps yet. Create your first app to get started!</p>
              <Link to="/apps" className="mt-6 btn btn-primary inline-flex">
                + Create App
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.slice(0, 6).map((app) => (
                <Link
                  key={app.id}
                  to={`/apps/${app.id}`}
                  className="group p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl 
                           hover:border-primary-500/50 hover:bg-slate-800/60 
                           transition-all duration-200 hover:shadow-glass"
                >
                  <h3 className="font-semibold text-slate-100 group-hover:text-primary-400 transition-colors">
                    {app.name}
                  </h3>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      🧪 {app.testSuites?.length || 0} suites
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Test Runs */}
        <div className="card">
          <h2 className="text-2xl font-display font-semibold text-slate-100 mb-6">Recent Test Runs</h2>

          {runsLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner w-10 h-10"></div>
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-7xl opacity-30">🧪</span>
              <p className="mt-4 text-slate-400 text-lg">No test runs yet. Run your first test to see results here!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Tests</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run) => (
                    <tr key={run.id}>
                      <td>
                        <span className={`badge ${getStatusBadge(run.status)} flex items-center gap-2 w-fit`}>
                          <span className={`status-dot status-${run.status.toLowerCase()}`}></span>
                          {run.status}
                        </span>
                      </td>
                      <td className="font-mono font-semibold">{run.totalTests}</td>
                      <td>
                        <span className="text-emerald-400 font-semibold font-mono">{run.passed || 0}</span>
                      </td>
                      <td>
                        <span className="text-red-400 font-semibold font-mono">{run.failed || 0}</span>
                      </td>
                      <td className="text-slate-400">{formatDate(run.createdAt)}</td>
                      <td>
                        <Link to={`/test-runs/${run.id}`} className="link text-sm">
                          View Details →
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
