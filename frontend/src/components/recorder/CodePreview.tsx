/**
 * Code Preview Component
 * Displays generated Playwright code with syntax highlighting
 */

import React, { useState } from 'react';

interface CodePreviewProps {
  code: string;
  onCopy?: () => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Simple syntax highlighting
  const highlightCode = (code: string): string => {
    return code
      // Keywords
      .replace(/\b(import|from|export|const|let|var|async|await|function|return|if|else|for|while)\b/g, '<span class="text-purple-600 font-medium">$1</span>')
      // Strings
      .replace(/'([^'\\]|\\.)*'/g, '<span class="text-green-600">$&</span>')
      .replace(/`([^`\\]|\\.)*`/g, '<span class="text-green-600">$&</span>')
      // Comments
      .replace(/\/\/.*/g, '<span class="text-gray-400 italic">$&</span>')
      // Function calls
      .replace(/\b(test|expect|page|locator)\b/g, '<span class="text-blue-600">$1</span>')
      // Methods
      .replace(/\.(goto|click|fill|press|selectOption|check|uncheck|hover|screenshot)\b/g, '.<span class="text-amber-600">$1</span>');
  };

  if (!code) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
        <div className="text-4xl mb-4">📝</div>
        <p>Code will be generated when you stop recording.</p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-3 text-sm text-gray-400">recorded-test.spec.ts</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-auto max-h-96">
        <pre className="p-4 text-sm leading-relaxed">
          <code
            className="text-gray-100 font-mono"
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          />
        </pre>
      </div>

      {/* Line numbers overlay */}
      <div className="absolute left-0 top-10 bottom-0 w-10 bg-gray-800/50 pointer-events-none">
        <div className="p-4 text-xs text-gray-500 font-mono leading-relaxed">
          {code.split('\n').map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodePreview;
