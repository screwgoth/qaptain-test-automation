/**
 * Test Queue Service
 * BullMQ queue for managing test execution jobs
 */

import { Queue } from 'bullmq';
import { config } from '../config/config';
import { logger } from '../config/logger';

// Create BullMQ connection
const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

// Create test run queue
export const testRunQueue = new Queue('test-runs', { connection });

/**
 * Add a test run to the queue
 */
export async function addTestRunToQueue(testRunId: string): Promise<void> {
  try {
    await testRunQueue.add(
      'execute-test-run',
      { testRunId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    logger.info(`Test run ${testRunId} added to queue`);
  } catch (error) {
    logger.error('Failed to add test run to queue:', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<any> {
  const [waiting, active, completed, failed] = await Promise.all([
    testRunQueue.getWaitingCount(),
    testRunQueue.getActiveCount(),
    testRunQueue.getCompletedCount(),
    testRunQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
  };
}
