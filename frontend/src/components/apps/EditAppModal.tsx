/**
 * Edit App Modal
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { App, UpdateAppData } from '../../types/app';

interface EditAppModalProps {
  app: App;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAppModal = ({ app, onClose, onSuccess }: EditAppModalProps) => {
  const [formData, setFormData] = useState<UpdateAppData>({
    name: app.name,
    description: app.description || '',
    url: app.url || '',
    stagingUrl: app.stagingUrl || '',
    productionUrl: app.productionUrl || '',
    authType: app.authType || 'NONE',
    authCredentials: app.authCredentials || {},
  });
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
      ...(formData.name !== app.name && formData.name && { name: formData.name.trim() }),
      ...(formData.description !== app.description && { description: formData.description?.trim() || undefined }),
      ...(formData.url !== app.url && { url: formData.url?.trim() || undefined }),
      ...(formData.stagingUrl !== app.stagingUrl && { stagingUrl: formData.stagingUrl?.trim() || undefined }),
      ...(formData.productionUrl !== app.productionUrl && { productionUrl: formData.productionUrl?.trim() || undefined }),
      authType: formData.authType,
      authCredentials: formData.authCredentials,
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
                Development/Default URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input"
                disabled={updateMutation.isPending}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Staging URL
              </label>
              <input
                type="url"
                value={formData.stagingUrl || ''}
                onChange={(e) => setFormData({ ...formData, stagingUrl: e.target.value })}
                className="input"
                placeholder="https://staging.example.com"
                disabled={updateMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Production URL
              </label>
              <input
                type="url"
                value={formData.productionUrl || ''}
                onChange={(e) => setFormData({ ...formData, productionUrl: e.target.value })}
                className="input"
                placeholder="https://example.com"
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
                  value={formData.authType}
                  onChange={(e) => setFormData({ ...formData, authType: e.target.value as any, authCredentials: {} })}
                  className="input"
                  disabled={updateMutation.isPending}
                >
                  <option value="NONE">None</option>
                  <option value="BASIC">Basic Auth</option>
                  <option value="JWT">JWT Token</option>
                  <option value="OAUTH">OAuth</option>
                  <option value="COOKIES">Cookies</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              {formData.authType === 'BASIC' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.authCredentials?.username || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authCredentials: { ...formData.authCredentials, username: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.authCredentials?.password || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authCredentials: { ...formData.authCredentials, password: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                </div>
              )}

              {formData.authType === 'JWT' && (
                <input
                  type="text"
                  placeholder="JWT Token"
                  value={formData.authCredentials?.token || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      authCredentials: { token: e.target.value },
                    })
                  }
                  className="input"
                  disabled={updateMutation.isPending}
                />
              )}

              {formData.authType === 'OAUTH' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Client ID"
                    value={formData.authCredentials?.clientId || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authCredentials: { ...formData.authCredentials, clientId: e.target.value },
                      })
                    }
                    className="input"
                    disabled={updateMutation.isPending}
                  />
                  <input
                    type="password"
                    placeholder="Client Secret"
                    value={formData.authCredentials?.clientSecret || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authCredentials: { ...formData.authCredentials, clientSecret: e.target.value },
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
