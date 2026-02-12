/**
 * Test Suites Routes
 * Test suite and test file management
 */

import { Router } from 'express';
import multer from 'multer';
import * as testSuitesController from '../controllers/testSuites.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/temp' });

// All routes require authentication
router.use(authenticate);

// Test Suites CRUD
router.post('/', testSuitesController.createTestSuite);
router.get('/', testSuitesController.getTestSuites);
router.get('/:id', testSuitesController.getTestSuiteById);
router.put('/:id', testSuitesController.updateTestSuite);
router.delete('/:id', testSuitesController.deleteTestSuite);

// Test Files
router.post('/:id/files', upload.single('file'), testSuitesController.uploadTestFile);
router.post('/:id/files/bulk', upload.array('files'), testSuitesController.uploadTestFiles);
router.get('/:id/files', testSuitesController.getTestFiles);
router.put('/:id/files/:fileId', testSuitesController.updateTestFile);
router.delete('/:id/files/:fileId', testSuitesController.deleteTestFile);

export default router;
