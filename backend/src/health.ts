/**
 * Rework Backend - Health Check Endpoints
 *
 * Provides health and readiness checks for load balancers,
 * Kubernetes probes, and monitoring systems.
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Database pool (will be imported from config)
let pool: any = null;
let redis: any = null;

/**
 * Initialize health check with database and redis connections
 */
export function initHealthCheck(dbPool: any, redisClient: any) {
  pool = dbPool;
  redis = redisClient;
}

/**
 * GET /health
 * Comprehensive health check for all services
 */
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();

  const health: {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    responseTime?: number;
    version: string;
    environment: string;
    checks: {
      database: 'ok' | 'error' | 'unknown';
      redis: 'ok' | 'error' | 'unknown';
    };
    details?: {
      database?: string;
      redis?: string;
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  const details: { database?: string; redis?: string } = {};

  // Check PostgreSQL
  try {
    if (pool) {
      const result = await pool.query('SELECT 1 as health_check');
      if (result.rows[0]?.health_check === 1) {
        health.checks.database = 'ok';
      }
    } else {
      health.checks.database = 'error';
      details.database = 'Database pool not initialized';
      health.status = 'degraded';
    }
  } catch (err: any) {
    health.checks.database = 'error';
    details.database = err.message;
    health.status = 'degraded';
  }

  // Check Redis
  try {
    if (redis) {
      const pong = await redis.ping();
      if (pong === 'PONG') {
        health.checks.redis = 'ok';
      }
    } else {
      health.checks.redis = 'error';
      details.redis = 'Redis client not initialized';
      health.status = 'degraded';
    }
  } catch (err: any) {
    health.checks.redis = 'error';
    details.redis = err.message;
    health.status = 'degraded';
  }

  // Add details only if there are errors
  if (Object.keys(details).length > 0) {
    health.details = details;
  }

  // Calculate response time
  health.responseTime = Date.now() - startTime;

  // Set status code based on health
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /ready
 * Readiness probe - checks if the service can accept traffic
 * Used by load balancers and Kubernetes
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Service is ready if database is available
    if (pool) {
      await pool.query('SELECT 1');
      res.status(200).json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        ready: false,
        reason: 'Database not initialized',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    res.status(503).json({
      ready: false,
      reason: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /live
 * Liveness probe - checks if the service is alive
 * Used by Kubernetes to restart unhealthy containers
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * GET /metrics
 * Basic metrics endpoint for monitoring
 */
router.get('/metrics', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    cpu: process.cpuUsage(),
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  });
});

export default router;
