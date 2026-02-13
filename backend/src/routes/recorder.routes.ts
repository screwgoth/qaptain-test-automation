/**
 * Recorder Routes
 * API endpoints for Playwright test recording
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  getRecordingStatus,
  deleteAction,
  updateAction,
  addAssertion,
  takeScreenshot,
  saveAsTestFile,
  getRecordingHistory,
  regenerateCode,
} from '../controllers/recorder.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/recorder/start
 * @desc    Start a new recording session
 * @body    { targetUrl, browserType?, viewport?, appId?, name? }
 */
router.post('/start', startRecording);

/**
 * @route   GET /api/recorder/history
 * @desc    Get user's recording history
 * @query   { limit?, offset? }
 * NOTE: Must be before /:sessionId to avoid being matched as sessionId
 */
router.get('/history', getRecordingHistory);

/**
 * @route   POST /api/recorder/:sessionId/stop
 * @desc    Stop recording and get generated code
 */
router.post('/:sessionId/stop', stopRecording);

/**
 * @route   POST /api/recorder/:sessionId/pause
 * @desc    Pause recording
 */
router.post('/:sessionId/pause', pauseRecording);

/**
 * @route   POST /api/recorder/:sessionId/resume
 * @desc    Resume recording
 */
router.post('/:sessionId/resume', resumeRecording);

/**
 * @route   GET /api/recorder/:sessionId
 * @desc    Get recording session status and actions
 */
router.get('/:sessionId', getRecordingStatus);

/**
 * @route   DELETE /api/recorder/:sessionId/actions/:actionId
 * @desc    Delete an action from recording
 */
router.delete('/:sessionId/actions/:actionId', deleteAction);

/**
 * @route   PATCH /api/recorder/:sessionId/actions/:actionId
 * @desc    Update an action in recording
 */
router.patch('/:sessionId/actions/:actionId', updateAction);

/**
 * @route   POST /api/recorder/:sessionId/assertion
 * @desc    Add assertion to recording
 * @body    { selector, type, expected? }
 */
router.post('/:sessionId/assertion', addAssertion);

/**
 * @route   POST /api/recorder/:sessionId/screenshot
 * @desc    Take screenshot during recording
 */
router.post('/:sessionId/screenshot', takeScreenshot);

/**
 * @route   POST /api/recorder/:sessionId/save
 * @desc    Save recording as test file
 * @body    { suiteId, fileName, description? }
 */
router.post('/:sessionId/save', saveAsTestFile);

/**
 * @route   POST /api/recorder/:sessionId/regenerate
 * @desc    Regenerate code from actions
 */
router.post('/:sessionId/regenerate', regenerateCode);

export default router;
