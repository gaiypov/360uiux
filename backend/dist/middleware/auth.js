"use strict";
/**
 * 360° РАБОТА - Authentication Middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireEmployer = requireEmployer;
exports.requireJobSeeker = requireJobSeeker;
exports.requireRole = requireRole;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
/**
 * Main authentication middleware
 * Verifies JWT token and attaches user data to request
 */
function authMiddleware(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Attach user data to request
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid token',
        });
        return;
    }
}
/**
 * Middleware to check if user is employer
 */
function requireEmployer(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
        return;
    }
    if (req.user.role !== 'employer') {
        res.status(403).json({
            error: 'Forbidden',
            message: 'This action is only available to employers',
        });
        return;
    }
    next();
}
/**
 * Middleware to check if user is jobseeker
 */
function requireJobSeeker(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
        return;
    }
    if (req.user.role !== 'jobseeker') {
        res.status(403).json({
            error: 'Forbidden',
            message: 'This action is only available to job seekers',
        });
        return;
    }
    next();
}
/**
 * Middleware to check for specific roles
 */
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions',
            });
            return;
        }
        next();
    };
}
/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
function optionalAuth(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = (0, jwt_1.verifyAccessToken)(token);
            req.user = payload;
        }
        next();
    }
    catch (error) {
        // Ignore errors, continue without authentication
        next();
    }
}
//# sourceMappingURL=auth.js.map