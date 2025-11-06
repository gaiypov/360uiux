/**
 * 360° РАБОТА - Vacancy Interactions Controller
 * Handles likes, comments, and favorites for vacancies
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VacancyInteractionsController {
  /**
   * Like a vacancy
   * POST /api/v1/vacancies/:id/like
   */
  static async likeVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to like vacancies',
        });
      }

      // Check if vacancy exists
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Check if already liked
      const existingLike = await prisma.vacancyLike.findUnique({
        where: {
          userId_vacancyId: {
            userId,
            vacancyId,
          },
        },
      });

      if (existingLike) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Vacancy already liked',
          liked: true,
        });
      }

      // Create like
      await prisma.vacancyLike.create({
        data: {
          userId,
          vacancyId,
        },
      });

      return res.status(201).json({
        success: true,
        liked: true,
      });
    } catch (error) {
      console.error('Error in likeVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to like vacancy',
      });
    }
  }

  /**
   * Unlike a vacancy
   * DELETE /api/v1/vacancies/:id/like
   */
  static async unlikeVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // Delete like
      const deletedLike = await prisma.vacancyLike.deleteMany({
        where: {
          userId,
          vacancyId,
        },
      });

      if (deletedLike.count === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Like not found',
          liked: false,
        });
      }

      return res.json({
        success: true,
        liked: false,
      });
    } catch (error) {
      console.error('Error in unlikeVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to unlike vacancy',
      });
    }
  }

  /**
   * Favorite a vacancy
   * POST /api/v1/vacancies/:id/favorite
   */
  static async favoriteVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to favorite vacancies',
        });
      }

      // Check if vacancy exists
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Check if already favorited
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_vacancyId: {
            userId,
            vacancyId,
          },
        },
      });

      if (existingFavorite) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Vacancy already favorited',
          favorited: true,
        });
      }

      // Create favorite
      await prisma.favorite.create({
        data: {
          userId,
          vacancyId,
        },
      });

      return res.status(201).json({
        success: true,
        favorited: true,
      });
    } catch (error) {
      console.error('Error in favoriteVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to favorite vacancy',
      });
    }
  }

  /**
   * Unfavorite a vacancy
   * DELETE /api/v1/vacancies/:id/favorite
   */
  static async unfavoriteVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // Delete favorite
      const deletedFavorite = await prisma.favorite.deleteMany({
        where: {
          userId,
          vacancyId,
        },
      });

      if (deletedFavorite.count === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Favorite not found',
          favorited: false,
        });
      }

      return res.json({
        success: true,
        favorited: false,
      });
    } catch (error) {
      console.error('Error in unfavoriteVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to unfavorite vacancy',
      });
    }
  }

  /**
   * Add a comment to a vacancy
   * POST /api/v1/vacancies/:id/comments
   */
  static async addComment(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const { text } = req.body;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to comment',
        });
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Comment text is required',
        });
      }

      if (text.length > 500) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Comment text must be 500 characters or less',
        });
      }

      // Check if vacancy exists
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Get user info for cached fields
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, avatarUrl: true },
      });

      // Create comment
      const comment = await prisma.vacancyComment.create({
        data: {
          vacancyId,
          userId,
          userName: user?.name || 'Аноним',
          userAvatar: user?.avatarUrl,
          text: text.trim(),
        },
      });

      return res.status(201).json({
        success: true,
        comment: {
          id: comment.id,
          text: comment.text,
          userName: comment.userName,
          userAvatar: comment.userAvatar,
          likesCount: comment.likesCount,
          createdAt: comment.createdAt,
        },
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to add comment',
      });
    }
  }

  /**
   * Get comments for a vacancy
   * GET /api/v1/vacancies/:id/comments
   */
  static async getComments(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const { limit = '50', offset = '0' } = req.query;

      // Check if vacancy exists
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
      });

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Get comments
      const comments = await prisma.vacancyComment.findMany({
        where: { vacancyId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
      });

      // Get total count
      const totalCount = await prisma.vacancyComment.count({
        where: { vacancyId },
      });

      return res.json({
        success: true,
        comments: comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          userName: comment.userName,
          userAvatar: comment.userAvatar,
          likesCount: comment.likesCount,
          createdAt: comment.createdAt,
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + comments.length < totalCount,
        },
      });
    } catch (error) {
      console.error('Error in getComments:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get comments',
      });
    }
  }

  /**
   * Get user's favorite vacancies
   * GET /api/v1/favorites
   */
  static async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      const { limit = '20', offset = '0' } = req.query;

      // Get favorites with vacancy details
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
        include: {
          vacancy: {
            include: {
              employer: {
                select: {
                  id: true,
                  companyName: true,
                  verified: true,
                  rating: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // Get total count
      const totalCount = await prisma.favorite.count({
        where: { userId },
      });

      return res.json({
        success: true,
        favorites: favorites.map((fav) => ({
          id: fav.id,
          vacancy: fav.vacancy,
          createdAt: fav.createdAt,
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + favorites.length < totalCount,
        },
      });
    } catch (error) {
      console.error('Error in getFavorites:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get favorites',
      });
    }
  }
}
