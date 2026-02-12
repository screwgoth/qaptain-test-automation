/**
 * App Detail Page
 * Shows app info, test suites, environments, and management options
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import EditAppModal from '../components/apps/EditAppModal';
import CreateTestSuiteModal from '../components/testSuites/CreateTestSuiteModal';
import TestSuiteCard from '../components/testSuites/TestSuiteCard';
import EnvironmentManager from '../components/environments/EnvironmentManager';
import api from '../services/api';
import { App } from '../types/app';

const AppDetail = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateSuiteModalOpen, setIsCreateSuiteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'suites' | 'environments'>('suites');

  // Fetch app details
  const { data: app, isLoading } = useQuery<App>({
    queryKey: ['apps', appId],
    queryFn: async () => {
      const response = await api.get(`/api/apps/${appId}`);
      return response.data;
    },
    enabled: !!appId,
  });

  // Delete app mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/apps/${appId}`);
    },
    onSuccess: () => {
      navigate('/apps');
    },
  });

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${app?.name}"? This action cannot be undone.`)) {
      try {
        await deleteMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to delete app:', error);
        alert('Failed to delete app. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading app details...</p>
        </div>
      </Layout>
    );
  }

  if (!app) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">App not found</h2>
          <p className="mt-2 text-gray-600">The app you're looking for doesn't exist.</p>
          <Link to="/apps" className="mt-4 btn btn-primary inline-block">
            Back to Apps
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600">
          <Link to="/apps" className="hover:text-primary-600">Apps</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{app.name}</span>
        </div>

        {/* App Header */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{app.name}</h1>
              {app.description && (
                <p className="mt-2 text-gray-600">{app.description}</p>
              )}
              {app.repoUrl && (
                <a
                  href={app.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-primary-600 hover:underline"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Repository
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-secondary"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-secondary text-red-600 hover:bg-red-50"
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600">Test Suites</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {app.testSuites?.length || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Environments</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {app.environments?.length || 0}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Auth Type</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {app.authConfig?.type || 'none'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('suites')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suites'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Test Suites
            </button>
            <button
              onClick={() => setActiveTab('environments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'environments'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Environments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'suites' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Test Suites</h2>
              <button
                onClick={() => setIsCreateSuiteModalOpen(true)}
                className="btn btn-primary"
              >
                + New Suite
              </button>
            </div>

            {app.testSuites && app.testSuites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {app.testSuites.map((suite) => (
                  <TestSuiteCard key={suite.id} suite={suite} appId={app.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <span className="text-6xl">🧪</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No test suites yet</h3>
                <p className="mt-2 text-gray-600">Create your first test suite to get started</p>
                <button
                  onClick={() => setIsCreateSuiteModalOpen(true)}
                  className="mt-4 btn btn-primary"
                >
                  + Create Test Suite
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'environments' && (
          <EnvironmentManager appId={app.id} environments={app.environments || []} />
        )}
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditAppModal
          app={app}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['apps', appId] });
          }}
        />
      )}

      {isCreateSuiteModalOpen && (
        <CreateTestSuiteModal
          appId={app.id}
          onClose={() => setIsCreateSuiteModalOpen(false)}
          onSuccess={() => {
            setIsCreateSuiteModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['apps', appId] });
          }}
        />
      )}
    </Layout>
  );
};

export default AppDetail;
