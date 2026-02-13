/**
 * Apps Controller
 * Handles CRUD operations for applications and environments
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { badRequest, notFound } from '../middleware/errorHandler';

/**
 * Create a new app
 */
export const createApp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, url, stagingUrl, productionUrl, authType, authCredentials, tags } = req.body;

  if (!name || !url) {
    throw badRequest('Name and URL are required');
  }

  if (!req.user) {
    throw badRequest('User not authenticated');
  }

  const app = await prisma.app.create({
    data: {
      name,
      description,
      url,
      stagingUrl,
      productionUrl,
      authType: authType || 'NONE',
      authCredentials,
      tags: tags || [],
      userId: req.user.id,
    },
  });

  res.status(201).json({
    message: 'App created successfully',
    app,
  });
};

/**
 * Get all apps for the authenticated user
 */
export const getApps = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw badRequest('User not authenticated');
  }

  const apps = await prisma.app.findMany({
    where: {
      userId: req.user.id,
      status: { not: 'ARCHIVED' },
    },
    include: {
      environments: true,
      _count: {
        select: {
          testSuites: true,
          testRuns: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ apps });
};

/**
 * Get app by ID
 */
export const getAppById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const app = await prisma.app.findUnique({
    where: { id },
    include: {
      environments: true,
      testSuites: {
        include: {
          _count: {
            select: { testFiles: true },
          },
        },
      },
    },
  });

  if (!app) {
    throw notFound('App not found');
  }

  res.json({ app });
};

/**
 * Update app
 */
export const updateApp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, url, stagingUrl, productionUrl, authType, authCredentials, tags, status } = req.body;

  const app = await prisma.app.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(url && { url }),
      ...(stagingUrl !== undefined && { stagingUrl }),
      ...(productionUrl !== undefined && { productionUrl }),
      ...(authType && { authType }),
      ...(authCredentials !== undefined && { authCredentials }),
      ...(tags && { tags }),
      ...(status && { status }),
    },
  });

  res.json({
    message: 'App updated successfully',
    app,
  });
};

/**
 * Delete app
 */
export const deleteApp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  await prisma.app.delete({
    where: { id },
  });

  res.json({
    message: 'App deleted successfully',
  });
};

/**
 * Create environment for app
 */
export const createEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, baseUrl, variables, isDefault } = req.body;

  if (!name || !baseUrl) {
    throw badRequest('Name and baseUrl are required');
  }

  const environment = await prisma.environment.create({
    data: {
      name,
      baseUrl,
      variables,
      isDefault: isDefault || false,
      appId: id,
    },
  });

  res.status(201).json({
    message: 'Environment created successfully',
    environment,
  });
};

/**
 * Get environments for app
 */
export const getEnvironments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const environments = await prisma.environment.findMany({
    where: { appId: id },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ environments });
};

/**
 * Update environment
 */
export const updateEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, type, baseUrl, variables, isDefault } = req.body;

  const environment = await prisma.environment.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(type && { type }),
      ...(baseUrl && { baseUrl }),
      ...(variables !== undefined && { variables }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  res.json({
    message: 'Environment updated successfully',
    environment,
  });
};

/**
 * Delete environment
 */
export const deleteEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  await prisma.environment.delete({
    where: { id },
  });

  res.json({
    message: 'Environment deleted successfully',
  });
};
