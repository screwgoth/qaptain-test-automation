/**
 * Test Run Types
 */

export interface TestRun {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  environment: string | null;
  browser: string;
  testSuiteId: string;
  userId: string;
  results: TestResult[];
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error: string | null;
  stackTrace: string | null;
  screenshots: string[];
  videos: string[];
  testRunId: string;
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
