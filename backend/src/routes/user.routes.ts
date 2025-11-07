/**
 * 360° РАБОТА - User Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { UserController } from '../controllers/UserController';

const router = Router();

/**
 * Get current user profile
 * GET /api/v1/users/profile
 */
router.get('/profile', authMiddleware, UserController.getProfile);

/**
 * Update current user profile
 * PUT /api/v1/users/profile
 */
router.put('/profile', authMiddleware, UserController.updateProfile);

/**
 * Upload avatar
 * POST /api/v1/users/profile/avatar
 */
router.post('/profile/avatar', authMiddleware, UserController.uploadAvatar);

/**
 * Delete account
 * DELETE /api/v1/users/profile
 */
router.delete('/profile', authMiddleware, UserController.deleteAccount);

/**
 * Get user profile by ID (public)
 * GET /api/v1/users/:id
 */
router.get('/:id', UserController.getUserById);

export default router;
