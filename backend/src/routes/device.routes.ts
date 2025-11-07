/**
 * 360° РАБОТА - Device Routes
 * Device registration for push notifications
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { DeviceController } from '../controllers/DeviceController';

const router = Router();

/**
 * Register a device for push notifications
 * POST /api/v1/devices/register
 */
router.post('/register', authMiddleware, DeviceController.registerDevice);

/**
 * Get notification preferences
 * GET /api/v1/devices/preferences
 * Must be before /:id route
 */
router.get('/preferences', authMiddleware, DeviceController.getNotificationPreferences);

/**
 * Update notification preferences
 * PUT /api/v1/devices/preferences
 */
router.put('/preferences', authMiddleware, DeviceController.updateNotificationPreferences);

/**
 * Get user's registered devices
 * GET /api/v1/devices
 */
router.get('/', authMiddleware, DeviceController.getUserDevices);

/**
 * Update device token
 * PUT /api/v1/devices/:id/token
 */
router.put('/:id/token', authMiddleware, DeviceController.updateDeviceToken);

/**
 * Unregister a device
 * DELETE /api/v1/devices/:id
 */
router.delete('/:id', authMiddleware, DeviceController.unregisterDevice);

export default router;
