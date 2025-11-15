/**
 * 360° РАБОТА - Upload Video DTO
 * Validation for POST /api/v1/vacancies/:id/video
 */

import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UploadVideoDto {
  /**
   * Video title
   */
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  /**
   * Video description
   */
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;
}
