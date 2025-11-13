/**
 * 360° РАБОТА - Auth Controller (Optimized Example)
 *
 * This is an EXAMPLE showing how to use:
 * - DTO validation (SendCodeDto, VerifyCodeDto, etc.)
 * - Custom exceptions (BadRequestException, UnauthorizedException, etc.)
 * - asyncHandler wrapper for error catching
 * - Clean, type-safe code
 *
 * USAGE:
 * 1. Review this example
 * 2. Apply patterns to your existing AuthController.ts
 * 3. Delete this file when done
 *
 * Key improvements over current AuthController.ts:
 * - ✅ Type-safe with DTOs (req.body is validated)
 * - ✅ Throws typed exceptions instead of generic res.status(500)
 * - ✅ No need for try/catch (asyncHandler catches errors)
 * - ✅ Consistent error responses via errorHandler middleware
 * - ✅ Better code readability
 */

import { Request, Response } from 'express';
import { db } from '../config/database';
import { smscService } from '../services/sms/SMSCService';
import { jwtService } from '../services/auth/JwtService';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  TooManyRequestsException,
  ConflictException,
} from '../errors/HttpException';
import { asyncHandler } from '../middleware/errorHandler';
import { SendCodeDto } from '../dto/auth/SendCodeDto';
import { VerifyCodeDto } from '../dto/auth/VerifyCodeDto';
import { RegisterJobSeekerDto } from '../dto/auth/RegisterJobSeekerDto';

export class AuthControllerOptimized {
  /**
   * Send SMS verification code
   * POST /api/v1/auth/send-code
   *
   * Request body validated by SendCodeDto middleware
   */
  static sendCode = asyncHandler(async (req: Request, res: Response) => {
    // req.body is now a validated SendCodeDto instance
    const { phone } = req.body as SendCodeDto;

    console.log(`📱 Sending code to ${phone}`);

    // Check rate limiting (max 3 attempts per minute)
    const recentAttempts = await db.oneOrNone(
      `SELECT COUNT(*) as count FROM sms_codes
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
      [phone]
    );

    if (recentAttempts && parseInt(recentAttempts.count) >= 3) {
      throw new TooManyRequestsException(
        'Too many SMS requests. Please wait 1 minute.',
        { retryAfter: 60 }
      );
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Send SMS via SMSC.ru
    const smsResult = await smscService.sendCode(phone, code);

    if (!smsResult.success) {
      throw new BadRequestException('Failed to send SMS', {
        reason: smsResult.error,
        provider: 'smsc.ru',
      });
    }

    // Save code to database
    await db.none(
      `INSERT INTO sms_codes (phone, code, expires_at, created_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes', NOW())`,
      [phone, code]
    );

    console.log(`✅ SMS sent to ${phone} (expires in 5 min)`);

    return res.json({
      success: true,
      message: 'Verification code sent',
      expiresIn: 300, // 5 minutes in seconds
    });
  });

  /**
   * Verify SMS code and login/register
   * POST /api/v1/auth/verify-code
   *
   * Request body validated by VerifyCodeDto middleware
   */
  static verifyCode = asyncHandler(async (req: Request, res: Response) => {
    const { phone, code } = req.body as VerifyCodeDto;

    console.log(`🔐 Verifying code for ${phone}`);

    // Find valid code
    const smsCode = await db.oneOrNone(
      `SELECT * FROM sms_codes
       WHERE phone = $1 AND code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    );

    if (!smsCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Delete used code (prevent reuse)
    await db.none('DELETE FROM sms_codes WHERE id = $1', [smsCode.id]);

    // Check if user exists
    const existingUser = await db.oneOrNone(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser) {
      // Existing user - login
      console.log(`✅ User found, logging in: ${existingUser.id}`);

      const tokens = jwtService.generateTokens({
        userId: existingUser.id,
        phone: existingUser.phone,
        role: existingUser.role,
      });

      // Save refresh token
      await db.none(
        `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
         VALUES ($1, $2, NOW() + INTERVAL '30 days', NOW())`,
        [existingUser.id, tokens.refreshToken]
      );

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: existingUser.id,
          phone: existingUser.phone,
          name: existingUser.name,
          role: existingUser.role,
          profileComplete: existingUser.profile_complete,
        },
        tokens,
      });
    } else {
      // New user - return phone verified status
      console.log(`📝 New user, phone verified: ${phone}`);

      return res.json({
        success: true,
        message: 'Phone verified. Complete registration.',
        phoneVerified: true,
        requiresRegistration: true,
      });
    }
  });

  /**
   * Register new job seeker
   * POST /api/v1/auth/register/jobseeker
   *
   * Request body validated by RegisterJobSeekerDto middleware
   */
  static registerJobSeeker = asyncHandler(async (req: Request, res: Response) => {
    const { phone, name, profession, city } = req.body as RegisterJobSeekerDto;

    console.log(`📝 Registering job seeker: ${phone}`);

    // Check if user already exists
    const existingUser = await db.oneOrNone(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser) {
      throw new ConflictException('User with this phone already exists', {
        userId: existingUser.id,
      });
    }

    // Create user
    const user = await db.one(
      `INSERT INTO users (
        phone, name, role, profile_complete,
        created_at, updated_at
      )
      VALUES ($1, $2, 'jobseeker', false, NOW(), NOW())
      RETURNING *`,
      [phone, name]
    );

    // Create job seeker profile
    await db.none(
      `INSERT INTO jobseeker_profiles (
        user_id, profession, city, created_at, updated_at
      )
      VALUES ($1, $2, $3, NOW(), NOW())`,
      [user.id, profession, city]
    );

    // Generate tokens
    const tokens = jwtService.generateTokens({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    // Save refresh token
    await db.none(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days', NOW())`,
      [user.id, tokens.refreshToken]
    );

    console.log(`✅ Job seeker registered: ${user.id}`);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        profileComplete: user.profile_complete,
      },
      tokens,
    });
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Verify refresh token
    const payload = jwtService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token exists in database
    const tokenRecord = await db.oneOrNone(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND user_id = $2 AND expires_at > NOW()`,
      [refreshToken, payload.userId]
    );

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    // Get user
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [payload.userId]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new tokens
    const newTokens = jwtService.generateTokens({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    // Delete old refresh token
    await db.none('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

    // Save new refresh token
    await db.none(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days', NOW())`,
      [user.id, newTokens.refreshToken]
    );

    console.log(`🔄 Tokens refreshed for user ${user.id}`);

    return res.json({
      success: true,
      tokens: newTokens,
    });
  });

  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const userId = req.user?.userId; // From authMiddleware

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Delete refresh token if provided
    if (refreshToken) {
      await db.none(
        'DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2',
        [refreshToken, userId]
      );
    } else {
      // Delete all refresh tokens for user
      await db.none('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    }

    console.log(`👋 User ${userId} logged out`);

    return res.json({
      success: true,
      message: 'Logout successful',
    });
  });
}

/**
 * COMPARISON: Old vs New
 *
 * OLD WAY (error-prone):
 * ---
 * static async sendCode(req: Request, res: Response) {
 *   try {
 *     const { phone } = req.body;
 *
 *     // No validation - what if phone is invalid format?
 *     if (!phone) {
 *       return res.status(400).json({ error: 'Phone required' });
 *     }
 *
 *     // ... logic ...
 *
 *     return res.json({ success: true });
 *   } catch (error) {
 *     console.error(error);
 *     return res.status(500).json({ error: 'Internal error' });
 *   }
 * }
 *
 * NEW WAY (clean, type-safe):
 * ---
 * static sendCode = asyncHandler(async (req: Request, res: Response) => {
 *   // req.body already validated by validateDto(SendCodeDto) middleware
 *   const { phone } = req.body as SendCodeDto;
 *
 *   // ... logic ...
 *
 *   // Throw typed exceptions, errorHandler catches them
 *   if (rateLimited) {
 *     throw new TooManyRequestsException('Wait 1 minute');
 *   }
 *
 *   return res.json({ success: true });
 * });
 * // No try/catch needed - asyncHandler + errorHandler handle it
 */
