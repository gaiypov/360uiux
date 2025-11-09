/**
 * 360° РАБОТА - Winston Logger Configuration
 * Централизованное логирование для production
 */

import winston from 'winston';
import path from 'path';

// Определяем уровень логирования
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Создаем директорию для логов
const logsDir = path.join(process.cwd(), 'logs');

// Форматирование логов
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Форматирование для консоли (более читабельное)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Создаем транспорты
const transports: winston.transport[] = [
  // Консоль (всегда)
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// В production добавляем файловые транспорты
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Все логи
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Только ошибки
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Критичные события (платежи, безопасность)
    new winston.transports.File({
      filename: path.join(logsDir, 'critical.log'),
      level: 'warn',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );
}

// Создаем logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  // Не падать при ошибках логирования
  exitOnError: false,
});

// Вспомогательные методы для специфичных событий

/**
 * Логирование платежных операций
 */
export function logPayment(action: string, data: any) {
  logger.info(`[PAYMENT] ${action}`, { ...data, type: 'payment' });
}

/**
 * Логирование безопасности (попытки взлома, подозрительная активность)
 */
export function logSecurity(event: string, data: any) {
  logger.warn(`[SECURITY] ${event}`, { ...data, type: 'security' });
}

/**
 * Логирование ошибок с контекстом
 */
export function logError(error: Error, context?: any) {
  logger.error(error.message, {
    error: error.stack,
    ...context,
    type: 'error',
  });
}

/**
 * Логирование успешных операций
 */
export function logSuccess(action: string, data?: any) {
  logger.info(`[SUCCESS] ${action}`, { ...data, type: 'success' });
}

// Экспортируем базовый logger
export default logger;
