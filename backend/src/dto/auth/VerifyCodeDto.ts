/**
 * 360° РАБОТА - Verify Code DTO
 * Validation for POST /api/v1/auth/verify-code
 */

import { IsString, Matches, IsNotEmpty, Length, IsNumberString } from 'class-validator';

export class VerifyCodeDto {
  /**
   * Phone number in format +79991234567
   */
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+7\d{10}$/, {
    message: 'Invalid phone format. Must be +79991234567',
  })
  phone!: string;

  /**
   * 4-digit verification code
   */
  @IsNotEmpty({ message: 'Verification code is required' })
  @IsString({ message: 'Code must be a string' })
  @Length(4, 4, { message: 'Code must be exactly 4 digits' })
  @IsNumberString({}, { message: 'Code must contain only numbers' })
  code!: string;
}
