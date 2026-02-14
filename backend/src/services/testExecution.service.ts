/**
 * Test Execution Service
 * Handles Playwright test execution
 */

import { chromium, firefox, webkit, Browser, BrowserContext } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { io } from '../index';

const execPromise = promisify(exec);

/**
 * Execute a test run
 */
export async function executeTestRun(testRunId: string): Promise<void> {
  const testRun = await prisma.testRun.findUnique({
    where: { id: testRunId },
    include: {
      app: true,
      suite: {
        include: {
          testFiles: {
            where: { isEnabled: true },
          },
        },
      },
      environment: true,
    },
  });

  if (!testRun) {
    throw new Error(`Test run ${testRunId} not found`);
  }

  logger.info(`Starting test run ${testRunId}`, {
    app: testRun.app.name,
    suite: testRun.suite?.name,
    browser: testRun.browser,
  });

  // Get test files to execute
  const testFiles = testRun.suite?.testFiles || [];
  
  if (testFiles.length === 0) {
    logger.warn(`No test files found for test run ${testRunId}`);
    await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalTests: 0,
      },
    });
    return;
  }

  // Launch browser
  const browser = await launchBrowser(testRun.browser, testRun.headless);
  
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const startTime = Date.now();

  try {
    // Create browser context
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ...(testRun.screenshot === 'always' && { recordVideo: { dir: './recordings' } }),
    });

    // Execute each test file
    for (const testFile of testFiles) {
      try {
        logger.info(`Executing test: ${testFile.name}`);

        // Emit real-time update via WebSocket
        io.to(testRunId).emit('test-start', {
          testRunId,
          testFileId: testFile.id,
          testName: testFile.name,
        });

        const testStartTime = Date.now();

        // Execute the test (placeholder - actual execution would eval the test code)
        const result = await executeTestFile(context, testFile, testRun);

        const testDuration = Date.now() - testStartTime;

        // Create test result
        await prisma.testResult.create({
          data: {
            runId: testRunId,
            testFileId: testFile.id,
            status: result.status,
            errorMessage: result.errorMessage,
            stackTrace: result.stackTrace,
            screenshotUrl: result.screenshotUrl,
            videoUrl: result.videoUrl,
            durationMs: testDuration,
            retryCount: 0,
          },
        });

        if (result.status === 'PASSED') passed++;
        else if (result.status === 'FAILED') failed++;
        else skipped++;

        // Emit result via WebSocket
        io.to(testRunId).emit('test-complete', {
          testRunId,
          testFileId: testFile.id,
          status: result.status,
          duration: testDuration,
        });

      } catch (error) {
        logger.error(`Test ${testFile.name} failed:`, error);
        failed++;

        await prisma.testResult.create({
          data: {
            runId: testRunId,
            testFileId: testFile.id,
            status: 'FAILED',
            errorMessage: String(error),
            durationMs: 0,
          },
        });
      }
    }

    await context.close();

  } finally {
    await browser.close();
  }

  const totalDuration = Date.now() - startTime;

  // Update test run with results
  await prisma.testRun.update({
    where: { id: testRunId },
    data: {
      status: 'COMPLETED',
      totalTests: testFiles.length,
      passed,
      failed,
      skipped,
      durationMs: totalDuration,
      completedAt: new Date(),
    },
  });

  // Emit completion via WebSocket
  io.to(testRunId).emit('run-complete', {
    testRunId,
    totalTests: testFiles.length,
    passed,
    failed,
    skipped,
    duration: totalDuration,
  });

  logger.info(`Test run ${testRunId} completed: ${passed} passed, ${failed} failed, ${skipped} skipped`);
}

/**
 * Launch browser based on type
 */
async function launchBrowser(browserType: string, headless: boolean): Promise<Browser> {
  const options = { headless };

  switch (browserType) {
    case 'firefox':
      return await firefox.launch(options);
    case 'webkit':
      return await webkit.launch(options);
    case 'chromium':
    default:
      return await chromium.launch(options);
  }
}

/**
 * Execute a single test file using simple page operations
 * Simplified version that runs basic Playwright operations
 */
async function executeTestFile(
  context: BrowserContext,
  testFile: any,
  testRun: any
): Promise<{
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  errorMessage?: string;
  stackTrace?: string;
  screenshotUrl?: string;
  videoUrl?: string;
}> {
  const page = await context.newPage();
  const startTime = Date.now();
  
  try {
    logger.info(`Executing test file: ${testFile.name}`);

    // Get the base URL from environment or app
    const baseUrl = testRun.environment?.baseUrl || testRun.app.url;

    // Execute basic test operations
    // For MVP, we'll navigate to the URL and verify it loads
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit to ensure page is fully loaded
    await page.waitForTimeout(2000);
    
    // Verify page title exists (basic smoke test)
    const title = await page.title();
    if (!title || title.length === 0) {
      throw new Error('Page title is empty');
    }

    logger.info(`Test passed: ${testFile.name} (${title})`);

    await page.close();

    return {
      status: 'PASSED',
    };

  } catch (error: any) {
    logger.error(`Test failed: ${testFile.name}`, error);

    // Capture screenshot on failure
    let screenshotUrl;
    try {
      if (testRun.screenshot === 'always' || testRun.screenshot === 'on-failure') {
        // Ensure upload directory exists
        const screenshotDir = 'uploads/screenshots';
        await fs.mkdir(screenshotDir, { recursive: true });
        
        const screenshotPath = path.join(screenshotDir, `${testRun.id}-${testFile.id}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        screenshotUrl = `/${screenshotPath}`;
        
        logger.info(`Screenshot saved: ${screenshotPath}`);
      }
    } catch (screenshotError) {
      logger.error('Failed to capture screenshot:', screenshotError);
    }

    await page.close();

    return {
      status: 'FAILED',
      errorMessage: error.message,
      stackTrace: error.stack,
      screenshotUrl,
    };
  }
}
