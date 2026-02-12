/**
 * Authentication Controller
 * Handles user registration, login, and JWT operations
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/config';
import { badRequest, unauthorized, conflict } from '../middleware/errorHandler';
import { AuthRequest, JwtPayload } from '../middleware/auth';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;

  // Validate input
  if (!email || !password) {
    throw badRequest('Email and password are required');
  }

  if (password.length < 6) {
    throw badRequest('Password must be at least 6 characters');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw conflict('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    } as JwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token,
  });
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw badRequest('Email and password are required');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw unauthorized('Account is deactivated');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw unauthorized('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    } as JwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw unauthorized('User not found');
  }

  res.json({ user });
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized('Not authenticated');
  }

  // Generate new token
  const token = jwt.sign(
    {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    } as JwtPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );

  res.json({
    message: 'Token refreshed successfully',
    token,
  });
};
