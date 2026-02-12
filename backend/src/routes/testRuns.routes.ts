/**
 * Test Runs Routes
 * Test execution and run management
 */

import { Router } from 'express';
import * as testRunsController from '../controllers/testRuns.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Test Runs
router.post('/', testRunsController.createTestRun);
router.get('/', testRunsController.getTestRuns);
router.get('/:id', testRunsController.getTestRunById);
router.delete('/:id', testRunsController.cancelTestRun);

// Test Results
router.get('/:id/results', testRunsController.getTestResults);

export default router;
