/**
 * Environments Routes
 * Manage app environments
 */

import { Router } from 'express';
import * as appsController from '../controllers/apps.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Environment CRUD
router.put('/:id', appsController.updateEnvironment);
router.delete('/:id', appsController.deleteEnvironment);

export default router;
