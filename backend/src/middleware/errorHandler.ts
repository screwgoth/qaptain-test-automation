/**
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error(`Error ${statusCode}: ${message}`, {
    method: req.method,
    path: req.path,
    stack: err.stack,
  });

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Helper functions for common errors
export const notFound = (message = 'Resource not found'): ApiError => {
  return new ApiError(404, message);
};

export const badRequest = (message = 'Bad request'): ApiError => {
  return new ApiError(400, message);
};

export const unauthorized = (message = 'Unauthorized'): ApiError => {
  return new ApiError(401, message);
};

export const forbidden = (message = 'Forbidden'): ApiError => {
  return new ApiError(403, message);
};

export const conflict = (message = 'Conflict'): ApiError => {
  return new ApiError(409, message);
};

export const internalError = (message = 'Internal server error'): ApiError => {
  return new ApiError(500, message);
};
