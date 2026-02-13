/**
 * Recorder Controls Component
 * Start, stop, pause, resume recording controls
 */

import React from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'completed' | 'error';

interface RecorderControlsProps {
  status: RecordingStatus;
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onScreenshot?: () => void;
  disabled?: boolean;
  actionCount?: number;
}

export const RecorderControls: React.FC<RecorderControlsProps> = ({
  status,
  onStart,
  onStop,
  onPause,
  onResume,
  onScreenshot,
  disabled = false,
  actionCount = 0,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
      {/* Status indicator */}
      <div className="flex items-center space-x-3">
        <div
          className={`w-3 h-3 rounded-full ${
            status === 'recording'
              ? 'bg-red-500 animate-pulse'
              : status === 'paused'
              ? 'bg-yellow-500'
              : status === 'completed'
              ? 'bg-green-500'
              : 'bg-gray-400'
          }`}
        />
        <span className="font-medium text-gray-700 capitalize">
          {status === 'idle' ? 'Ready to record' : status}
        </span>
        {actionCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
            {actionCount} action{actionCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex items-center space-x-2">
        {/* Screenshot button - available when recording or paused */}
        {(status === 'recording' || status === 'paused') && onScreenshot && (
          <button
            onClick={onScreenshot}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Take screenshot"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Screenshot</span>
          </button>
        )}

        {/* Start button - available when idle */}
        {status === 'idle' && onStart && (
          <button
            onClick={onStart}
            disabled={disabled}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <div className="w-3 h-3 bg-white rounded-full" />
            <span>Start Recording</span>
          </button>
        )}

        {/* Pause button - available when recording */}
        {status === 'recording' && onPause && (
          <button
            onClick={onPause}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <span>Pause</span>
          </button>
        )}

        {/* Resume button - available when paused */}
        {status === 'paused' && onResume && (
          <button
            onClick={onResume}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Resume</span>
          </button>
        )}

        {/* Stop button - available when recording or paused */}
        {(status === 'recording' || status === 'paused') && onStop && (
          <button
            onClick={onStop}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
            <span>Stop</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RecorderControls;
