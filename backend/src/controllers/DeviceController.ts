/**
 * 360° РАБОТА - Device Controller
 * Handles device registration for push notifications
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DeviceController {
  /**
   * Register a device for push notifications
   * POST /api/v1/devices/register
   */
  static async registerDevice(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const {
        deviceType, // 'ios' | 'android' | 'web'
        fcmToken,
        apnsToken,
        webPushSubscription,
        deviceModel,
        osVersion,
        appVersion,
      } = req.body;

      // Validation
      if (!deviceType || !['ios', 'android', 'web'].includes(deviceType)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Valid deviceType is required (ios, android, or web)',
        });
      }

      if (!fcmToken && !apnsToken && !webPushSubscription) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'At least one token type is required (fcmToken, apnsToken, or webPushSubscription)',
        });
      }

      // Check if device already exists (by token)
      let device;
      const tokenToCheck = fcmToken || apnsToken || JSON.stringify(webPushSubscription);

      const existingDevice = await prisma.userDevice.findFirst({
        where: {
          userId,
          OR: [
            { fcmToken: fcmToken || undefined },
            { apnsToken: apnsToken || undefined },
          ],
        },
      });

      if (existingDevice) {
        // Update existing device
        device = await prisma.userDevice.update({
          where: { id: existingDevice.id },
          data: {
            fcmToken,
            apnsToken,
            webPushSubscription,
            deviceModel,
            osVersion,
            appVersion,
            isActive: true,
            lastSeenAt: new Date(),
          },
        });
      } else {
        // Create new device
        device = await prisma.userDevice.create({
          data: {
            userId,
            deviceType,
            fcmToken,
            apnsToken,
            webPushSubscription,
            deviceModel,
            osVersion,
            appVersion,
            isActive: true,
          },
        });
      }

      return res.status(201).json({
        success: true,
        device: {
          id: device.id,
          deviceType: device.deviceType,
          registeredAt: device.createdAt,
        },
      });
    } catch (error) {
      console.error('Error in registerDevice:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to register device',
      });
    }
  }

  /**
   * Unregister a device
   * DELETE /api/v1/devices/:id
   */
  static async unregisterDevice(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // Check if device belongs to user
      const device = await prisma.userDevice.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!device) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Device not found',
        });
      }

      // Soft delete - mark as inactive
      await prisma.userDevice.update({
        where: { id },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: 'Device unregistered successfully',
      });
    } catch (error) {
      console.error('Error in unregisterDevice:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to unregister device',
      });
    }
  }

  /**
   * Get user's registered devices
   * GET /api/v1/devices
   */
  static async getUserDevices(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const devices = await prisma.userDevice.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          deviceType: true,
          deviceModel: true,
          osVersion: true,
          appVersion: true,
          createdAt: true,
          lastSeenAt: true,
        },
        orderBy: {
          lastSeenAt: 'desc',
        },
      });

      return res.json({
        success: true,
        devices,
        count: devices.length,
      });
    } catch (error) {
      console.error('Error in getUserDevices:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get devices',
      });
    }
  }

  /**
   * Update device token
   * PUT /api/v1/devices/:id/token
   */
  static async updateDeviceToken(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { fcmToken, apnsToken, webPushSubscription } = req.body;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // Check if device belongs to user
      const device = await prisma.userDevice.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!device) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Device not found',
        });
      }

      // Update token
      const updatedDevice = await prisma.userDevice.update({
        where: { id },
        data: {
          ...(fcmToken !== undefined && { fcmToken }),
          ...(apnsToken !== undefined && { apnsToken }),
          ...(webPushSubscription !== undefined && { webPushSubscription }),
          lastSeenAt: new Date(),
        },
      });

      return res.json({
        success: true,
        device: {
          id: updatedDevice.id,
          deviceType: updatedDevice.deviceType,
          updatedAt: updatedDevice.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error in updateDeviceToken:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update device token',
      });
    }
  }

  /**
   * Update notification preferences
   * PUT /api/v1/devices/preferences
   */
  static async updateNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const {
        pushEnabled,
        emailEnabled,
        smsEnabled,
        notificationTypes, // Array of enabled notification types
      } = req.body;

      // Check if preferences exist
      const existingPrefs = await prisma.userNotificationPreference.findUnique({
        where: { userId },
      });

      let preferences;

      if (existingPrefs) {
        // Update existing preferences
        preferences = await prisma.userNotificationPreference.update({
          where: { userId },
          data: {
            ...(pushEnabled !== undefined && { pushEnabled }),
            ...(emailEnabled !== undefined && { emailEnabled }),
            ...(smsEnabled !== undefined && { smsEnabled }),
            ...(notificationTypes !== undefined && { notificationTypes }),
          },
        });
      } else {
        // Create new preferences
        preferences = await prisma.userNotificationPreference.create({
          data: {
            userId,
            pushEnabled: pushEnabled ?? true,
            emailEnabled: emailEnabled ?? true,
            smsEnabled: smsEnabled ?? false,
            notificationTypes: notificationTypes ?? [],
          },
        });
      }

      return res.json({
        success: true,
        preferences: {
          pushEnabled: preferences.pushEnabled,
          emailEnabled: preferences.emailEnabled,
          smsEnabled: preferences.smsEnabled,
          notificationTypes: preferences.notificationTypes,
        },
      });
    } catch (error) {
      console.error('Error in updateNotificationPreferences:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update preferences',
      });
    }
  }

  /**
   * Get notification preferences
   * GET /api/v1/devices/preferences
   */
  static async getNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const preferences = await prisma.userNotificationPreference.findUnique({
        where: { userId },
      });

      // Return defaults if not found
      if (!preferences) {
        return res.json({
          success: true,
          preferences: {
            pushEnabled: true,
            emailEnabled: true,
            smsEnabled: false,
            notificationTypes: [],
          },
        });
      }

      return res.json({
        success: true,
        preferences: {
          pushEnabled: preferences.pushEnabled,
          emailEnabled: preferences.emailEnabled,
          smsEnabled: preferences.smsEnabled,
          notificationTypes: preferences.notificationTypes,
        },
      });
    } catch (error) {
      console.error('Error in getNotificationPreferences:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get preferences',
      });
    }
  }
}
