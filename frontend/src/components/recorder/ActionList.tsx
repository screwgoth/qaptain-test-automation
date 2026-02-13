/**
 * Action List Component
 * Displays recorded actions with edit/delete capabilities
 */

import React from 'react';

export interface RecordedAction {
  id: string;
  type: 'click' | 'fill' | 'press' | 'navigate' | 'select' | 'check' | 'uncheck' | 'hover' | 'screenshot' | 'assert';
  selector?: string;
  value?: string;
  url?: string;
  key?: string;
  timestamp: number;
  description: string;
}

interface ActionListProps {
  actions: RecordedAction[];
  onDelete?: (actionId: string) => void;
  onEdit?: (action: RecordedAction) => void;
}

const actionIcons: Record<string, string> = {
  click: '👆',
  fill: '⌨️',
  press: '⏎',
  navigate: '🔗',
  select: '📋',
  check: '☑️',
  uncheck: '⬜',
  hover: '🖱️',
  screenshot: '📸',
  assert: '✅',
};

const actionColors: Record<string, string> = {
  click: 'bg-blue-50 border-blue-200',
  fill: 'bg-purple-50 border-purple-200',
  press: 'bg-yellow-50 border-yellow-200',
  navigate: 'bg-green-50 border-green-200',
  select: 'bg-orange-50 border-orange-200',
  check: 'bg-teal-50 border-teal-200',
  uncheck: 'bg-gray-50 border-gray-200',
  hover: 'bg-pink-50 border-pink-200',
  screenshot: 'bg-indigo-50 border-indigo-200',
  assert: 'bg-emerald-50 border-emerald-200',
};

export const ActionList: React.FC<ActionListProps> = ({ actions, onDelete, onEdit }) => {
  if (actions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🎬</div>
        <p>No actions recorded yet.</p>
        <p className="text-sm mt-2">Start interacting with the page to record actions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <div
          key={action.id}
          className={`flex items-center p-3 rounded-lg border ${actionColors[action.type] || 'bg-gray-50 border-gray-200'} hover:shadow-sm transition-shadow`}
        >
          {/* Step number */}
          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-medium text-gray-600 border shadow-sm">
            {index + 1}
          </div>

          {/* Action icon */}
          <div className="flex-shrink-0 ml-3 text-2xl">
            {actionIcons[action.type] || '❓'}
          </div>

          {/* Action details */}
          <div className="flex-1 ml-3 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {action.description}
            </div>
            {action.selector && (
              <div className="text-xs text-gray-500 truncate font-mono mt-1">
                {action.selector}
              </div>
            )}
          </div>

          {/* Action type badge */}
          <div className="flex-shrink-0 ml-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-700 border">
              {action.type}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 ml-3 flex space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(action)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit action"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(action.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete action"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionList;
