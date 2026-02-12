/**
 * Test Runs Controller
 * Handles test execution and run management
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { badRequest, notFound } from '../middleware/errorHandler';
import { addTestRunToQueue } from '../services/testQueue.service';

/**
 * Create a new test run
 */
export const createTestRun = async (req: AuthRequest, res: Response): Promise<void> => {
  const { appId, suiteId, environmentId, browser, workers, retries, headless, screenshot, video } = req.body;

  if (!appId) {
    throw badRequest('appId is required');
  }

  if (!req.user) {
    throw badRequest('User not authenticated');
  }

  // Create test run record
  const testRun = await prisma.testRun.create({
    data: {
      appId,
      suiteId,
      environmentId,
      userId: req.user.id,
      trigger: 'MANUAL',
      status: 'QUEUED',
      browser: browser || 'chromium',
      workers: workers || 4,
      retries: retries !== undefined ? retries : 2,
      headless: headless !== undefined ? headless : true,
      screenshot: screenshot || 'on-failure',
      video: video || 'on-failure',
    },
    include: {
      app: true,
      suite: true,
      environment: true,
    },
  });

  // Add to queue for processing
  await addTestRunToQueue(testRun.id);

  res.status(201).json({
    message: 'Test run queued successfully',
    testRun,
  });
};

/**
 * Get all test runs
 */
export const getTestRuns = async (req: AuthRequest, res: Response): Promise<void> => {
  const { appId, suiteId, status } = req.query;

  const where: any = {};
  if (appId) where.appId = appId;
  if (suiteId) where.suiteId = suiteId;
  if (status) where.status = status;

  const testRuns = await prisma.testRun.findMany({
    where,
    include: {
      app: {
        select: {
          id: true,
          name: true,
        },
      },
      suite: {
        select: {
          id: true,
          name: true,
        },
      },
      environment: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ testRuns });
};

/**
 * Get test run by ID
 */
export const getTestRunById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const testRun = await prisma.testRun.findUnique({
    where: { id },
    include: {
      app: true,
      suite: true,
      environment: true,
      testResults: {
        include: {
          testFile: {
            select: {
              id: true,
              name: true,
              path: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!testRun) {
    throw notFound('Test run not found');
  }

  res.json({ testRun });
};

/**
 * Cancel a test run
 */
export const cancelTestRun = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const testRun = await prisma.testRun.findUnique({
    where: { id },
  });

  if (!testRun) {
    throw notFound('Test run not found');
  }

  if (testRun.status === 'COMPLETED' || testRun.status === 'FAILED' || testRun.status === 'CANCELLED') {
    throw badRequest('Cannot cancel a completed or already cancelled run');
  }

  await prisma.testRun.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      completedAt: new Date(),
    },
  });

  res.json({
    message: 'Test run cancelled successfully',
  });
};

/**
 * Get test results for a run
 */
export const getTestResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const testResults = await prisma.testResult.findMany({
    where: { runId: id },
    include: {
      testFile: {
        select: {
          id: true,
          name: true,
          path: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ testResults });
};
