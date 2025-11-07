/**
 * 360° РАБОТА - User Controller
 * Handles user profile management
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
  /**
   * Get current user profile
   * GET /api/v1/profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          description: true,
          avatarUrl: true,
          website: true,
          address: true,
          city: true,
          rating: true,
          verified: true,
          createdAt: true,
          // Exclude sensitive fields
          // password, refreshToken, etc.
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Get user statistics
      let statistics = {};

      if (user.role === 'EMPLOYER') {
        // Employer statistics
        const vacanciesCount = await prisma.vacancy.count({
          where: { employerId: userId, deletedAt: null },
        });

        const activeVacancies = await prisma.vacancy.count({
          where: {
            employerId: userId,
            status: 'ACTIVE',
            deletedAt: null,
          },
        });

        const applicationsReceived = await prisma.application.count({
          where: {
            vacancy: {
              employerId: userId,
            },
          },
        });

        statistics = {
          vacanciesCount,
          activeVacancies,
          applicationsReceived,
        };
      } else {
        // Jobseeker statistics
        const applicationsSent = await prisma.application.count({
          where: { userId },
        });

        const favoritesCount = await prisma.favorite.count({
          where: { userId },
        });

        statistics = {
          applicationsSent,
          favoritesCount,
        };
      }

      return res.json({
        success: true,
        user: {
          ...user,
          statistics,
        },
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get profile',
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const {
        name,
        email,
        companyName,
        description,
        website,
        address,
        city,
      } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Validate email uniqueness if changed
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            id: { not: userId },
          },
        });

        if (emailExists) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Email already in use',
          });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
          ...(companyName !== undefined && { companyName }),
          ...(description !== undefined && { description }),
          ...(website !== undefined && { website }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
        },
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          role: true,
          companyName: true,
          description: true,
          avatarUrl: true,
          website: true,
          address: true,
          city: true,
          rating: true,
          verified: true,
          createdAt: true,
        },
      });

      return res.json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update profile',
      });
    }
  }

  /**
   * Upload avatar (placeholder - requires multer middleware)
   * POST /api/v1/profile/avatar
   */
  static async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // TODO: Implement file upload with multer
      // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
      // For now, return placeholder
      const avatarUrl = req.body.avatarUrl || 'https://placeholder.com/avatar.jpg';

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      });

      return res.json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to upload avatar',
      });
    }
  }

  /**
   * Delete user account (soft delete)
   * DELETE /api/v1/profile
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const { confirmPassword } = req.body;

      if (!confirmPassword) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Password confirmation required',
        });
      }

      // TODO: Verify password before deletion
      // For now, just mark as deleted

      // Soft delete user
      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          // Anonymize email and phone
          email: `deleted_${userId}@deleted.com`,
          phone: `deleted_${userId}`,
        },
      });

      // Also soft delete user's vacancies if employer
      await prisma.vacancy.updateMany({
        where: {
          employerId: userId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          status: 'CLOSED',
        },
      });

      return res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete account',
      });
    }
  }

  /**
   * Get user by ID (public profile)
   * GET /api/v1/users/:id
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          role: true,
          companyName: true,
          description: true,
          avatarUrl: true,
          website: true,
          city: true,
          rating: true,
          verified: true,
          createdAt: true,
          // Exclude private fields
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Get public statistics
      let statistics = {};

      if (user.role === 'EMPLOYER') {
        const activeVacancies = await prisma.vacancy.count({
          where: {
            employerId: id,
            status: 'ACTIVE',
            moderationStatus: 'APPROVED',
            deletedAt: null,
          },
        });

        statistics = {
          activeVacancies,
        };
      }

      return res.json({
        success: true,
        user: {
          ...user,
          statistics,
        },
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get user',
      });
    }
  }
}
