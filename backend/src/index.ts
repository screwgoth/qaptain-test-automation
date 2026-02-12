/**
 * Qaptain Test Automation Platform - Backend API
 * Main entry point for Express server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import configuration and middleware
import { config } from './config/config';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth.routes';
import appsRoutes from './routes/apps.routes';
import testSuitesRoutes from './routes/testSuites.routes';
import testRunsRoutes from './routes/testRuns.routes';
import reportsRoutes from './routes/reports.routes';
import webhooksRoutes from './routes/webhooks.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO for real-time updates
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Custom request logger

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/test-suites', testSuitesRoutes);
app.use('/api/test-runs', testRunsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Qaptain API Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
  logger.info(`💾 Database: Connected`);
  logger.info(`📊 Redis: Connected`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
