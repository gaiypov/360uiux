/**
 * 360° РАБОТА - Health Check Routes
 * For monitoring and load balancer health checks
 */

import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { cacheService } from '../services/CacheService';

const router = Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();

    // Check database connection
    let dbStatus = 'disconnected';
    try {
      await db.one('SELECT 1 as result');
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis connection
    const redisStatus = cacheService.isEnabled() ? 'connected' : 'disconnected';

    const healthStatus = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp,
      uptime: Math.floor(uptime),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = healthStatus.status === 'ok' ? 200 : 503;
    return res.status(statusCode).json(healthStatus);
  } catch (error: any) {
    return res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /health/ready
 * @desc    Readiness probe (all services ready)
 * @access  Public
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database
    await db.one('SELECT 1 as result');

    // Check Redis (optional)
    const redisReady = cacheService.isEnabled();

    if (redisReady) {
      return res.status(200).json({
        ready: true,
        services: {
          database: 'ready',
          redis: 'ready',
        },
      });
    } else {
      return res.status(200).json({
        ready: true,
        services: {
          database: 'ready',
          redis: 'not_configured',
        },
      });
    }
  } catch (error: any) {
    return res.status(503).json({
      ready: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /health/live
 * @desc    Liveness probe (app is running)
 * @access  Public
 */
router.get('/live', (req: Request, res: Response) => {
  return res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
