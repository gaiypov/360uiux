/**
 * 360° РАБОТА - Video Authentication Middleware
 * Validates video tokens for private video access
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to validate video access tokens
 * Used for protecting private video streaming endpoints
 */
export declare const validateVideoToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if user can access a video
 * Checks view limits before generating secure URL
 */
export declare const checkVideoViewLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=videoAuth.d.ts.map