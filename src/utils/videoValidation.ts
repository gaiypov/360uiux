/**
 * Video validation utilities
 */

export interface VideoValidationResult {
  isValid: boolean;
  error?: string;
}

export interface VideoInfo {
  path: string;
  duration: number;
  size: number; // in bytes
  width?: number;
  height?: number;
}

/**
 * Validate video duration
 */
export function validateVideoDuration(
  duration: number,
  minDuration: number,
  maxDuration: number
): VideoValidationResult {
  if (duration < minDuration) {
    return {
      isValid: false,
      error: `Видео слишком короткое. Минимум ${minDuration} сек.`,
    };
  }

  if (duration > maxDuration) {
    return {
      isValid: false,
      error: `Видео слишком длинное. Максимум ${Math.floor(maxDuration / 60)} мин.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate video file size
 */
export function validateVideoSize(
  sizeInBytes: number,
  maxSizeInMB: number = 100
): VideoValidationResult {
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeInMB) {
    return {
      isValid: false,
      error: `Файл слишком большой. Максимум ${maxSizeInMB} МБ.`,
    };
  }

  return { isValid: true };
}

/**
 * Validate video format
 */
export function validateVideoFormat(
  filePath: string,
  allowedFormats: string[] = ['mp4', 'mov', 'avi', 'mkv']
): VideoValidationResult {
  const extension = filePath.split('.').pop()?.toLowerCase();

  if (!extension || !allowedFormats.includes(extension)) {
    return {
      isValid: false,
      error: `Неподдерживаемый формат. Разрешены: ${allowedFormats.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate entire video
 */
export function validateVideo(
  videoInfo: VideoInfo,
  options: {
    minDuration?: number;
    maxDuration?: number;
    maxSizeInMB?: number;
    allowedFormats?: string[];
  } = {}
): VideoValidationResult {
  const {
    minDuration = 10,
    maxDuration = 180,
    maxSizeInMB = 100,
    allowedFormats = ['mp4', 'mov', 'avi', 'mkv'],
  } = options;

  // Check format
  const formatResult = validateVideoFormat(videoInfo.path, allowedFormats);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // Check duration
  const durationResult = validateVideoDuration(
    videoInfo.duration,
    minDuration,
    maxDuration
  );
  if (!durationResult.isValid) {
    return durationResult;
  }

  // Check size
  const sizeResult = validateVideoSize(videoInfo.size, maxSizeInMB);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  return { isValid: true };
}

/**
 * Format video duration for display
 */
export function formatVideoDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  }
}
