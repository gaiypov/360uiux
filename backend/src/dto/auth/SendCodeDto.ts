/**
 * 360° РАБОТА - Send Code DTO
 * Validation for POST /api/v1/auth/send-code
 *
 * NOTE: Install class-validator first:
 * npm install class-validator class-transformer
 */

import { IsString, Matches, IsNotEmpty } from 'class-validator';

export class SendCodeDto {
  /**
   * Phone number in format +79991234567
   */
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+7\d{10}$/, {
    message: 'Invalid phone format. Must be +79991234567',
  })
  phone!: string;
}
