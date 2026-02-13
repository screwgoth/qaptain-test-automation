/**
 * Apps List Page
 * Display all apps with search, filter, and CRUD operations
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CreateAppModal from '../components/apps/CreateAppModal';
import api from '../services/api';
import { App } from '../types/app';

const Apps = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch apps
  const { data: apps = [], isLoading } = useQuery<App[]>({
    queryKey: ['apps'],
    queryFn: async () => {
      const response = await api.get('/api/apps');
      return response.data.apps || [];
    },
  });

  // Delete app mutation
  const deleteMutation = useMutation({
    mutationFn: async (appId: string) => {
      await api.delete(`/api/apps/${appId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });

  const handleDelete = async (app: App) => {
    if (window.confirm(`Are you sure you want to delete "${app.name}"? This will also delete all test suites and test runs.`)) {
      try {
        await deleteMutation.mutateAsync(app.id);
      } catch (error) {
        console.error('Failed to delete app:', error);
        alert('Failed to delete app. Please try again.');
      }
    }
  };

  // Filter apps by search query
  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-1">
              Manage your test automation applications
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
          >
            + New App
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className="input"
            />
          </div>
        </div>

        {/* Apps Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading apps...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <span className="text-6xl">📱</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchQuery ? 'No apps found' : 'No apps yet'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Get started by creating your first app'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 btn btn-primary"
              >
                + Create App
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/apps/${app.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {app.name}
                    </Link>
                    {app.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {app.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Suites:</span>
                    <span>{app.testSuites?.length || 0}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Environments:</span>
                    <span>{app.environments?.length || 0}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">URL:</span>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline truncate"
                    >
                      {app.url}
                    </a>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <Link
                    to={`/apps/${app.id}`}
                    className="btn btn-secondary flex-1"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(app)}
                    className="btn btn-secondary text-red-600 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create App Modal */}
      {isCreateModalOpen && (
        <CreateAppModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['apps'] });
          }}
        />
      )}
    </Layout>
  );
};

export default Apps;
