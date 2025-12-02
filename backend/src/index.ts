/**
 * Rework Backend - Main Entry Point
 *
 * Production-ready Express server with:
 * - WebSocket support for real-time chat
 * - PostgreSQL database
 * - Redis for caching and sessions
 * - Yandex Cloud integrations
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { rateLimit } from 'express-rate-limit';
import healthRouter, { initHealthCheck } from './health';

// Import routes (will be created)
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import vacancyRoutes from './routes/vacancy.routes';
// import applicationRoutes from './routes/application.routes';
// import chatRoutes from './routes/chat.routes';
// import billingRoutes from './routes/billing.routes';
// import adminRoutes from './routes/admin.routes';

// Import WebSocket initializer
// import { initWebSocket } from './websocket';

// Import database and redis
import { pool } from './config/database';
import redis from './config/redis';

const app = express();
const httpServer = createServer(app);

// ======================
// Security Middleware
// ======================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://storage.yandexcloud.net'],
      connectSrc: ["'self'", 'wss:', 'https:'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Compression
app.use(compression());

// ======================
// CORS Configuration
// ======================
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:19006', // Expo
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ======================
// Rate Limiting
// ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready' || req.path === '/live';
  },
});

app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: { error: 'Too many login attempts, please try again later.' },
});

// ======================
// Body Parsing
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Trust Proxy (for Yandex Cloud Load Balancer)
// ======================
app.set('trust proxy', 1);

// ======================
// Request Logging
// ======================
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({
        level: logLevel,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
      }));
    }
  });

  next();
});

// ======================
// Health Checks (no auth required)
// ======================
app.use(healthRouter);

// Initialize health check with database and redis
initHealthCheck(pool, redis);

// ======================
// API Routes
// ======================
const API_PREFIX = '/api/v1';

// Placeholder routes - replace with actual route imports
app.get(`${API_PREFIX}/`, (req: Request, res: Response) => {
  res.json({
    name: 'Rework API',
    version: '1.0.0',
    status: 'running',
    documentation: 'https://api.reworkapp.ru/docs',
  });
});

// Auth routes with stricter rate limiting
// app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);

// Protected routes
// app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/vacancies`, vacancyRoutes);
// app.use(`${API_PREFIX}/applications`, applicationRoutes);
// app.use(`${API_PREFIX}/chats`, chatRoutes);
// app.use(`${API_PREFIX}/billing`, billingRoutes);
// app.use(`${API_PREFIX}/admin`, adminRoutes);

// ======================
// 404 Handler
// ======================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// ======================
// Error Handler
// ======================
interface AppError extends Error {
  status?: number;
  code?: string;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  res.status(status).json({
    error: message,
    code: err.code,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ======================
// WebSocket
// ======================
// Uncomment when WebSocket is configured:
// initWebSocket(httpServer);

// ======================
// Start Server
// ======================
const PORT = parseInt(process.env.PORT || '3001', 10);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 Rework Backend Server`);
  console.log('='.repeat(50));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(50));

  // Log configured origins
  console.log('🔗 Allowed CORS origins:');
  corsOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log('='.repeat(50));
});

// ======================
// Graceful Shutdown
// ======================
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  httpServer.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }

    console.log('HTTP server closed');

    // Close database connections
    pool.end().then(() => {
      console.log('Database pool closed');
    });

    // Close Redis connection
    redis.quit().then(() => {
      console.log('Redis connection closed');
    });

    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
