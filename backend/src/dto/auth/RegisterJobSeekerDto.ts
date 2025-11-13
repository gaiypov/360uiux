/**
 * 360° РАБОТА - Register JobSeeker DTO
 * Validation for POST /api/v1/auth/register/jobseeker
 */

import { IsString, Matches, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterJobSeekerDto {
  /**
   * Phone number in format +79991234567
   */
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Invalid phone format. Must be +79991234567',
  })
  phone!: string;

  /**
   * Full name (2-100 characters)
   */
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name!: string;

  /**
   * Profession/Job title
   */
  @IsNotEmpty({ message: 'Profession is required' })
  @IsString()
  @MinLength(2, { message: 'Profession must be at least 2 characters' })
  @MaxLength(100, { message: 'Profession must not exceed 100 characters' })
  profession!: string;

  /**
   * City
   */
  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city!: string;
}
