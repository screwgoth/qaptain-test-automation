/**
 * Reports Controller
 * Test reports and analytics
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { notFound } from '../middleware/errorHandler';

/**
 * Get test run report
 */
export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { runId } = req.params;

  const testRun = await prisma.testRun.findUnique({
    where: { id: runId },
    include: {
      app: true,
      suite: true,
      environment: true,
      testResults: {
        include: {
          testFile: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!testRun) {
    throw notFound('Test run not found');
  }

  const failedTests = testRun.testResults.filter(r => r.status === 'FAILED');
  const passedTests = testRun.testResults.filter(r => r.status === 'PASSED');
  const skippedTests = testRun.testResults.filter(r => r.status === 'SKIPPED');

  const report = {
    testRun,
    summary: {
      total: testRun.totalTests,
      passed: testRun.passed,
      failed: testRun.failed,
      skipped: testRun.skipped,
      passRate: testRun.totalTests > 0 ? (testRun.passed / testRun.totalTests) * 100 : 0,
      duration: testRun.durationMs,
    },
    failedTests,
    passedTests,
    skippedTests,
  };

  res.json({ report });
};

/**
 * Get analytics trends
 */
export const getTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  const { appId, days = 30 } = req.query;

  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - Number(days));

  const where: any = {
    createdAt: {
      gte: daysAgo,
    },
    status: 'COMPLETED',
  };

  if (appId) {
    where.appId = appId;
  }

  const testRuns = await prisma.testRun.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      totalTests: true,
      passed: true,
      failed: true,
      skipped: true,
      durationMs: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const trends = testRuns.map(run => ({
    date: run.createdAt,
    passRate: run.totalTests > 0 ? (run.passed / run.totalTests) * 100 : 0,
    duration: run.durationMs,
    total: run.totalTests,
    passed: run.passed,
    failed: run.failed,
  }));

  res.json({ trends });
};
