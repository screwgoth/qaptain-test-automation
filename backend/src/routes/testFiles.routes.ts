/**
 * Test Files Routes
 * Manage individual test files
 */

import { Router } from 'express';
import * as testSuitesController from '../controllers/testSuites.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Test file CRUD
router.put('/:id', testSuitesController.updateTestFile);
router.delete('/:id', testSuitesController.deleteTestFile);

export default router;
