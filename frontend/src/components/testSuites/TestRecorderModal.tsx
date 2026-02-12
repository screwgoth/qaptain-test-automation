/**
 * Test Recorder Modal (Placeholder)
 * Explains Playwright Inspector for now
 * Will integrate actual recorder later
 */

interface TestRecorderModalProps {
  onClose: () => void;
}

const TestRecorderModal = ({ onClose }: TestRecorderModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Test Recorder</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">🚧 Coming Soon!</h3>
              <p className="text-sm text-yellow-800">
                The integrated test recorder is currently under development. In the meantime,
                you can use Playwright's built-in tools to record tests.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Using Playwright Inspector:</h3>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Option 1: Codegen (Recommended)</strong>
                </p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
npx playwright codegen https://your-app-url.com
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  This opens a browser and records your actions as you interact with the site.
                  Copy the generated code and save it as a .spec.ts file.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Option 2: VS Code Extension</strong>
                </p>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>Install "Playwright Test for VSCode" extension</li>
                  <li>Open your project in VS Code</li>
                  <li>Click "Record new" in the testing sidebar</li>
                  <li>Interact with your app to generate tests</li>
                </ol>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Option 3: Playwright Inspector</strong>
                </p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
PWDEBUG=1 npx playwright test
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  This runs your tests with the inspector open, allowing you to step through
                  and record interactions.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">After Recording:</h4>
              <p className="text-sm text-blue-800">
                Once you have your test file, upload it using the "Upload Files" button in
                your test suite. We support both .spec.ts and .spec.js formats.
              </p>
            </div>

            <div className="text-center pt-4">
              <a
                href="https://playwright.dev/docs/codegen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline text-sm"
              >
                📚 Learn more about Playwright Codegen →
              </a>
            </div>
          </div>

          <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRecorderModal;
