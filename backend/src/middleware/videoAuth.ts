/**
 * 360° РАБОТА - Video Authentication Middleware
 * Validates video tokens for private video access
 */

import { Request, Response, NextFunction } from 'express';
import { privateVideoService } from '../services/video/PrivateVideoService';

/**
 * Middleware to validate video access tokens
 * Used for protecting private video streaming endpoints
 */
export const validateVideoToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from query parameter
    const token = req.query.token as string;

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Video access token is required',
      });
      return;
    }

    // Validate token using PrivateVideoService
    const isValid = await privateVideoService.validateVideoToken(token);

    if (!isValid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired video access token',
      });
      return;
    }

    // Token is valid, proceed to next middleware
    next();
  } catch (error) {
    console.error('Error in validateVideoToken middleware:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate video token',
    });
  }
};

/**
 * Middleware to check if user can access a video
 * Checks view limits before generating secure URL
 */
export const checkVideoViewLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { videoId } = req.params;
    const { applicationId } = req.query;
    const employerId = req.user?.userId;

    if (!employerId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!applicationId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Application ID is required',
      });
      return;
    }

    // Check view limit
    const viewStatus = await privateVideoService.checkViewLimit({
      videoId,
      applicationId: applicationId as string,
      employerId,
    });

    if (!viewStatus.can_view) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'View limit exceeded (maximum 2 views per video)',
        views_left: 0,
        total_views: viewStatus.total_views,
      });
      return;
    }

    // Attach view status to request for use in route handler
    (req as any).viewStatus = viewStatus;

    next();
  } catch (error: any) {
    console.error('Error in checkVideoViewLimit middleware:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to check view limit',
    });
  }
};
