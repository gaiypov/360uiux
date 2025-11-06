/**
 * 360° РАБОТА - Application Controller
 * Architecture v3: Отклики с приватными видео-резюме
 */

import { Request, Response } from 'express';
import { db } from '../config/database';
import { chatService } from '../services/ChatService';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationController {
  /**
   * Создать отклик на вакансию
   * POST /api/applications
   * Body: { vacancyId, resumeId?, message?, attachResumeVideo: boolean }
   */
  static async createApplication(req: Request, res: Response) {
    try {
      const { vacancyId, resumeId, message, attachResumeVideo } = req.body;
      const jobseekerId = req.user!.userId;
      const role = req.user!.role;

      // Проверка роли
      if (role !== 'jobseeker') {
        return res.status(403).json({ error: 'Only job seekers can apply to vacancies' });
      }

      // Валидация
      if (!vacancyId) {
        return res.status(400).json({ error: 'Vacancy ID is required' });
      }

      // Проверить что вакансия существует
      const vacancy = await db.oneOrNone(
        'SELECT * FROM vacancies WHERE id = $1 AND status = $2',
        [vacancyId, 'active']
      );

      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy not found or not active' });
      }

      // Проверить что уже не откликнулись
      const existingApplication = await db.oneOrNone(
        'SELECT * FROM applications WHERE vacancy_id = $1 AND jobseeker_id = $2',
        [vacancyId, jobseekerId]
      );

      if (existingApplication) {
        return res.status(400).json({ error: 'You have already applied to this vacancy' });
      }

      // Получить видео-резюме если прикрепляем
      let resumeVideoId = null;
      if (attachResumeVideo) {
        if (resumeId) {
          // Получить видео из резюме
          const resume = await db.oneOrNone(
            'SELECT * FROM resumes WHERE id = $1 AND jobseeker_id = $2',
            [resumeId, jobseekerId]
          );

          if (resume && resume.video_id) {
            resumeVideoId = resume.video_id;
          } else {
            return res.status(400).json({
              error: 'Selected resume does not have a video',
            });
          }
        } else {
          // Попробовать найти видео напрямую
          const video = await db.oneOrNone(
            'SELECT * FROM videos WHERE user_id = $1 AND type = $2',
            [jobseekerId, 'resume']
          );

          if (video) {
            resumeVideoId = video.id;
          } else {
            return res.status(400).json({
              error: 'You do not have a resume video',
            });
          }
        }
      }

      // Создать отклик
      const chatRoomId = uuidv4();
      const application = await db.one(
        `INSERT INTO applications (
          vacancy_id, jobseeker_id, resume_id, message,
          resume_video_id, chat_room_id,
          status, employer_status,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'new', 'new', NOW())
        RETURNING *`,
        [vacancyId, jobseekerId, resumeId || null, message || null, resumeVideoId, chatRoomId]
      );

      // Создать системное сообщение в чате
      await chatService.createSystemMessage(
        application.id,
        'Соискатель откликнулся на вашу вакансию'
      );

      // Если прикреплено видео - создать видео-сообщение
      if (resumeVideoId) {
        await chatService.createVideoMessage(application.id, jobseekerId, resumeVideoId);
      }

      // Создать сообщение от соискателя если есть текст
      if (message) {
        await chatService.createMessage({
          applicationId: application.id,
          senderId: jobseekerId,
          senderType: 'jobseeker',
          messageType: 'text',
          content: message,
        });
      }

      // Увеличить счетчик откликов у вакансии
      await db.none(
        'UPDATE vacancies SET applications_count = applications_count + 1 WHERE id = $1',
        [vacancyId]
      );

      console.log(`✅ Application created: ${application.id}`);

      return res.status(201).json({
        success: true,
        application,
        message: 'Application submitted successfully',
      });
    } catch (error: any) {
      console.error('Create application error:', error);
      return res.status(500).json({
        error: 'Failed to create application',
        message: error.message,
      });
    }
  }

  /**
   * Получить мои отклики (для соискателя)
   * GET /api/applications/my
   */
  static async getMyApplications(req: Request, res: Response) {
    try {
      const jobseekerId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'jobseeker') {
        return res.status(403).json({ error: 'Only job seekers can access this endpoint' });
      }

      const applications = await db.manyOrNone(
        `SELECT
          a.*,
          v.title as vacancy_title,
          v.profession as vacancy_profession,
          v.city as vacancy_city,
          v.salary_min,
          v.salary_max,
          u.company_name as employer_name
        FROM applications a
        JOIN vacancies v ON v.id = a.vacancy_id
        JOIN users u ON u.id = v.employer_id
        WHERE a.jobseeker_id = $1
        ORDER BY a.created_at DESC`,
        [jobseekerId]
      );

      return res.json({
        success: true,
        applications: applications || [],
        count: applications?.length || 0,
      });
    } catch (error: any) {
      console.error('Get my applications error:', error);
      return res.status(500).json({
        error: 'Failed to get applications',
        message: error.message,
      });
    }
  }

  /**
   * Получить отклики на вакансию (для работодателя)
   * GET /api/applications/vacancy/:vacancyId
   */
  static async getVacancyApplications(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can access this endpoint' });
      }

      // Проверить что вакансия принадлежит работодателю
      const vacancy = await db.oneOrNone(
        'SELECT * FROM vacancies WHERE id = $1 AND employer_id = $2',
        [vacancyId, employerId]
      );

      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy not found or access denied' });
      }

      // Получить отклики
      const applications = await db.manyOrNone(
        `SELECT
          a.*,
          u.name as jobseeker_name,
          u.profession as jobseeker_profession,
          u.city as jobseeker_city,
          u.salary_expected,
          u.avatar_url,
          r.id as resume_id,
          r.experience,
          r.skills
        FROM applications a
        JOIN users u ON u.id = a.jobseeker_id
        LEFT JOIN resumes r ON r.id = a.resume_id
        WHERE a.vacancy_id = $1
        ORDER BY a.created_at DESC`,
        [vacancyId]
      );

      return res.json({
        success: true,
        applications: applications || [],
        count: applications?.length || 0,
      });
    } catch (error: any) {
      console.error('Get vacancy applications error:', error);
      return res.status(500).json({
        error: 'Failed to get applications',
        message: error.message,
      });
    }
  }

  /**
   * Обновить статус отклика (для работодателя)
   * PUT /api/applications/:id/status
   * Body: { employerStatus: 'viewed' | 'interview' | 'rejected' | 'accepted', notes? }
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { employerStatus, notes } = req.body;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can update application status' });
      }

      // Проверить что отклик на вакансию работодателя
      const application = await db.oneOrNone(
        `SELECT a.*, v.employer_id
         FROM applications a
         JOIN vacancies v ON v.id = a.vacancy_id
         WHERE a.id = $1`,
        [id]
      );

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (application.employer_id !== employerId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Обновить статус
      const updated = await db.one(
        `UPDATE applications
         SET employer_status = $1,
             employer_notes = $2,
             responded_at = CASE WHEN employer_status = 'new' THEN NOW() ELSE responded_at END,
             viewed_at = CASE WHEN employer_status = 'new' THEN NOW() ELSE viewed_at END,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [employerStatus, notes || null, id]
      );

      // Создать системное сообщение
      let systemMessage = '';
      switch (employerStatus) {
        case 'viewed':
          systemMessage = 'Работодатель просмотрел ваш отклик';
          break;
        case 'interview':
          systemMessage = 'Работодатель приглашает вас на собеседование';
          break;
        case 'rejected':
          systemMessage = 'Работодатель отклонил ваш отклик';
          break;
        case 'accepted':
          systemMessage = 'Поздравляем! Работодатель принял ваш отклик';
          break;
      }

      if (systemMessage) {
        await chatService.createSystemMessage(id, systemMessage);
      }

      console.log(`✅ Application status updated: ${id} -> ${employerStatus}`);

      return res.json({
        success: true,
        application: updated,
        message: 'Application status updated successfully',
      });
    } catch (error: any) {
      console.error('Update application status error:', error);
      return res.status(500).json({
        error: 'Failed to update application status',
        message: error.message,
      });
    }
  }

  /**
   * Получить детали отклика
   * GET /api/applications/:id
   */
  static async getApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Получить отклик с проверкой доступа
      const application = await db.oneOrNone(
        `SELECT
          a.*,
          v.title as vacancy_title,
          v.employer_id,
          u.name as jobseeker_name,
          u.profession as jobseeker_profession
        FROM applications a
        JOIN vacancies v ON v.id = a.vacancy_id
        JOIN users u ON u.id = a.jobseeker_id
        WHERE a.id = $1`,
        [id]
      );

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Проверить доступ
      const isJobseeker = application.jobseeker_id === userId;
      const isEmployer = application.employer_id === userId;

      if (!isJobseeker && !isEmployer) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json({
        success: true,
        application,
      });
    } catch (error: any) {
      console.error('Get application error:', error);
      return res.status(500).json({
        error: 'Failed to get application',
        message: error.message,
      });
    }
  }

  /**
   * Удалить отклик (только соискатель может удалить свой отклик)
   * DELETE /api/applications/:id
   */
  static async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'jobseeker') {
        return res.status(403).json({ error: 'Only job seekers can delete applications' });
      }

      // Проверить владельца
      const application = await db.oneOrNone(
        'SELECT * FROM applications WHERE id = $1 AND jobseeker_id = $2',
        [id, userId]
      );

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Удалить (cascade удалит chat messages)
      await db.none('DELETE FROM applications WHERE id = $1', [id]);

      // Уменьшить счетчик откликов
      await db.none(
        'UPDATE vacancies SET applications_count = applications_count - 1 WHERE id = $1',
        [application.vacancy_id]
      );

      console.log(`🗑️ Application deleted: ${id}`);

      return res.json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete application error:', error);
      return res.status(500).json({
        error: 'Failed to delete application',
        message: error.message,
      });
    }
  }

  // ===================================
  // ARCHITECTURE V3: ENHANCED APPLICATION MANAGEMENT
  // ===================================

  /**
   * Получить отклики по статусу (для работодателя)
   * GET /api/v1/applications?status=pending|viewed|interview|rejected|hired|cancelled
   * Architecture v3: Enhanced with timeline tracking
   */
  static async getApplicationsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can access this endpoint' });
      }

      // Валидация статуса
      const validStatuses = ['pending', 'viewed', 'interview', 'rejected', 'hired', 'cancelled'];
      if (status && !validStatuses.includes(status as string)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Построить запрос
      let query = `
        SELECT
          a.*,
          u.name as jobseeker_name,
          u.profession as jobseeker_profession,
          u.city as jobseeker_city,
          u.avatar_url,
          v.title as vacancy_title,
          v.id as vacancy_id,
          (
            SELECT COUNT(*)
            FROM chat_messages cm
            WHERE cm.application_id = a.id
            AND cm.sender_type = 'jobseeker'
            AND cm.is_read = false
          ) as unread_count
        FROM applications a
        JOIN users u ON u.id = a.jobseeker_id
        JOIN vacancies v ON v.id = a.vacancy_id
        WHERE v.employer_id = $1
      `;

      const params: any[] = [employerId];

      if (status) {
        query += ' AND a.status = $2';
        params.push(status);
      }

      query += ' ORDER BY a.last_message_at DESC NULLS LAST, a.created_at DESC';

      const applications = await db.manyOrNone(query, params);

      return res.json({
        success: true,
        applications: applications || [],
        count: applications?.length || 0,
        status: status || 'all',
      });
    } catch (error: any) {
      console.error('Get applications by status error:', error);
      return res.status(500).json({
        error: 'Failed to get applications',
        message: error.message,
      });
    }
  }

  /**
   * Обновить статус отклика (расширенный)
   * PATCH /api/v1/applications/:id/status
   * Body: { status: 'pending' | 'viewed' | 'interview' | 'rejected' | 'hired' | 'cancelled', rejectionReason?: string }
   * Architecture v3: With timeline tracking
   */
  static async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const employerId = req.user!.userId;
      const role = req.user!.role;

      if (role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can update application status' });
      }

      // Валидация статуса
      const validStatuses = ['pending', 'viewed', 'interview', 'rejected', 'hired', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Проверить что отклик на вакансию работодателя
      const application = await db.oneOrNone(
        `SELECT a.*, v.employer_id
         FROM applications a
         JOIN vacancies v ON v.id = a.vacancy_id
         WHERE a.id = $1`,
        [id]
      );

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (application.employer_id !== employerId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Обновить статус с временными метками
      const updated = await db.one(
        `UPDATE applications
         SET status = $1,
             viewed_at = CASE WHEN $1 = 'viewed' THEN COALESCE(viewed_at, NOW()) ELSE viewed_at END,
             interview_scheduled_at = CASE WHEN $1 = 'interview' THEN NOW() ELSE interview_scheduled_at END,
             rejected_at = CASE WHEN $1 = 'rejected' THEN NOW() ELSE rejected_at END,
             hired_at = CASE WHEN $1 = 'hired' THEN NOW() ELSE hired_at END,
             cancelled_at = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END,
             rejection_reason = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, status === 'rejected' ? rejectionReason : null, id]
      );

      // Создать системное сообщение
      let systemMessage = '';
      switch (status) {
        case 'viewed':
          systemMessage = 'Работодатель просмотрел ваш отклик';
          break;
        case 'interview':
          systemMessage = 'Работодатель приглашает вас на собеседование';
          break;
        case 'rejected':
          systemMessage = rejectionReason
            ? `Отклик отклонен. Причина: ${rejectionReason}`
            : 'Работодатель отклонил ваш отклик';
          break;
        case 'hired':
          systemMessage = 'Поздравляем! Вы приняты на работу!';
          break;
        case 'cancelled':
          systemMessage = 'Отклик отменен работодателем';
          break;
      }

      if (systemMessage) {
        await chatService.createSystemMessage(id, systemMessage);
      }

      console.log(`✅ Application status updated: ${id} -> ${status}`);

      return res.json({
        success: true,
        application: updated,
        message: 'Application status updated successfully',
      });
    } catch (error: any) {
      console.error('Update application status error:', error);
      return res.status(500).json({
        error: 'Failed to update application status',
        message: error.message,
      });
    }
  }
}
