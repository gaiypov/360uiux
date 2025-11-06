/**
 * 360° РАБОТА - Authentication Controller
 */

import { Request, Response } from 'express';
import { db } from '../config/database';
import { SMSService } from '../services/SMSService';
import { WalletService } from '../services/WalletService';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import {
  User,
  LoginRequest,
  VerifyCodeRequest,
  RegisterJobSeekerRequest,
  RegisterEmployerRequest,
} from '../types';

export class AuthController {
  /**
   * Отправить SMS код
   * POST /api/v1/auth/send-code
   */
  static async sendCode(req: Request, res: Response) {
    try {
      const { phone }: LoginRequest = req.body;

      if (!phone) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Phone number is required',
        });
      }

      // Валидация формата телефона
      const phoneRegex = /^\+7\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid phone format. Use +79991234567',
        });
      }

      const smsService = new SMSService();
      const { expiresAt } = await smsService.sendVerificationCode(phone);

      return res.json({
        success: true,
        message: 'Verification code sent',
        expiresAt,
      });
    } catch (error) {
      console.error('Error in sendCode:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to send code',
      });
    }
  }

  /**
   * Проверить SMS код и войти
   * POST /api/v1/auth/verify-code
   */
  static async verifyCode(req: Request, res: Response) {
    try {
      const { phone, code }: VerifyCodeRequest = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Phone and code are required',
        });
      }

      // Проверяем код
      const smsService = new SMSService();
      await smsService.verifyCode(phone, code);

      // Проверяем, существует ли пользователь
      const user = await db.oneOrNone<User>(
        'SELECT * FROM users WHERE phone = $1',
        [phone]
      );

      if (!user) {
        // Пользователь не найден - нужна регистрация
        return res.json({
          success: true,
          requiresRegistration: true,
          phone,
        });
      }

      // Пользователь существует - генерируем токены
      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      // Сохраняем refresh token
      await db.none(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [tokens.refreshToken, user.id]
      );

      return res.json({
        success: true,
        requiresRegistration: false,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role,
          name: user.name,
          company_name: user.company_name,
          verified: user.verified,
        },
        tokens,
      });
    } catch (error) {
      console.error('Error in verifyCode:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to verify code',
      });
    }
  }

  /**
   * Регистрация соискателя
   * POST /api/v1/auth/register/jobseeker
   */
  static async registerJobSeeker(req: Request, res: Response) {
    try {
      const { phone, name, profession, city }: RegisterJobSeekerRequest = req.body;

      if (!phone || !name || !profession || !city) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Phone, name, profession and city are required',
        });
      }

      // Проверяем, что пользователь не существует
      const existingUser = await db.oneOrNone(
        'SELECT id FROM users WHERE phone = $1',
        [phone]
      );

      if (existingUser) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User already exists',
        });
      }

      // Создаём пользователя
      const user = await db.one<User>(
        `INSERT INTO users (phone, role, name, profession, city)
         VALUES ($1, 'jobseeker', $2, $3, $4)
         RETURNING *`,
        [phone, name, profession, city]
      );

      // Генерируем токены
      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      // Сохраняем refresh token
      await db.none(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [tokens.refreshToken, user.id]
      );

      return res.status(201).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          name: user.name,
          profession: user.profession,
          city: user.city,
        },
        tokens,
      });
    } catch (error) {
      console.error('Error in registerJobSeeker:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register jobseeker',
      });
    }
  }

  /**
   * Регистрация работодателя
   * POST /api/v1/auth/register/employer
   */
  static async registerEmployer(req: Request, res: Response) {
    try {
      const { phone, email, company_name, inn, legal_address }: RegisterEmployerRequest = req.body;

      if (!phone || !email || !company_name || !inn) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Phone, email, company name and INN are required',
        });
      }

      // Проверяем уникальность телефона и ИНН
      const existingUser = await db.oneOrNone(
        'SELECT id FROM users WHERE phone = $1 OR inn = $2',
        [phone, inn]
      );

      if (existingUser) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'User with this phone or INN already exists',
        });
      }

      // Создаём пользователя
      const user = await db.one<User>(
        `INSERT INTO users (phone, email, role, company_name, inn, legal_address, verified)
         VALUES ($1, $2, 'employer', $3, $4, $5, false)
         RETURNING *`,
        [phone, email, company_name, inn, legal_address || null]
      );

      // Создаём кошелёк для работодателя
      await WalletService.getOrCreateWallet(user.id);

      // Генерируем токены
      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      // Сохраняем refresh token
      await db.none(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [tokens.refreshToken, user.id]
      );

      return res.status(201).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role,
          company_name: user.company_name,
          inn: user.inn,
          verified: user.verified,
        },
        tokens,
      });
    } catch (error) {
      console.error('Error in registerEmployer:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register employer',
      });
    }
  }

  /**
   * Обновление access token через refresh token
   * POST /api/v1/auth/refresh
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
      }

      // Проверяем refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Проверяем, что токен совпадает с сохранённым
      const user = await db.oneOrNone<User>(
        'SELECT * FROM users WHERE id = $1 AND refresh_token = $2',
        [payload.userId, refreshToken]
      );

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid refresh token',
        });
      }

      // Генерируем новые токены
      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      // Обновляем refresh token
      await db.none(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [tokens.refreshToken, user.id]
      );

      return res.json({
        success: true,
        tokens,
      });
    } catch (error) {
      console.error('Error in refreshToken:', error);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Failed to refresh token',
      });
    }
  }

  /**
   * Выход (logout)
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Not authenticated',
        });
      }

      // Удаляем refresh token
      await db.none(
        'UPDATE users SET refresh_token = NULL WHERE id = $1',
        [req.user.userId]
      );

      return res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Error in logout:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to logout',
      });
    }
  }

  /**
   * Получить текущего пользователя
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Not authenticated',
        });
      }

      const user = await db.one<User>(
        'SELECT * FROM users WHERE id = $1',
        [req.user.userId]
      );

      return res.json({
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar_url: user.avatar_url,
        profession: user.profession,
        city: user.city,
        company_name: user.company_name,
        inn: user.inn,
        verified: user.verified,
        rating: user.rating,
        created_at: user.created_at,
      });
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get user',
      });
    }
  }
}
