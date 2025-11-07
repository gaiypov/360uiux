/**
 * 360° РАБОТА - Vacancy Controller
 * Handles vacancy CRUD operations, search, and filters
 */

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class VacancyController {
  /**
   * Create a new vacancy
   * POST /api/v1/vacancies
   */
  static async createVacancy(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to create vacancies',
        });
      }

      // Check if user is employer
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== 'EMPLOYER') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only employers can create vacancies',
        });
      }

      const {
        title,
        profession,
        description,
        requirements,
        benefits,
        responsibilities,
        salaryMin,
        salaryMax,
        currency,
        city,
        address,
        metroStation,
        employment,
        schedule,
        experienceRequired,
        videoUrl,
        thumbnailUrl,
        tags,
      } = req.body;

      // Validation
      if (!title || !profession || !city) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'title, profession, and city are required',
        });
      }

      // Create vacancy
      const vacancy = await prisma.vacancy.create({
        data: {
          employerId: userId,
          title,
          profession,
          description,
          requirements,
          benefits,
          responsibilities,
          salaryMin,
          salaryMax,
          currency: currency || 'RUB',
          city,
          address,
          metroStation,
          employment,
          schedule,
          experienceRequired: experienceRequired || 0,
          videoUrl,
          thumbnailUrl,
          tags,
          moderationStatus: 'PENDING', // Requires moderation
          status: 'ACTIVE',
        },
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
      });

      return res.status(201).json({
        success: true,
        vacancy,
      });
    } catch (error) {
      console.error('Error in createVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to create vacancy',
      });
    }
  }

  /**
   * Get vacancies with search, filters, and pagination
   * GET /api/v1/vacancies
   */
  static async getVacancies(req: Request, res: Response) {
    try {
      const {
        query, // Search text
        cities, // Comma-separated cities
        experience, // Comma-separated experience levels
        employment, // Comma-separated employment types
        schedule, // Comma-separated schedules
        salaryMin,
        salaryMax,
        limit = '20',
        offset = '0',
        sortBy = 'newest', // newest, salary_high, salary_low, most_views
      } = req.query;

      // Build where clause
      const where: Prisma.VacancyWhereInput = {
        AND: [
          { deletedAt: null },
          { moderationStatus: 'APPROVED' }, // Only show approved vacancies
          { status: 'ACTIVE' },
        ],
      };

      // Text search (title, profession, company)
      if (query && typeof query === 'string') {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { profession: { contains: query, mode: 'insensitive' } },
          { employer: { companyName: { contains: query, mode: 'insensitive' } } },
        ];
      }

      // Cities filter
      if (cities && typeof cities === 'string') {
        const cityArray = cities.split(',').map((c) => c.trim());
        where.AND?.push({ city: { in: cityArray } });
      }

      // Experience filter
      if (experience && typeof experience === 'string') {
        const expArray = experience.split(',').map((e) => parseInt(e));
        where.AND?.push({
          OR: expArray.map((years) => ({
            experienceRequired: { lte: years },
          })),
        });
      }

      // Employment filter
      if (employment && typeof employment === 'string') {
        const empArray = employment.split(',').map((e) => e.trim());
        where.AND?.push({ employment: { in: empArray } });
      }

      // Schedule filter
      if (schedule && typeof schedule === 'string') {
        const schedArray = schedule.split(',').map((s) => s.trim());
        where.AND?.push({ schedule: { in: schedArray } });
      }

      // Salary filter
      if (salaryMin) {
        where.AND?.push({
          OR: [
            { salaryMin: { gte: parseInt(salaryMin as string) } },
            { salaryMax: { gte: parseInt(salaryMin as string) } },
          ],
        });
      }

      if (salaryMax) {
        where.AND?.push({ salaryMin: { lte: parseInt(salaryMax as string) } });
      }

      // Sorting
      let orderBy: Prisma.VacancyOrderByWithRelationInput = { createdAt: 'desc' }; // default: newest

      switch (sortBy) {
        case 'salary_high':
          orderBy = { salaryMax: 'desc' };
          break;
        case 'salary_low':
          orderBy = { salaryMin: 'asc' };
          break;
        case 'most_views':
          orderBy = { viewsCount: 'desc' };
          break;
      }

      // Get vacancies
      const vacancies = await prisma.vacancy.findMany({
        where,
        orderBy,
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
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
      });

      // Get total count
      const totalCount = await prisma.vacancy.count({ where });

      // Get user's liked and favorited vacancies
      let likedVacancyIds: string[] = [];
      let favoritedVacancyIds: string[] = [];

      if (req.user?.userId) {
        const liked = await prisma.vacancyLike.findMany({
          where: { userId: req.user.userId },
          select: { vacancyId: true },
        });
        likedVacancyIds = liked.map((l) => l.vacancyId);

        const favorited = await prisma.favorite.findMany({
          where: { userId: req.user.userId },
          select: { vacancyId: true },
        });
        favoritedVacancyIds = favorited.map((f) => f.vacancyId);
      }

      // Enrich vacancies with user interaction data
      const enrichedVacancies = vacancies.map((v) => ({
        ...v,
        isLiked: likedVacancyIds.includes(v.id),
        isFavorited: favoritedVacancyIds.includes(v.id),
      }));

      return res.json({
        success: true,
        vacancies: enrichedVacancies,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + vacancies.length < totalCount,
        },
      });
    } catch (error) {
      console.error('Error in getVacancies:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get vacancies',
      });
    }
  }

  /**
   * Get a single vacancy by ID
   * GET /api/v1/vacancies/:id
   */
  static async getVacancy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vacancy = await prisma.vacancy.findFirst({
        where: {
          id,
          deletedAt: null,
          moderationStatus: 'APPROVED',
          status: 'ACTIVE',
        },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              verified: true,
              rating: true,
              avatarUrl: true,
              description: true,
              website: true,
            },
          },
        },
      });

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      // Increment views count
      await prisma.vacancy.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });

      // Check if user liked/favorited this vacancy
      let isLiked = false;
      let isFavorited = false;

      if (req.user?.userId) {
        const liked = await prisma.vacancyLike.findUnique({
          where: {
            userId_vacancyId: {
              userId: req.user.userId,
              vacancyId: id,
            },
          },
        });
        isLiked = !!liked;

        const favorited = await prisma.favorite.findUnique({
          where: {
            userId_vacancyId: {
              userId: req.user.userId,
              vacancyId: id,
            },
          },
        });
        isFavorited = !!favorited;
      }

      return res.json({
        success: true,
        vacancy: {
          ...vacancy,
          isLiked,
          isFavorited,
        },
      });
    } catch (error) {
      console.error('Error in getVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get vacancy',
      });
    }
  }

  /**
   * Update a vacancy
   * PUT /api/v1/vacancies/:id
   */
  static async updateVacancy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // Check if vacancy exists and belongs to user
      const existingVacancy = await prisma.vacancy.findUnique({
        where: { id },
      });

      if (!existingVacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      if (existingVacancy.employerId !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own vacancies',
        });
      }

      const {
        title,
        profession,
        description,
        requirements,
        benefits,
        responsibilities,
        salaryMin,
        salaryMax,
        currency,
        city,
        address,
        metroStation,
        employment,
        schedule,
        experienceRequired,
        videoUrl,
        thumbnailUrl,
        tags,
        status,
      } = req.body;

      // Update vacancy
      const vacancy = await prisma.vacancy.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(profession && { profession }),
          ...(description !== undefined && { description }),
          ...(requirements !== undefined && { requirements }),
          ...(benefits !== undefined && { benefits }),
          ...(responsibilities !== undefined && { responsibilities }),
          ...(salaryMin !== undefined && { salaryMin }),
          ...(salaryMax !== undefined && { salaryMax }),
          ...(currency && { currency }),
          ...(city && { city }),
          ...(address !== undefined && { address }),
          ...(metroStation !== undefined && { metroStation }),
          ...(employment && { employment }),
          ...(schedule && { schedule }),
          ...(experienceRequired !== undefined && { experienceRequired }),
          ...(videoUrl !== undefined && { videoUrl }),
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
          ...(tags !== undefined && { tags }),
          ...(status && { status }),
          // Re-submit for moderation if content changed
          ...(title || profession || description || videoUrl
            ? { moderationStatus: 'PENDING' }
            : {}),
        },
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
      });

      return res.json({
        success: true,
        vacancy,
      });
    } catch (error) {
      console.error('Error in updateVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update vacancy',
      });
    }
  }

  /**
   * Delete a vacancy (soft delete)
   * DELETE /api/v1/vacancies/:id
   */
  static async deleteVacancy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in',
        });
      }

      // Check if vacancy exists and belongs to user
      const vacancy = await prisma.vacancy.findUnique({
        where: { id },
      });

      if (!vacancy) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Vacancy not found',
        });
      }

      if (vacancy.employerId !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own vacancies',
        });
      }

      // Soft delete
      await prisma.vacancy.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'CLOSED',
        },
      });

      return res.json({
        success: true,
        message: 'Vacancy deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteVacancy:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete vacancy',
      });
    }
  }

  /**
   * Get available filter options
   * GET /api/v1/vacancies/filters
   */
  static async getFilterOptions(req: Request, res: Response) {
    try {
      // Get unique cities from approved vacancies
      const cities = await prisma.vacancy.findMany({
        where: {
          deletedAt: null,
          moderationStatus: 'APPROVED',
          status: 'ACTIVE',
        },
        select: { city: true },
        distinct: ['city'],
      });

      // Get unique professions
      const professions = await prisma.vacancy.findMany({
        where: {
          deletedAt: null,
          moderationStatus: 'APPROVED',
          status: 'ACTIVE',
        },
        select: { profession: true },
        distinct: ['profession'],
      });

      // Get employment types
      const employmentTypes = await prisma.vacancy.findMany({
        where: {
          deletedAt: null,
          moderationStatus: 'APPROVED',
          status: 'ACTIVE',
        },
        select: { employment: true },
        distinct: ['employment'],
      });

      // Get schedule types
      const schedules = await prisma.vacancy.findMany({
        where: {
          deletedAt: null,
          moderationStatus: 'APPROVED',
          status: 'ACTIVE',
        },
        select: { schedule: true },
        distinct: ['schedule'],
      });

      return res.json({
        success: true,
        filters: {
          cities: cities.map((c) => c.city).filter(Boolean),
          professions: professions.map((p) => p.profession).filter(Boolean),
          employmentTypes: employmentTypes.map((e) => e.employment).filter(Boolean),
          schedules: schedules.map((s) => s.schedule).filter(Boolean),
          experienceLevels: [
            { value: 0, label: 'Без опыта' },
            { value: 1, label: 'От 1 года' },
            { value: 3, label: 'От 3 лет' },
            { value: 5, label: 'От 5 лет' },
          ],
        },
      });
    } catch (error) {
      console.error('Error in getFilterOptions:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get filter options',
      });
    }
  }
}
