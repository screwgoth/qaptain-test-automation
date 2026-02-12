/**
 * Test Worker
 * BullMQ worker that processes test execution jobs
 */

import { Worker, Job } from 'bullmq';
import { config } from '../config/config';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { executeTestRun } from '../services/testExecution.service';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

// Create worker
const worker = new Worker(
  'test-runs',
  async (job: Job) => {
    const { testRunId } = job.data;
    
    logger.info(`Processing test run: ${testRunId}`);

    try {
      // Update status to RUNNING
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Execute the test run
      await executeTestRun(testRunId);

      logger.info(`Test run ${testRunId} completed successfully`);
      
      return { success: true, testRunId };
    } catch (error) {
      logger.error(`Test run ${testRunId} failed:`, error);

      // Update status to FAILED
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: config.playwright.defaultWorkers,
  }
);

// Worker event handlers
worker.on('completed', (job: Job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

worker.on('error', (err: Error) => {
  logger.error('Worker error:', err);
});

logger.info('🔄 Test worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});
