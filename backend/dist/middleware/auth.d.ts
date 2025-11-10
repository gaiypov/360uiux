/**
 * 360° РАБОТА - Authentication Middleware
 */
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
/**
 * Main authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware to check if user is employer
 */
export declare function requireEmployer(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware to check if user is jobseeker
 */
export declare function requireJobSeeker(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware to check for specific roles
 */
export declare function requireRole(roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map