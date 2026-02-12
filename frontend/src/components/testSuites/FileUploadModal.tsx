/**
 * File Upload Modal
 * Drag & drop or select test files to upload
 */

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';

interface FileUploadModalProps {
  suiteId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FileToUpload {
  file: File;
  content: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUploadModal = ({ suiteId, onClose, onSuccess }: FileUploadModalProps) => {
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, content }: { file: File; content: string }) => {
      const response = await api.post(`/api/test-suites/${suiteId}/files`, {
        filename: file.name,
        content,
      });
      return response.data;
    },
  });

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileToUpload[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Only accept .spec.ts and .spec.js files
      if (file.name.match(/\.(spec|test)\.(ts|js)$/)) {
        const content = await file.text();
        newFiles.push({
          file,
          content,
          status: 'pending',
        });
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const uploadFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      if (fileData.status !== 'pending') continue;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        await uploadMutation.mutateAsync({
          file: fileData.file,
          content: fileData.content,
        });

        // Update status to success
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'success' as const } : f
          )
        );
      } catch (error: any) {
        // Update status to error
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error.response?.data?.error || 'Upload failed',
                }
              : f
          )
        );
      }
    }

    // If all successful, close modal
    if (files.every((f) => f.status === 'success' || f.status === 'error')) {
      const hasSuccess = files.some((f) => f.status === 'success');
      if (hasSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const allUploaded = files.length > 0 && files.every((f) => f.status === 'success');
  const hasErrors = files.some((f) => f.status === 'error');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Upload Test Files</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop test files here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Accepts .spec.ts, .spec.js, .test.ts, .test.js files
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".spec.ts,.spec.js,.test.ts,.test.js"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Files to Upload:</h3>
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-sm text-gray-700">
                      {fileData.file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(fileData.file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  {fileData.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {fileData.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  )}

                  {fileData.status === 'success' && (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}

                  {fileData.status === 'error' && (
                    <span className="text-xs text-red-600">{fileData.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              {allUploaded ? 'Close' : 'Cancel'}
            </button>
            {!allUploaded && (
              <button
                onClick={uploadFiles}
                className="btn btn-primary flex-1"
                disabled={files.length === 0 || files.some((f) => f.status === 'uploading')}
              >
                Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
              </button>
            )}
          </div>

          {hasErrors && (
            <p className="mt-2 text-sm text-red-600">
              Some files failed to upload. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
