/**
 * Test Run Types
 */

export interface TestRun {
  id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  browser: string;
  workers: number;
  headless: boolean;
  screenshot: string;
  video: string;
  retries: number;
  trigger: string;
  appId: string;
  suiteId: string | null;
  environmentId: string | null;
  userId: string;
  createdAt: string;
  app?: any;
  suite?: any;
  environment?: any;
  testResults?: TestResult[];
}

export interface TestResult {
  id: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  errorMessage: string | null;
  stackTrace: string | null;
  screenshotUrl: string | null;
  videoUrl: string | null;
  retryCount: number;
  runId: string;
  testFileId: string;
  testFile?: {
    id: string;
    name: string;
    path: string;
  };
  createdAt: string;
}

export interface TestRunConfig {
  browser?: 'chromium' | 'firefox' | 'webkit';
  environment?: string;
  retries?: number;
  headless?: boolean;
  parallel?: boolean;
}

export interface CreateTestRunData {
  testSuiteId: string;
  config?: TestRunConfig;
}

export interface TestRunProgress {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentTest?: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
}
