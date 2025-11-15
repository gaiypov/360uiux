/**
 * 360° РАБОТА - Validation Middleware
 * Validates request body against DTO using class-validator
 *
 * Usage in routes:
 * router.post('/auth/send-code', validate(SendCodeDto), AuthController.sendCode);
 *
 * NOTE: Install dependencies first:
 * npm install class-validator class-transformer
 */

import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Validation middleware factory
 * @param dtoClass - DTO class to validate against
 * @returns Express middleware function
 */
export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform plain object to DTO class instance
      const dtoInstance = plainToClass(dtoClass, req.body);

      // Validate DTO
      const errors: ValidationError[] = await validate(dtoInstance, {
        whitelist: true, // Strip properties not in DTO
        forbidNonWhitelisted: true, // Reject unknown properties
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        return res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: formattedErrors,
        });
      }

      // Replace req.body with validated DTO instance
      req.body = dtoInstance;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation processing failed',
      });
    }
  };
}
