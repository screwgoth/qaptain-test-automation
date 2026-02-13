/**
 * Reports Routes
 * Test reports and analytics
 */

import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Reports
router.get('/:runId', reportsController.getReport);
router.get('/analytics/trends', reportsController.getTrends);

export default router;
