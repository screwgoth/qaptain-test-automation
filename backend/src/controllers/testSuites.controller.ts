/**
 * Test Suites Controller
 * Handles test suite and test file operations
 */

import { Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { badRequest, notFound } from '../middleware/errorHandler';

/**
 * Create a new test suite
 */
export const createTestSuite = async (req: AuthRequest, res: Response): Promise<void> => {
  const { appId, name, description, type, config } = req.body;

  if (!appId || !name) {
    throw badRequest('appId and name are required');
  }

  const testSuite = await prisma.testSuite.create({
    data: {
      name,
      description,
      type: type || 'CUSTOM',
      config,
      appId,
    },
  });

  res.status(201).json({
    message: 'Test suite created successfully',
    testSuite,
  });
};

/**
 * Get all test suites
 */
export const getTestSuites = async (req: AuthRequest, res: Response): Promise<void> => {
  const { appId } = req.query;

  const where = appId ? { appId: appId as string } : {};

  const testSuites = await prisma.testSuite.findMany({
    where,
    include: {
      app: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          testFiles: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ testSuites });
};

/**
 * Get test suite by ID
 */
export const getTestSuiteById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const testSuite = await prisma.testSuite.findUnique({
    where: { id },
    include: {
      app: true,
      testFiles: {
        orderBy: { path: 'asc' },
      },
    },
  });

  if (!testSuite) {
    throw notFound('Test suite not found');
  }

  res.json({ testSuite });
};

/**
 * Update test suite
 */
export const updateTestSuite = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, type, config, isEnabled } = req.body;

  const testSuite = await prisma.testSuite.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(type && { type }),
      ...(config !== undefined && { config }),
      ...(isEnabled !== undefined && { isEnabled }),
    },
  });

  res.json({
    message: 'Test suite updated successfully',
    testSuite,
  });
};

/**
 * Delete test suite
 */
export const deleteTestSuite = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  await prisma.testSuite.delete({
    where: { id },
  });

  res.json({
    message: 'Test suite deleted successfully',
  });
};

/**
 * Upload a single test file
 */
export const uploadTestFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    throw badRequest('No file uploaded');
  }

  // Read file content
  const code = await fs.readFile(file.path, 'utf-8');

  // Extract filename and create path
  const filename = file.originalname;
  const filePath = filename;

  // Create test file record
  const testFile = await prisma.testFile.create({
    data: {
      name: filename,
      path: filePath,
      code,
      suiteId: id,
    },
  });

  // Clean up temp file
  await fs.unlink(file.path);

  res.status(201).json({
    message: 'Test file uploaded successfully',
    testFile,
  });
};

/**
 * Upload multiple test files
 */
export const uploadTestFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw badRequest('No files uploaded');
  }

  const testFiles = [];

  for (const file of files) {
    const code = await fs.readFile(file.path, 'utf-8');
    const filename = file.originalname;

    const testFile = await prisma.testFile.create({
      data: {
        name: filename,
        path: filename,
        code,
        suiteId: id,
      },
    });

    testFiles.push(testFile);
    await fs.unlink(file.path);
  }

  res.status(201).json({
    message: `${testFiles.length} test files uploaded successfully`,
    testFiles,
  });
};

/**
 * Get test files for a suite
 */
export const getTestFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const testFiles = await prisma.testFile.findMany({
    where: { suiteId: id },
    orderBy: { path: 'asc' },
  });

  res.json({ testFiles });
};

/**
 * Update test file
 */
export const updateTestFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fileId } = req.params;
  const { name, code, description, tags, priority, isEnabled } = req.body;

  const testFile = await prisma.testFile.update({
    where: { id: fileId },
    data: {
      ...(name && { name }),
      ...(code && { code }),
      ...(description !== undefined && { description }),
      ...(tags && { tags }),
      ...(priority !== undefined && { priority }),
      ...(isEnabled !== undefined && { isEnabled }),
    },
  });

  res.json({
    message: 'Test file updated successfully',
    testFile,
  });
};

/**
 * Delete test file
 */
export const deleteTestFile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fileId } = req.params;

  await prisma.testFile.delete({
    where: { id: fileId },
  });

  res.json({
    message: 'Test file deleted successfully',
  });
};
