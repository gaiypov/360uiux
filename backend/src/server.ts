/**
 * 360° РАБОТА - Main Server Entry Point
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { apiLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import billingRoutes from './routes/billing.routes';
import vacancyRoutes from './routes/vacancy.routes';
import applicationRoutes from './routes/application.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';
import videoRoutes from './routes/video.routes';
import moderationRoutes from './routes/moderation.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

// Initialize Express
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ===================================
// MIDDLEWARE
// ===================================

// Security
app.use(helmet());

// CORS - Безопасная конфигурация
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

// В development разрешаем localhost
if (process.env.NODE_ENV === 'development' && allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:8081');
  console.warn('⚠️ CORS: Используются localhost для development');
}

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.error('🔴 КРИТИЧЕСКАЯ ОШИБКА: CORS_ORIGIN должен быть установлен в production!');
  console.error('Добавьте в .env:');
  console.error('  CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com');
  process.exit(1);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parsing - Разумные лимиты
// 1MB для обычных API запросов (не для загрузки файлов!)
// Загрузка файлов должна идти через multer с отдельными лимитами
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ===================================
// RATE LIMITING (защита от DDoS и брутфорса)
// ===================================

// Применяем общий лимит ко всем API
// Более специфические лимиты (SMS, auth, payments) настроены в отдельных routes
app.use('/api/', apiLimiter);

// ===================================
// ROUTES
// ===================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/vacancies', vacancyRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', videoRoutes); // Video routes
app.use('/api/v1/moderation', moderationRoutes); // Moderation routes
app.use('/api/v1/analytics', analyticsRoutes); // Analytics routes
app.use('/api/v1/admin', adminRoutes); // Admin routes

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ===================================
// START SERVER
// ===================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 360° РАБОТА - Backend Server');
      console.log('='.repeat(50));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: Connected`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
