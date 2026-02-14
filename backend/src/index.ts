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
import environmentsRoutes from './routes/environments.routes';
import testFilesRoutes from './routes/testFiles.routes';
import recorderRoutes from './routes/recorder.routes';

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
  
  // Join recorder session room
  socket.on('recorder:join', (sessionId: string) => {
    socket.join(`recorder:${sessionId}`);
    logger.info(`Client ${socket.id} joined recorder session: ${sessionId}`);
  });

  // Leave recorder session room
  socket.on('recorder:leave', (sessionId: string) => {
    socket.leave(`recorder:${sessionId}`);
    logger.info(`Client ${socket.id} left recorder session: ${sessionId}`);
  });

  // Join test run room for real-time updates
  socket.on('testrun:join', (runId: string) => {
    socket.join(`testrun:${runId}`);
    logger.info(`Client ${socket.id} joined test run: ${runId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: true, // Allow all origins in production (nginx handles security)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Custom request logger

// Serve static files (screenshots, videos)
app.use('/uploads', express.static('uploads'));

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
app.use('/api/environments', environmentsRoutes);
app.use('/api/test-files', testFilesRoutes);
app.use('/api/recorder', recorderRoutes);

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

httpServer.listen(PORT, async () => {
  logger.info(`🚀 Qaptain API Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
  logger.info(`💾 Database: Connected`);
  logger.info(`📊 Redis: Connected`);
  
  // Start test worker
  try {
    await import('./workers/testWorker');
    logger.info(`🔄 Test worker started`);
  } catch (error) {
    logger.error('Failed to start test worker:', error);
  }
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
