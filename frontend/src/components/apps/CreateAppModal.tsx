/**
 * Create App Modal
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { CreateAppData } from '../../types/app';

interface CreateAppModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAppModal = ({ onClose, onSuccess }: CreateAppModalProps) => {
  const [formData, setFormData] = useState<CreateAppData>({
    name: '',
    description: '',
    url: '',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data: CreateAppData) => {
      const response = await api.post('/api/apps', data);
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create app');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('App name is required');
      return;
    }

    const submitData: CreateAppData = {
      name: formData.name.trim(),
      url: formData.url.trim() || 'https://example.com',
      ...(formData.description?.trim() && { description: formData.description.trim() }),
    };

    createMutation.mutate(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create New App</h2>
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
                App Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="My Awesome App"
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
                rows={3}
                placeholder="Brief description of your app..."
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                App URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input"
                placeholder="https://app.example.com"
                required
                disabled={createMutation.isPending}
              />
              <p className="mt-1 text-xs text-gray-500">
                The default/development URL for your application
              </p>
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
                {createMutation.isPending ? 'Creating...' : 'Create App'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAppModal;
