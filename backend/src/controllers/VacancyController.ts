/**
 * 360° РАБОТА - Vacancy Controller
 * Контроллер для управления вакансиями
 */

import { Request, Response } from 'express';
import { db } from '../services/database/DatabaseService';
import { Vacancy, VacancyStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class VacancyController {
  /**
   * Создать вакансию
   * POST /api/v1/vacancies
   */
  static async createVacancy(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only employers can create vacancies',
        });
      }

      const {
        title,
        profession,
        video_url,
        thumbnail_url,
        salary_min,
        salary_max,
        currency = 'RUB',
        city,
        metro,
        schedule,
        requires_experience = false,
        benefits,
        requirements,
        tags,
      } = req.body;

      // Валидация обязательных полей
      if (!title || !profession || !video_url || !city) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: title, profession, video_url, city',
        });
      }

      // Создаём вакансию
      const vacancy = await db.one<Vacancy>(
        `INSERT INTO vacancies (
          id, employer_id, title, profession, video_url, thumbnail_url,
          salary_min, salary_max, currency, city, metro, schedule,
          requires_experience, benefits, requirements, tags,
          status, views, applications_count, is_top
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          'draft', 0, 0, false
        ) RETURNING *`,
        [
          uuidv4(),
          user.userId,
          title,
          profession,
          video_url,
          thumbnail_url,
          salary_min,
          salary_max,
          currency,
          city,
          metro,
          schedule,
          requires_experience,
          benefits ? JSON.stringify(benefits) : null,
          requirements ? JSON.stringify(requirements) : null,
          tags ? JSON.stringify(tags) : null,
        ]
      );

      console.log(`✅ Vacancy created: ${vacancy.id} by employer ${user.userId}`);

      return res.status(201).json({
        success: true,
        vacancy,
      });
    } catch (error: any) {
      console.error('❌ Error creating vacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create vacancy',
      });
    }
  }

  /**
   * Получить список вакансий (каталог)
   * GET /api/v1/vacancies
   */
  static async listVacancies(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        city,
        profession,
        salary_min,
        salary_max,
        schedule,
        requires_experience,
        sort = 'created_at', // created_at | salary_min | salary_max
        order = 'DESC',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = Math.min(parseInt(limit as string, 10), 100);
      const offset = (pageNum - 1) * limitNum;

      // Базовый запрос
      let query = `
        SELECT
          v.*,
          u.company_name,
          u.verified as employer_verified,
          u.rating as employer_rating,
          COUNT(*) OVER() as total_count
        FROM vacancies v
        LEFT JOIN users u ON u.id = v.employer_id
        WHERE v.status = 'active'
      `;

      const params: any[] = [];
      let paramIndex = 1;

      // Фильтры
      if (city) {
        query += ` AND v.city = $${paramIndex}`;
        params.push(city);
        paramIndex++;
      }

      if (profession) {
        query += ` AND v.profession ILIKE $${paramIndex}`;
        params.push(`%${profession}%`);
        paramIndex++;
      }

      if (salary_min) {
        query += ` AND v.salary_min >= $${paramIndex}`;
        params.push(parseInt(salary_min as string, 10));
        paramIndex++;
      }

      if (salary_max) {
        query += ` AND v.salary_max <= $${paramIndex}`;
        params.push(parseInt(salary_max as string, 10));
        paramIndex++;
      }

      if (schedule) {
        query += ` AND v.schedule = $${paramIndex}`;
        params.push(schedule);
        paramIndex++;
      }

      if (requires_experience !== undefined) {
        query += ` AND v.requires_experience = $${paramIndex}`;
        params.push(requires_experience === 'true');
        paramIndex++;
      }

      // Сортировка
      const validSortFields = ['created_at', 'salary_min', 'salary_max', 'views'];
      const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';
      const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

      // Топ вакансии сначала
      query += ` ORDER BY v.is_top DESC, v.${sortField} ${sortOrder}`;

      // Пагинация
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limitNum, offset);

      const results = await db.manyOrNone(query, params);

      const vacancies = results.map((row: any) => {
        const { total_count, ...vacancy } = row;
        return vacancy;
      });

      const total = results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

      return res.status(200).json({
        success: true,
        data: vacancies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('❌ Error listing vacancies:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch vacancies',
      });
    }
  }

  /**
   * Получить вакансию по ID
   * GET /api/v1/vacancies/:id
   */
  static async getVacancy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vacancy = await db.oneOrNone<Vacancy>(
        `SELECT
          v.*,
          u.company_name,
          u.inn,
          u.verified as employer_verified,
          u.rating as employer_rating,
          u.avatar_url as employer_avatar
        FROM vacancies v
        LEFT JOIN users u ON u.id = v.employer_id
        WHERE v.id = $1`,
        [id]
      );

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Инкремент просмотров (только для активных вакансий)
      if (vacancy.status === 'active') {
        await db.none(
          'UPDATE vacancies SET views = views + 1 WHERE id = $1',
          [id]
        );
        vacancy.views = (vacancy.views || 0) + 1;
      }

      return res.status(200).json({
        success: true,
        vacancy,
      });
    } catch (error: any) {
      console.error('❌ Error getting vacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch vacancy',
      });
    }
  }

  /**
   * Обновить вакансию
   * PUT /api/v1/vacancies/:id
   */
  static async updateVacancy(req: Request, res: Response) {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only employers can update vacancies',
        });
      }

      // Проверка владения вакансией
      const existing = await db.oneOrNone<Vacancy>(
        'SELECT * FROM vacancies WHERE id = $1',
        [id]
      );

      if (!existing) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      if (existing.employer_id !== user.userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own vacancies',
        });
      }

      const {
        title,
        profession,
        video_url,
        thumbnail_url,
        salary_min,
        salary_max,
        currency,
        city,
        metro,
        schedule,
        requires_experience,
        benefits,
        requirements,
        tags,
        status,
      } = req.body;

      // Валидация статуса
      const validStatuses: VacancyStatus[] = ['draft', 'active', 'paused', 'closed', 'archived'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid status value',
        });
      }

      // Обновление
      const updated = await db.one<Vacancy>(
        `UPDATE vacancies SET
          title = COALESCE($2, title),
          profession = COALESCE($3, profession),
          video_url = COALESCE($4, video_url),
          thumbnail_url = COALESCE($5, thumbnail_url),
          salary_min = COALESCE($6, salary_min),
          salary_max = COALESCE($7, salary_max),
          currency = COALESCE($8, currency),
          city = COALESCE($9, city),
          metro = COALESCE($10, metro),
          schedule = COALESCE($11, schedule),
          requires_experience = COALESCE($12, requires_experience),
          benefits = COALESCE($13, benefits),
          requirements = COALESCE($14, requirements),
          tags = COALESCE($15, tags),
          status = COALESCE($16, status),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [
          id,
          title,
          profession,
          video_url,
          thumbnail_url,
          salary_min,
          salary_max,
          currency,
          city,
          metro,
          schedule,
          requires_experience,
          benefits ? JSON.stringify(benefits) : null,
          requirements ? JSON.stringify(requirements) : null,
          tags ? JSON.stringify(tags) : null,
          status,
        ]
      );

      console.log(`✅ Vacancy updated: ${id}`);

      return res.status(200).json({
        success: true,
        vacancy: updated,
      });
    } catch (error: any) {
      console.error('❌ Error updating vacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update vacancy',
      });
    }
  }

  /**
   * Удалить вакансию
   * DELETE /api/v1/vacancies/:id
   */
  static async deleteVacancy(req: Request, res: Response) {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only employers can delete vacancies',
        });
      }

      // Проверка владения
      const vacancy = await db.oneOrNone<Vacancy>(
        'SELECT * FROM vacancies WHERE id = $1',
        [id]
      );

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      if (vacancy.employer_id !== user.userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own vacancies',
        });
      }

      // Мягкое удаление (архивация)
      await db.none(
        `UPDATE vacancies SET
          status = 'archived',
          updated_at = NOW()
        WHERE id = $1`,
        [id]
      );

      console.log(`🗑️ Vacancy archived: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Vacancy archived successfully',
      });
    } catch (error: any) {
      console.error('❌ Error deleting vacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete vacancy',
      });
    }
  }

  /**
   * Получить вакансии работодателя
   * GET /api/v1/vacancies/my/list
   */
  static async getMyVacancies(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only employers can access this endpoint',
        });
      }

      const { status, page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = Math.min(parseInt(limit as string, 10), 100);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT
          *,
          COUNT(*) OVER() as total_count
        FROM vacancies
        WHERE employer_id = $1
      `;

      const params: any[] = [user.userId];
      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limitNum, offset);

      const results = await db.manyOrNone(query, params);

      const vacancies = results.map((row: any) => {
        const { total_count, ...vacancy } = row;
        return vacancy;
      });

      const total = results.length > 0 ? parseInt(results[0].total_count, 10) : 0;

      return res.status(200).json({
        success: true,
        data: vacancies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('❌ Error getting my vacancies:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch vacancies',
      });
    }
  }

  /**
   * Опубликовать вакансию
   * POST /api/v1/vacancies/:id/publish
   */
  static async publishVacancy(req: Request, res: Response) {
    try {
      const user = req.user;
      const { id } = req.params;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only employers can publish vacancies',
        });
      }

      const vacancy = await db.oneOrNone<Vacancy>(
        'SELECT * FROM vacancies WHERE id = $1 AND employer_id = $2',
        [id, user.userId]
      );

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found or access denied',
        });
      }

      // Публикация
      const updated = await db.one<Vacancy>(
        `UPDATE vacancies SET
          status = 'active',
          published_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [id]
      );

      console.log(`📢 Vacancy published: ${id}`);

      return res.status(200).json({
        success: true,
        vacancy: updated,
      });
    } catch (error: any) {
      console.error('❌ Error publishing vacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to publish vacancy',
      });
    }
  }
}
