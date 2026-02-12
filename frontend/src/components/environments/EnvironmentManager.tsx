/**
 * Environment Manager Component
 * Manage environments for an app
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Environment, CreateEnvironmentData } from '../../types/app';

interface EnvironmentManagerProps {
  appId: string;
  environments: Environment[];
}

const EnvironmentManager = ({ appId, environments }: EnvironmentManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateEnvironmentData>({
    name: '',
    type: 'dev',
    baseUrl: '',
    variables: {},
  });
  const [variableKey, setVariableKey] = useState('');
  const [variableValue, setVariableValue] = useState('');
  const queryClient = useQueryClient();

  // Create environment mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateEnvironmentData) => {
      await api.post(`/api/apps/${appId}/environments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
      resetForm();
    },
  });

  // Update environment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Environment> }) => {
      await api.put(`/api/environments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
      setEditingId(null);
      resetForm();
    },
  });

  // Delete environment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/environments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', appId] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'dev',
      baseUrl: '',
      variables: {},
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const startEdit = (env: Environment) => {
    setEditingId(env.id);
    setFormData({
      name: env.name,
      type: env.type,
      baseUrl: env.baseUrl,
      variables: env.variables || {},
    });
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete environment "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const addVariable = () => {
    if (variableKey && variableValue) {
      setFormData({
        ...formData,
        variables: {
          ...formData.variables,
          [variableKey]: variableValue,
        },
      });
      setVariableKey('');
      setVariableValue('');
    }
  };

  const removeVariable = (key: string) => {
    const newVars = { ...formData.variables };
    delete newVars[key];
    setFormData({ ...formData, variables: newVars });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Environments</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
          >
            + Add Environment
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Environment' : 'New Environment'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Production"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="input"
                  required
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="input"
                placeholder="https://app.example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Environment Variables
              </label>
              
              {/* Existing Variables */}
              {Object.entries(formData.variables || {}).length > 0 && (
                <div className="space-y-2 mb-3">
                  {Object.entries(formData.variables || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 bg-white rounded">
                      <span className="font-mono text-sm flex-1">
                        {key} = {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariable(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Variable */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={variableKey}
                  onChange={(e) => setVariableKey(e.target.value)}
                  className="input flex-1"
                  placeholder="KEY"
                />
                <input
                  type="text"
                  value={variableValue}
                  onChange={(e) => setVariableValue(e.target.value)}
                  className="input flex-1"
                  placeholder="value"
                />
                <button
                  type="button"
                  onClick={addVariable}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? 'Save Changes' : 'Create Environment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Environment List */}
      {environments.length === 0 && !isCreating ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <span className="text-6xl">🌍</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No environments yet</h3>
          <p className="mt-2 text-gray-600">
            Create environments to organize test runs by dev, staging, and production
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 btn btn-primary"
          >
            + Add Environment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environments.map((env) => (
            <div key={env.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                      env.type === 'prod'
                        ? 'bg-red-100 text-red-800'
                        : env.type === 'staging'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {env.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div>
                  <span className="font-medium text-gray-700">Base URL:</span>
                  <a
                    href={env.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary-600 hover:underline break-all"
                  >
                    {env.baseUrl}
                  </a>
                </div>
                {env.variables && Object.keys(env.variables).length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Variables:</span>
                    <span className="ml-2 text-gray-600">
                      {Object.keys(env.variables).length}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(env)}
                  className="btn btn-secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(env.id, env.name)}
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
  );
};

export default EnvironmentManager;
