"use strict";
/**
 * 360° РАБОТА - Video Authentication Middleware
 * Validates video tokens for private video access
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVideoViewLimit = exports.validateVideoToken = void 0;
const PrivateVideoService_1 = require("../services/video/PrivateVideoService");
/**
 * Middleware to validate video access tokens
 * Used for protecting private video streaming endpoints
 */
const validateVideoToken = async (req, res, next) => {
    try {
        // Extract token from query parameter
        const token = req.query.token;
        if (!token) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Video access token is required',
            });
            return;
        }
        // Validate token using PrivateVideoService
        const isValid = await PrivateVideoService_1.privateVideoService.validateVideoToken(token);
        if (!isValid) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired video access token',
            });
            return;
        }
        // Token is valid, proceed to next middleware
        next();
    }
    catch (error) {
        console.error('Error in validateVideoToken middleware:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to validate video token',
        });
    }
};
exports.validateVideoToken = validateVideoToken;
/**
 * Middleware to check if user can access a video
 * Checks view limits before generating secure URL
 */
const checkVideoViewLimit = async (req, res, next) => {
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
        const viewStatus = await PrivateVideoService_1.privateVideoService.checkViewLimit({
            videoId,
            applicationId: applicationId,
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
        req.viewStatus = viewStatus;
        next();
    }
    catch (error) {
        console.error('Error in checkVideoViewLimit middleware:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to check view limit',
        });
    }
};
exports.checkVideoViewLimit = checkVideoViewLimit;
//# sourceMappingURL=videoAuth.js.map