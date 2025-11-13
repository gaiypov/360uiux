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
   * Получить финансовую аналитику
   */
  static async getFinancialStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { period = '7d' } = req.query;

      // Определяем временной диапазон
      const now = new Date();
      let startDate = new Date();
      switch (period) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Параллельные запросы для финансовой статистики
      const [
        totalRevenue,
        totalDeposits,
        totalPayments,
        totalRefunds,
        pendingTransactions,
        completedTransactions,
        recentTransactions,
        topSpenders,
      ] = await Promise.all([
        // Общая выручка (completed deposits)
        prisma.transaction.aggregate({
          where: {
            type: 'deposit',
            status: 'completed',
          },
          _sum: { amount: true },
        }),

        // Все пополнения
        prisma.transaction.count({
          where: { type: 'deposit', status: 'completed' },
        }),

        // Все платежи (списания)
        prisma.transaction.aggregate({
          where: {
            type: 'payment',
            status: 'completed',
          },
          _sum: { amount: true },
        }),

        // Возвраты
        prisma.transaction.aggregate({
          where: {
            type: 'refund',
            status: 'completed',
          },
          _sum: { amount: true },
        }),

        // Pending транзакции
        prisma.transaction.count({
          where: { status: 'pending' },
        }),

        // Completed за период
        prisma.transaction.count({
          where: {
            status: 'completed',
            createdAt: { gte: startDate },
          },
        }),

        // Последние транзакции
        prisma.transaction.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            wallet: {
              select: {
                employerId: true,
              },
            },
          },
        }),

        // Топ работодатели по тратам
        prisma.transaction.groupBy({
          by: ['walletId'],
          where: {
            type: 'payment',
            status: 'completed',
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
          orderBy: {
            _sum: { amount: 'desc' },
          },
          take: 10,
        }),
      ]);

      // Получаем информацию о топ работодателях (оптимизировано: убрали N+1 проблему)
      let topSpendersWithDetails: any[] = [];

      if (topSpenders.length > 0) {
        const walletIds = topSpenders.map(s => s.walletId);
        const wallets = await prisma.wallet.findMany({
          where: { id: { in: walletIds } },
          select: {
            id: true,
            employerId: true,
          },
        });

        // Получаем всех работодателей одним запросом
        const employerIds = wallets.map(w => w.employerId);
        const employers = employerIds.length > 0
          ? await prisma.user.findMany({
              where: { id: { in: employerIds } },
              select: {
                id: true,
                companyName: true,
                name: true,
                verified: true,
              },
            })
          : [];

        // Создаем Map для быстрого доступа
        const employerMap = new Map(employers.map(e => [e.id, e]));

        topSpendersWithDetails = topSpenders
          .map((spender) => {
            const wallet = wallets.find(w => w.id === spender.walletId);
            if (!wallet) return null;

            const employer = employerMap.get(wallet.employerId);
            if (!employer) return null;

            return {
              employerId: wallet.employerId,
              employerName: employer.companyName || employer.name || 'Unknown',
              verified: employer.verified || false,
              totalSpent: spender._sum.amount || 0,
            };
          })
          .filter(Boolean);
      }

      // Группируем транзакции по датам для графика
      const transactionsByDate = this.groupByDate(
        recentTransactions.filter(t => t.type === 'deposit' && t.status === 'completed')
      );

      res.json({
        overview: {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalDeposits,
          totalPayments: totalPayments._sum.amount || 0,
          totalRefunds: totalRefunds._sum.amount || 0,
          netRevenue: (totalRevenue._sum.amount || 0) - (totalRefunds._sum.amount || 0),
        },
        transactions: {
          pending: pendingTransactions,
          completed: completedTransactions,
        },
        charts: {
          revenueByDate: transactionsByDate,
        },
        topSpenders: topSpendersWithDetails.filter(Boolean),
      });

    } catch (error) {
      console.error('Error fetching financial stats:', error);
      res.status(500).json({ error: 'Failed to fetch financial stats' });
    }
  }

  /**
   * Получить все транзакции с фильтрацией
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const {
        page = 1,
        limit = 20,
        type,
        status,
        employerId,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (employerId) {
        const wallet = await prisma.wallet.findUnique({
          where: { employerId: String(employerId) },
        });
        if (wallet) {
          where.walletId = wallet.id;
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            wallet: {
              select: {
                employerId: true,
              },
            },
          },
        }),
        prisma.transaction.count({ where }),
      ]);

      // Получаем информацию о работодателях
      const employerIds = transactions.map(t => t.wallet.employerId);
      const employers = await prisma.user.findMany({
        where: { id: { in: employerIds } },
        select: {
          id: true,
          companyName: true,
          name: true,
          verified: true,
        },
      });

      const transactionsFormatted = transactions.map(t => {
        const employer = employers.find(e => e.id === t.wallet.employerId);
        return {
          id: t.id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          paymentSystem: t.paymentSystem,
          description: t.description,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
          employer: {
            id: employer?.id,
            name: employer?.companyName || employer?.name,
            verified: employer?.verified,
          },
        };
      });

      res.json({
        transactions: transactionsFormatted,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });

    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  /**
   * Получить детали транзакции
   */
  static async getTransactionDetails(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          wallet: {
            select: {
              id: true,
              employerId: true,
              balance: true,
              currency: true,
            },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const employer = await prisma.user.findUnique({
        where: { id: transaction.wallet.employerId },
        select: {
          id: true,
          companyName: true,
          name: true,
          email: true,
          phone: true,
          verified: true,
        },
      });

      res.json({
        transaction: {
          ...transaction,
          employer,
        },
      });

    } catch (error) {
      console.error('Error fetching transaction details:', error);
      res.status(500).json({ error: 'Failed to fetch transaction details' });
    }
  }

  /**
   * Получить все тарифные планы
   */
  static async getPricingPlans(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const plans = await prisma.pricingPlan.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.json({ plans });

    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      res.status(500).json({ error: 'Failed to fetch pricing plans' });
    }
  }

  /**
   * Создать тарифный план
   */
  static async createPricingPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const {
        name,
        description,
        vacancy_post_price,
        vacancy_top_price,
        vacancy_boost_price,
        application_view_price,
        is_active,
      } = req.body;

      const plan = await prisma.pricingPlan.create({
        data: {
          name,
          description,
          vacancyPostPrice: vacancy_post_price,
          vacancyTopPrice: vacancy_top_price,
          vacancyBoostPrice: vacancy_boost_price,
          applicationViewPrice: application_view_price,
          isActive: is_active ?? true,
        },
      });

      res.json({
        message: 'Pricing plan created successfully',
        plan,
      });

    } catch (error) {
      console.error('Error creating pricing plan:', error);
      res.status(500).json({ error: 'Failed to create pricing plan' });
    }
  }

  /**
   * Обновить тарифный план
   */
  static async updatePricingPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const {
        name,
        description,
        vacancy_post_price,
        vacancy_top_price,
        vacancy_boost_price,
        application_view_price,
        is_active,
      } = req.body;

      const plan = await prisma.pricingPlan.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(vacancy_post_price !== undefined && { vacancyPostPrice: vacancy_post_price }),
          ...(vacancy_top_price !== undefined && { vacancyTopPrice: vacancy_top_price }),
          ...(vacancy_boost_price !== undefined && { vacancyBoostPrice: vacancy_boost_price }),
          ...(application_view_price !== undefined && { applicationViewPrice: application_view_price }),
          ...(is_active !== undefined && { isActive: is_active }),
        },
      });

      res.json({
        message: 'Pricing plan updated successfully',
        plan,
      });

    } catch (error) {
      console.error('Error updating pricing plan:', error);
      res.status(500).json({ error: 'Failed to update pricing plan' });
    }
  }

  /**
   * Удалить тарифный план
   */
  static async deletePricingPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;

      await prisma.pricingPlan.delete({ where: { id } });

      res.json({ message: 'Pricing plan deleted successfully' });

    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      res.status(500).json({ error: 'Failed to delete pricing plan' });
    }
  }

  /**
   * Получить счета
   */
  static async getInvoices(req: Request, res: Response) {
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
        employerId,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (employerId) {
        where.employerId = String(employerId);
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
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
              },
            },
          },
        }),
        prisma.invoice.count({ where }),
      ]);

      res.json({
        invoices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });

    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  }

  /**
   * Обновить счёт
   */
  static async updateInvoice(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.MODERATOR) {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      const { id } = req.params;
      const { status, paid_date } = req.body;

      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(paid_date !== undefined && { paidDate: new Date(paid_date) }),
        },
      });

      res.json({
        message: 'Invoice updated successfully',
        invoice,
      });

    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ error: 'Failed to update invoice' });
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
