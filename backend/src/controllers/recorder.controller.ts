/**
 * Recorder Controller
 * Handles HTTP requests for Playwright test recording
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { recorderService, RecordedAction } from '../services/recorder.service';
import { io } from '../index';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Start a new recording session
 */
export const startRecording = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetUrl, browserType, viewport, appId, name } = req.body;
    const userId = (req as any).user?.id;

    if (!targetUrl) {
      res.status(400).json({ error: 'Target URL is required' });
      return;
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch {
      res.status(400).json({ error: 'Invalid target URL' });
      return;
    }

    const sessionId = uuidv4();

    // Create database record
    await prisma.recordingSession.create({
      data: {
        id: sessionId,
        name: name || `Recording ${new Date().toISOString()}`,
        targetUrl,
        browserType: browserType || 'chromium',
        viewport: viewport || { width: 1280, height: 720 },
        status: 'RECORDING',
        userId,
        appId,
      },
    });

    // Start Playwright session
    // Note: In Docker/headless environment, recorder runs in headless mode
    // Users can connect to the browser via CDP/Playwright Inspector
    const { wsEndpoint } = await recorderService.startSession(sessionId, targetUrl, {
      browserType,
      viewport,
      headless: true, // Must be headless in Docker (no X11 display)
    });

    // Setup event listeners for this session
    const actionHandler = ({ sessionId: sid, action }: { sessionId: string; action: RecordedAction }) => {
      if (sid === sessionId) {
        // Emit to WebSocket clients
        io.to(`recorder:${sessionId}`).emit('action:recorded', action);
        
        // Update database (debounced in production)
        prisma.recordingSession.update({
          where: { id: sessionId },
          data: {
            actions: {
              push: action as any,
            },
          },
        }).catch(console.error);
      }
    };

    recorderService.on('actionRecorded', actionHandler);

    res.json({
      success: true,
      session: {
        id: sessionId,
        targetUrl,
        browserType: browserType || 'chromium',
        status: 'recording',
        wsEndpoint,
      },
    });
  } catch (error: any) {
    console.error('Error starting recording:', error);
    res.status(500).json({ error: error.message || 'Failed to start recording' });
  }
};

/**
 * Stop recording and get results
 */
export const stopRecording = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = recorderService.getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Recording session not found' });
      return;
    }

    // Stop recording and generate code
    const { actions, code } = await recorderService.stopSession(sessionId);

    // Update database
    await prisma.recordingSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        actions: actions as any,
        generatedCode: code,
        completedAt: new Date(),
      },
    });

    // Notify WebSocket clients
    io.to(`recorder:${sessionId}`).emit('recording:completed', { actions, code });

    res.json({
      success: true,
      sessionId,
      actions,
      code,
    });
  } catch (error: any) {
    console.error('Error stopping recording:', error);
    res.status(500).json({ error: error.message || 'Failed to stop recording' });
  }
};

/**
 * Pause recording
 */
export const pauseRecording = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    recorderService.pauseSession(sessionId);

    await prisma.recordingSession.update({
      where: { id: sessionId },
      data: { status: 'PAUSED' },
    });

    io.to(`recorder:${sessionId}`).emit('recording:paused');

    res.json({ success: true, status: 'paused' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to pause recording' });
  }
};

/**
 * Resume recording
 */
export const resumeRecording = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    recorderService.resumeSession(sessionId);

    await prisma.recordingSession.update({
      where: { id: sessionId },
      data: { status: 'RECORDING' },
    });

    io.to(`recorder:${sessionId}`).emit('recording:resumed');

    res.json({ success: true, status: 'recording' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to resume recording' });
  }
};

/**
 * Get recording session status and actions
 */
export const getRecordingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = recorderService.getSession(sessionId);
    const dbSession = await prisma.recordingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session && !dbSession) {
      res.status(404).json({ error: 'Recording session not found' });
      return;
    }

    res.json({
      success: true,
      session: {
        id: sessionId,
        status: session?.status || dbSession?.status,
        actions: session?.actions || dbSession?.actions,
        targetUrl: session?.targetUrl || dbSession?.targetUrl,
        generatedCode: dbSession?.generatedCode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get recording status' });
  }
};

/**
 * Delete an action from recording
 */
export const deleteAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, actionId } = req.params;

    const deleted = recorderService.deleteAction(sessionId, actionId);
    if (!deleted) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    io.to(`recorder:${sessionId}`).emit('action:deleted', { actionId });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete action' });
  }
};

/**
 * Update an action in recording
 */
export const updateAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, actionId } = req.params;
    const updates = req.body;

    const updated = recorderService.updateAction(sessionId, actionId, updates);
    if (!updated) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    io.to(`recorder:${sessionId}`).emit('action:updated', { actionId, updates });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update action' });
  }
};

/**
 * Add assertion to recording
 */
export const addAssertion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { selector, type, expected } = req.body;

    if (!selector || !type) {
      res.status(400).json({ error: 'Selector and type are required' });
      return;
    }

    recorderService.addAssertion(sessionId, { selector, type, expected });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add assertion' });
  }
};

/**
 * Take screenshot during recording
 */
export const takeScreenshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const screenshotPath = await recorderService.takeScreenshot(sessionId);
    if (!screenshotPath) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true, path: screenshotPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to take screenshot' });
  }
};

/**
 * Save recording as test file
 */
export const saveAsTestFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { suiteId, fileName, description } = req.body;

    if (!suiteId || !fileName) {
      res.status(400).json({ error: 'Suite ID and file name are required' });
      return;
    }

    // Get recording session
    const dbSession = await prisma.recordingSession.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      res.status(404).json({ error: 'Recording session not found' });
      return;
    }

    if (!dbSession.generatedCode) {
      res.status(400).json({ error: 'Recording has no generated code. Stop recording first.' });
      return;
    }

    // Create test file
    const testFile = await prisma.testFile.create({
      data: {
        name: fileName.endsWith('.spec.ts') ? fileName : `${fileName}.spec.ts`,
        path: fileName.endsWith('.spec.ts') ? fileName : `${fileName}.spec.ts`,
        code: dbSession.generatedCode,
        description: description || `Recorded test from ${dbSession.targetUrl}`,
        suiteId,
        aiGenerated: false,
      },
    });

    res.json({
      success: true,
      testFile: {
        id: testFile.id,
        name: testFile.name,
        path: testFile.path,
      },
    });
  } catch (error: any) {
    console.error('Error saving test file:', error);
    res.status(500).json({ error: error.message || 'Failed to save test file' });
  }
};

/**
 * Get user's recording history
 */
export const getRecordingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 20, offset = 0 } = req.query;

    const recordings = await prisma.recordingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      select: {
        id: true,
        name: true,
        targetUrl: true,
        status: true,
        browserType: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const total = await prisma.recordingSession.count({ where: { userId } });

    res.json({
      success: true,
      recordings,
      total,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get recording history' });
  }
};

/**
 * Regenerate code from actions
 */
export const regenerateCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const dbSession = await prisma.recordingSession.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      res.status(404).json({ error: 'Recording session not found' });
      return;
    }

    const actions = (dbSession.actions as any[]) || [];
    const code = recorderService.generatePlaywrightCode(
      actions as RecordedAction[],
      dbSession.targetUrl
    );

    await prisma.recordingSession.update({
      where: { id: sessionId },
      data: { generatedCode: code },
    });

    res.json({ success: true, code });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to regenerate code' });
  }
};
