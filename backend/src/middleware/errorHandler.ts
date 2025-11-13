/**
 * 360° РАБОТА - Global Error Handler Middleware
 * Catches all errors and formats them consistently
 *
 * Usage in app.ts:
 * import { errorHandler } from './middleware/errorHandler';
 * app.use(errorHandler);  // MUST be last middleware
 */

import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../errors/HttpException';
import { ValidationError } from 'class-validator';

/**
 * Global error handler
 * Catches all errors thrown in routes/controllers and formats them
 */
export function errorHandler(
  error: Error | HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for debugging
  console.error('❌ Error caught by global handler:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  // Handle HttpException (our custom errors)
  if (error instanceof HttpException) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle class-validator ValidationError
  if (Array.isArray(error) && error[0] instanceof ValidationError) {
    const formattedErrors = error.map((err: ValidationError) => ({
      property: err.property,
      constraints: err.constraints,
      value: err.value,
    }));

    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed',
      details: formattedErrors,
    });
    return;
  }

  // Handle specific error types
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
    });
    return;
  }

  if (error.name === 'MulterError') {
    res.status(400).json({
      error: 'Bad Request',
      message: `File upload error: ${error.message}`,
    });
    return;
  }

  // Handle database errors (pg-promise)
  if (error.name === 'QueryResultError') {
    res.status(404).json({
      error: 'Not Found',
      message: 'Resource not found',
    });
    return;
  }

  // Default: 500 Internal Server Error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 *
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await db.many('SELECT * FROM users');
 *   res.json(users);
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 * Catches all unmatched routes
 *
 * Usage in app.ts:
 * app.use(notFoundHandler);  // Before errorHandler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
