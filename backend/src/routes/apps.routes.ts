/**
 * Apps Management Routes
 * CRUD operations for applications
 */

import { Router } from 'express';
import * as appsController from '../controllers/apps.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Apps CRUD
router.post('/', appsController.createApp);
router.get('/', appsController.getApps);
router.get('/:id', appsController.getAppById);
router.put('/:id', appsController.updateApp);
router.delete('/:id', appsController.deleteApp);

// App environments
router.post('/:id/environments', appsController.createEnvironment);
router.get('/:id/environments', appsController.getEnvironments);

export default router;
