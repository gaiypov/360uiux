/**
 * 360° РАБОТА - Vacancy Interactions Controller
 * Лайки, избранное, комментарии (Architecture v3)
 */

import { Request, Response } from 'express';
import { db } from '../services/database/DatabaseService';

export class VacancyInteractionsController {
  /**
   * Лайкнуть вакансию
   * POST /api/v1/vacancies/:id/like
   */
  static async likeVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user!.userId;

      // Проверяем что вакансия существует
      const vacancy = await db.oneOrNone(
        'SELECT id FROM vacancies WHERE id = $1',
        [vacancyId]
      );

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Проверяем что еще не лайкнули
      const existingLike = await db.oneOrNone(
        'SELECT * FROM vacancy_likes WHERE vacancy_id = $1 AND user_id = $2',
        [vacancyId, userId]
      );

      if (existingLike) {
        return res.json({
          success: true,
          liked: true,
          message: 'Already liked',
        });
      }

      // Создаем лайк
      await db.none(
        `INSERT INTO vacancy_likes (vacancy_id, user_id, created_at)
         VALUES ($1, $2, NOW())`,
        [vacancyId, userId]
      );

      // Увеличиваем счетчик лайков у вакансии
      await db.none(
        `UPDATE vacancies
         SET likes_count = likes_count + 1
         WHERE id = $1`,
        [vacancyId]
      );

      console.log(`👍 User ${userId} liked vacancy ${vacancyId}`);

      return res.json({
        success: true,
        liked: true,
      });
    } catch (error: any) {
      console.error('Error in likeVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to like vacancy',
      });
    }
  }

  /**
   * Убрать лайк с вакансии
   * DELETE /api/v1/vacancies/:id/like
   */
  static async unlikeVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user!.userId;

      // Удаляем лайк
      const result = await db.oneOrNone(
        'DELETE FROM vacancy_likes WHERE vacancy_id = $1 AND user_id = $2 RETURNING id',
        [vacancyId, userId]
      );

      if (result) {
        // Уменьшаем счетчик лайков у вакансии
        await db.none(
          `UPDATE vacancies
           SET likes_count = GREATEST(likes_count - 1, 0)
           WHERE id = $1`,
          [vacancyId]
        );

        console.log(`👎 User ${userId} unliked vacancy ${vacancyId}`);
      }

      return res.json({
        success: true,
        liked: false,
      });
    } catch (error: any) {
      console.error('Error in unlikeVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to unlike vacancy',
      });
    }
  }

  /**
   * Добавить в избранное
   * POST /api/v1/vacancies/:id/favorite
   */
  static async favoriteVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user!.userId;

      // Проверяем что вакансия существует
      const vacancy = await db.oneOrNone(
        'SELECT id FROM vacancies WHERE id = $1',
        [vacancyId]
      );

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Проверяем что еще не в избранном
      const existingFavorite = await db.oneOrNone(
        'SELECT * FROM vacancy_favorites WHERE vacancy_id = $1 AND user_id = $2',
        [vacancyId, userId]
      );

      if (existingFavorite) {
        return res.json({
          success: true,
          favorited: true,
          message: 'Already in favorites',
        });
      }

      // Добавляем в избранное
      await db.none(
        `INSERT INTO vacancy_favorites (vacancy_id, user_id, created_at)
         VALUES ($1, $2, NOW())`,
        [vacancyId, userId]
      );

      console.log(`⭐ User ${userId} favorited vacancy ${vacancyId}`);

      return res.json({
        success: true,
        favorited: true,
      });
    } catch (error: any) {
      console.error('Error in favoriteVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to favorite vacancy',
      });
    }
  }

  /**
   * Убрать из избранного
   * DELETE /api/v1/vacancies/:id/favorite
   */
  static async unfavoriteVacancy(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const userId = req.user!.userId;

      // Удаляем из избранного
      await db.none(
        'DELETE FROM vacancy_favorites WHERE vacancy_id = $1 AND user_id = $2',
        [vacancyId, userId]
      );

      console.log(`⭐ User ${userId} unfavorited vacancy ${vacancyId}`);

      return res.json({
        success: true,
        favorited: false,
      });
    } catch (error: any) {
      console.error('Error in unfavoriteVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to unfavorite vacancy',
      });
    }
  }

  /**
   * Получить мои лайки
   * GET /api/v1/vacancies/likes/my
   */
  static async getMyLikes(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const likes = await db.manyOrNone(
        `SELECT vl.*, v.title, v.company_name, v.salary_from, v.salary_to, v.city
         FROM vacancy_likes vl
         JOIN vacancies v ON v.id = vl.vacancy_id
         WHERE vl.user_id = $1
         ORDER BY vl.created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        likes: likes || [],
      });
    } catch (error: any) {
      console.error('Error in getMyLikes:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get likes',
      });
    }
  }

  /**
   * Получить мои избранные
   * GET /api/v1/vacancies/favorites/my
   */
  static async getMyFavorites(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const favorites = await db.manyOrNone(
        `SELECT vf.*, v.title, v.company_name, v.salary_from, v.salary_to, v.city,
                v.description, v.requirements, v.responsibilities, v.benefits
         FROM vacancy_favorites vf
         JOIN vacancies v ON v.id = vf.vacancy_id
         WHERE vf.user_id = $1
         ORDER BY vf.created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        favorites: favorites || [],
      });
    } catch (error: any) {
      console.error('Error in getMyFavorites:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get favorites',
      });
    }
  }

  /**
   * Добавить комментарий
   * POST /api/v1/vacancies/:id/comments
   */
  static async addComment(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const { text } = req.body;
      const userId = req.user!.userId;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Comment text is required',
        });
      }

      // Проверяем что вакансия существует
      const vacancy = await db.oneOrNone(
        'SELECT id FROM vacancies WHERE id = $1',
        [vacancyId]
      );

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Создаем комментарий
      const comment = await db.one(
        `INSERT INTO vacancy_comments (vacancy_id, user_id, text, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [vacancyId, userId, text.trim()]
      );

      console.log(`💬 User ${userId} commented on vacancy ${vacancyId}`);

      return res.status(201).json({
        success: true,
        comment,
      });
    } catch (error: any) {
      console.error('Error in addComment:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add comment',
      });
    }
  }

  /**
   * Получить комментарии вакансии
   * GET /api/v1/vacancies/:id/comments
   */
  static async getComments(req: Request, res: Response) {
    try {
      const { id: vacancyId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const comments = await db.manyOrNone(
        `SELECT vc.*, u.name as user_name
         FROM vacancy_comments vc
         LEFT JOIN users u ON u.id = vc.user_id
         WHERE vc.vacancy_id = $1
         ORDER BY vc.created_at DESC
         LIMIT $2 OFFSET $3`,
        [vacancyId, limit, offset]
      );

      return res.json({
        success: true,
        comments: comments || [],
      });
    } catch (error: any) {
      console.error('Error in getComments:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get comments',
      });
    }
  }
}
