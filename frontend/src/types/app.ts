/**
 * Application Types
 */

export interface App {
  id: string;
  name: string;
  description: string | null;
  url: string;
  stagingUrl: string | null;
  productionUrl: string | null;
  authType: 'NONE' | 'BASIC' | 'OAUTH' | 'COOKIES' | 'JWT' | 'CUSTOM';
  authCredentials: any;
  status: 'ACTIVE' | 'ARCHIVED' | 'MAINTENANCE';
  tags: string[];
  environments: Environment[];
  testSuites: TestSuite[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  variables: Record<string, string> | null;
  isDefault: boolean;
  appId: string;
  createdAt: string;
  updatedAt: string;
}

export type EnvironmentType = 'dev' | 'staging' | 'production';

export interface TestSuite {
  id: string;
  name: string;
  description: string | null;
  type: 'SMOKE' | 'REGRESSION' | 'E2E' | 'INTEGRATION' | 'CUSTOM';
  config: TestSuiteSettings | null;
  isEnabled: boolean;
  appId: string;
  testFiles: TestFile[];
  createdAt: string;
  updatedAt: string;
}

export interface TestFile {
  id: string;
  name: string;
  path: string;
  code: string;
  description: string | null;
  tags: string[];
  priority: number;
  estimatedDuration: number | null;
  isEnabled: boolean;
  aiGenerated: boolean;
  suiteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestSuiteSettings {
  browser?: 'chromium' | 'firefox' | 'webkit';
  retries?: number;
  timeout?: number;
  headless?: boolean;
  parallel?: boolean;
}

export interface CreateAppData {
  name: string;
  description?: string;
  url: string;
}

export interface UpdateAppData {
  name?: string;
  description?: string;
  url?: string;
  stagingUrl?: string;
  productionUrl?: string;
  authType?: 'NONE' | 'BASIC' | 'OAUTH' | 'COOKIES' | 'JWT' | 'CUSTOM';
  authCredentials?: any;
}

export interface CreateEnvironmentData {
  name: string;
  baseUrl: string;
  variables?: Record<string, string>;
  isDefault?: boolean;
}

export interface CreateTestSuiteData {
  appId: string;
  name: string;
  description?: string;
  type?: 'SMOKE' | 'REGRESSION' | 'E2E' | 'INTEGRATION' | 'CUSTOM';
  config?: TestSuiteSettings;
}

export interface UploadTestFileData {
  filename: string;
  content: string;
}
