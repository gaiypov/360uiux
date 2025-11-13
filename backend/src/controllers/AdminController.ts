/**
 * Admin Controller - Управление админ панелью
 * Стиль: Revolut ultra
 */

import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
  /**
   * Получить дашборд аналитику
   */
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      // Параллельные запросы для оптимизации
      const [
        totalUsers,
        totalJobseekers,
        totalEmployers,
        totalVacancies,
        activeVacancies,
        totalApplications,
        totalVideos,
        pendingModeration,
        totalComplaints,
        pendingComplaints,
        todayUsers,
        todayVacancies,
        todayApplications,
      ] = await Promise.all([
        // Общее количество пользователей
        prisma.user.count(),

        // Соискатели
        prisma.user.count({ where: { role: UserRole.JOBSEEKER } }),

        // Работодатели
        prisma.user.count({ where: { role: UserRole.EMPLOYER } }),

        // Всего вакансий
        prisma.vacancy.count(),

        // Активные вакансии
        prisma.vacancy.count({ where: { status: 'published' } }),

        // Всего откликов
        prisma.application.count(),

        // Всего видео
        prisma.video.count(),

        // Видео на модерации
        prisma.video.count({
          where: {
            status: { in: ['PENDING_MODERATION', 'AUTO_MODERATION'] }
          }
        }),

        // Всего жалоб
        prisma.videoComplaint.count(),

        // Жалобы на рассмотрении
        prisma.videoComplaint.count({ where: { status: 'pending' } }),

        // Новые пользователи за сегодня
        prisma.user.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        }),

        // Новые вакансии за сегодня
        prisma.vacancy.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        }),

        // Новые отклики за сегодня
        prisma.application.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        }),
      ]);

      // Аналитика за последние 7 дней
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const weeklyUsers = await prisma.user.findMany({
        where: { createdAt: { gte: last7Days } },
        select: { createdAt: true },
      });

      const weeklyVacancies = await prisma.vacancy.findMany({
        where: { createdAt: { gte: last7Days } },
        select: { createdAt: true },
      });

      // Топ работодатели
      const topEmployers = await prisma.user.findMany({
        where: { role: UserRole.EMPLOYER },
        include: {
          vacancies: {
            select: { id: true, applicationsCount: true }
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      const topEmployersFormatted = topEmployers.map(emp => ({
        id: emp.id,
        name: emp.companyName || emp.name || 'Unknown',
        vacanciesCount: emp.vacancies.length,
        totalApplications: emp.vacancies.reduce((sum, v) => sum + v.applicationsCount, 0),
        verified: emp.verified,
      }));

      res.json({
        overview: {
          totalUsers,
          totalJobseekers,
          totalEmployers,
          totalVacancies,
          activeVacancies,
          totalApplications,
          totalVideos,
        },
        moderation: {
          pendingModeration,
          totalComplaints,
          pendingComplaints,
        },
        today: {
          newUsers: todayUsers,
          newVacancies: todayVacancies,
          newApplications: todayApplications,
        },
        charts: {
          weeklyUsers: this.groupByDate(weeklyUsers),
          weeklyVacancies: this.groupByDate(weeklyVacancies),
        },
        topEmployers: topEmployersFormatted,
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }

  /**
   * Получить всех пользователей с фильтрацией и пагинацией
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const {
        page = 1,
        limit = 20,
        role,
        search,
        verified,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { phone: { contains: String(search) } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { companyName: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (verified !== undefined) {
        where.verified = verified === 'true';
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                vacancies: true,
                applications: true,
                videos: true,
              }
            }
          }
        }),
        prisma.user.count({ where }),
      ]);

      const usersFormatted = users.map(u => ({
        id: u.id,
        name: u.name || 'Unknown',
        phone: u.phone,
        email: u.email,
        role: u.role,
        companyName: u.companyName,
        verified: u.verified,
        balance: u.balance,
        createdAt: u.createdAt,
        stats: {
          vacancies: u._count.vacancies,
          applications: u._count.applications,
          videos: u._count.videos,
        }
      }));

      res.json({
        users: usersFormatted,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        }
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  /**
   * Обновить пользователя
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { verified, balance, role } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(verified !== undefined && { verified }),
          ...(balance !== undefined && { balance }),
          ...(role !== undefined && { role }),
        }
      });

      res.json({
        message: 'User updated successfully',
        user: updatedUser,
      });

    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  /**
   * Удалить пользователя
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      await prisma.user.delete({ where: { id } });

      res.json({ message: 'User deleted successfully' });

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  /**
   * Получить все вакансии с фильтрацией
   */
  static async getVacancies(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const {
        page = 1,
        limit = 20,
        status,
        search,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { profession: { contains: String(search), mode: 'insensitive' } },
          { city: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const [vacancies, total] = await Promise.all([
        prisma.vacancy.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            employer: {
              select: {
                id: true,
                companyName: true,
                name: true,
                verified: true,
              }
            },
            _count: {
              select: { applications: true }
            }
          }
        }),
        prisma.vacancy.count({ where }),
      ]);

      const vacanciesFormatted = vacancies.map(v => ({
        id: v.id,
        title: v.title,
        profession: v.profession,
        city: v.city,
        salaryMin: v.salaryMin,
        salaryMax: v.salaryMax,
        status: v.status,
        views: v.views,
        applicationsCount: v._count.applications,
        isTop: v.isTop,
        employer: {
          id: v.employer.id,
          name: v.employer.companyName || v.employer.name,
          verified: v.employer.verified,
        },
        createdAt: v.createdAt,
      }));

      res.json({
        vacancies: vacanciesFormatted,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        }
      });

    } catch (error) {
      console.error('Error fetching vacancies:', error);
      res.status(500).json({ error: 'Failed to fetch vacancies' });
    }
  }

  /**
   * Обновить вакансию
   */
  static async updateVacancy(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { status, isTop } = req.body;

      const updatedVacancy = await prisma.vacancy.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(isTop !== undefined && { isTop }),
        }
      });

      res.json({
        message: 'Vacancy updated successfully',
        vacancy: updatedVacancy,
      });

    } catch (error) {
      console.error('Error updating vacancy:', error);
      res.status(500).json({ error: 'Failed to update vacancy' });
    }
  }

  /**
   * Удалить вакансию
   */
  static async deleteVacancy(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      await prisma.vacancy.delete({ where: { id } });

      res.json({ message: 'Vacancy deleted successfully' });

    } catch (error) {
      console.error('Error deleting vacancy:', error);
      res.status(500).json({ error: 'Failed to delete vacancy' });
    }
  }

  /**
   * Получить все жалобы
   */
  static async getComplaints(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const {
        page = 1,
        limit = 20,
        status,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (status) {
        where.status = status;
      }

      const [complaints, total] = await Promise.all([
        prisma.videoComplaint.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            video: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    companyName: true,
                  }
                }
              }
            }
          }
        }),
        prisma.videoComplaint.count({ where }),
      ]);

      const complaintsFormatted = complaints.map(c => ({
        id: c.id,
        reason: c.reason,
        description: c.description,
        status: c.status,
        createdAt: c.createdAt,
        reviewedBy: c.reviewedBy,
        reviewedAt: c.reviewedAt,
        moderatorComment: c.moderatorComment,
        video: {
          id: c.video.id,
          title: c.video.title,
          type: c.video.type,
          status: c.video.status,
          user: {
            id: c.video.user.id,
            name: c.video.user.companyName || c.video.user.name,
          }
        }
      }));

      res.json({
        complaints: complaintsFormatted,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        }
      });

    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  }

  /**
   * Обработать жалобу
   */
  static async processComplaint(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { status, moderatorComment, blockVideo } = req.body;

      // Обновить жалобу
      const complaint = await prisma.videoComplaint.update({
        where: { id },
        data: {
          status,
          moderatorComment,
          reviewedBy: userId,
          reviewedAt: new Date(),
        },
        include: { video: true }
      });

      // Если нужно заблокировать видео
      if (blockVideo && complaint.videoId) {
        await prisma.video.update({
          where: { id: complaint.videoId },
          data: { status: 'BLOCKED' }
        });

        // Создать лог модерации
        await prisma.moderationLog.create({
          data: {
            videoId: complaint.videoId,
            action: 'blocked_by_complaint',
            performedBy: userId,
            comment: moderatorComment,
            details: { complaintId: id }
          }
        });
      }

      res.json({
        message: 'Complaint processed successfully',
        complaint,
      });

    } catch (error) {
      console.error('Error processing complaint:', error);
      res.status(500).json({ error: 'Failed to process complaint' });
    }
  }

  /**
   * Получить системные настройки
   */
  static async getSettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      // Здесь можно добавить модель настроек в БД
      // Пока возвращаем заглушку
      res.json({
        settings: {
          autoModeration: true,
          guestViewLimit: 3,
          resumeVideoViewLimit: 2,
          topVacancyCostPerDay: 500,
          minimumWithdrawal: 1000,
        }
      });

    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  /**
   * Обновить системные настройки
   */
  static async updateSettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const settings = req.body;

      // Здесь можно сохранить настройки в БД
      // Пока просто возвращаем полученные данные
      res.json({
        message: 'Settings updated successfully',
        settings,
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  /**
   * Вспомогательная функция для группировки по датам
   */
  private static groupByDate(items: { createdAt: Date }[]): { date: string; count: number }[] {
    const grouped: Record<string, number> = {};

    items.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }
}
