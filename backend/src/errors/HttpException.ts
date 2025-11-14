/**
 * 360° РАБОТА - HTTP Exceptions
 * Custom error classes for consistent error handling
 *
 * Usage:
 * throw new BadRequestException('Invalid phone format');
 * throw new UnauthorizedException('Invalid token');
 * throw new ForbiddenException('Access denied');
 * throw new NotFoundException('User not found');
 */

/**
 * Base HTTP Exception
 */
export class HttpException extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      error: this.name.replace('Exception', ''),
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * 400 Bad Request
 * Use when client sends invalid data
 */
export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, details);
  }
}

/**
 * 401 Unauthorized
 * Use when authentication is required but missing/invalid
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, details);
  }
}

/**
 * 403 Forbidden
 * Use when user is authenticated but lacks permission
 */
export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, details);
  }
}

/**
 * 404 Not Found
 * Use when requested resource doesn't exist
 */
export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found', details?: any) {
    super(message, 404, details);
  }
}

/**
 * 409 Conflict
 * Use when request conflicts with current state (e.g., duplicate email)
 */
export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict', details?: any) {
    super(message, 409, details);
  }
}

/**
 * 422 Unprocessable Entity
 * Use when request is well-formed but semantically incorrect
 */
export class UnprocessableEntityException extends HttpException {
  constructor(message: string = 'Unprocessable Entity', details?: any) {
    super(message, 422, details);
  }
}

/**
 * 429 Too Many Requests
 * Use for rate limiting
 */
export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Too Many Requests', details?: any) {
    super(message, 429, details);
  }
}

/**
 * 500 Internal Server Error
 * Use for unexpected server errors
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, details);
  }
}

/**
 * 503 Service Unavailable
 * Use when external service is down
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message: string = 'Service Unavailable', details?: any) {
    super(message, 503, details);
  }
}
