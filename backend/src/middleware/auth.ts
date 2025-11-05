/**
 * 360° РАБОТА - Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UserRole } from '../types';

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user data to request
    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
}

/**
 * Middleware to check if user is employer
 */
export function requireEmployer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'employer') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This action is only available to employers',
    });
  }

  next();
}

/**
 * Middleware to check if user is jobseeker
 */
export function requireJobSeeker(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'jobseeker') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This action is only available to job seekers',
    });
  }

  next();
}

/**
 * Middleware to check for specific roles
 */
export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Ignore errors, continue without authentication
    next();
  }
}
