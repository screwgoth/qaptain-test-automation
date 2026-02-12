/**
 * Edit App Modal
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { App, UpdateAppData, AuthConfig } from '../../types/app';

interface EditAppModalProps {
  app: App;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAppModal = ({ app, onClose, onSuccess }: EditAppModalProps) => {
  const [formData, setFormData] = useState<UpdateAppData>({
    name: app.name,
    description: app.description || '',
    repoUrl: app.repoUrl || '',
  });
  const [authConfig, setAuthConfig] = useState<AuthConfig>(
    app.authConfig || { type: 'none' }
  );
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateAppData) => {
      const response = await api.put(`/api/apps/${app.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update app');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const submitData: UpdateAppData = {
      ...(formData.name !== app.name && { name: formData.name.trim() }),
      ...(formData.description !== app.description && { description: formData.description?.trim() || null }),
      ...(formData.repoUrl !== app.repoUrl && { repoUrl: formData.repoUrl?.trim() || null }),
      authConfig,
    };

    updateMutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Edit App</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={updateMutation.isPending}
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
                App Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
                disabled={updateMutation.isPending}
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
                rows={3}
                disabled={updateMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Repository URL
              </label>
              <input
                type="url"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                className="input"
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Auth Type
                </label>
                <select
                  value={authConfig.type}
                  onChange={(e) =>
                    setAuthConfig({ type: e.target.value as AuthConfig['type'], credentials: {} })
                  }
                  className="input"
                  disabled={updateMutation.isPending}
                >
                  <option value="none">None</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="oauth2">OAuth2</option>
                </select>
              </div>

              {authConfig.type === 'basic' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={authConfig.credentials?.username || ''}
                    onChange={(e) =>
                      setAuthConfig({
                        ...authConfig,
                        credentials: { ...authConfig.credentials, username: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authConfig.credentials?.password || ''}
                    onChange={(e) =>
                      setAuthConfig({
                        ...authConfig,
                        credentials: { ...authConfig.credentials, password: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                </div>
              )}

              {authConfig.type === 'bearer' && (
                <input
                  type="text"
                  placeholder="Bearer Token"
                  value={authConfig.credentials?.token || ''}
                  onChange={(e) =>
                    setAuthConfig({
                      ...authConfig,
                      credentials: { token: e.target.value },
                    })
                  }
                  className="input"
                  disabled={updateMutation.isPending}
                />
              )}

              {authConfig.type === 'oauth2' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Client ID"
                    value={authConfig.credentials?.clientId || ''}
                    onChange={(e) =>
                      setAuthConfig({
                        ...authConfig,
                        credentials: { ...authConfig.credentials, clientId: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                  <input
                    type="password"
                    placeholder="Client Secret"
                    value={authConfig.credentials?.clientSecret || ''}
                    onChange={(e) =>
                      setAuthConfig({
                        ...authConfig,
                        credentials: { ...authConfig.credentials, clientSecret: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppModal;
