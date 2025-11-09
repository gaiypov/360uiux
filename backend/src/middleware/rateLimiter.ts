/**
 * 360° РАБОТА - Rate Limiting Middleware
 * Защита от DDoS, брутфорса и дорогих SMS счетов
 */

import rateLimit from 'express-rate-limit';

/**
 * Общий лимит для всех API endpoints
 * 100 запросов за 15 минут
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Максимум 100 запросов с одного IP
  message: {
    error: 'Too Many Requests',
    message: 'Слишком много запросов. Попробуйте позже.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * КРИТИЧНО: Строгий лимит для SMS
 * ТОЛЬКО 1 SMS в минуту!
 * Защищает от огромных счетов за SMS
 */
export const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 1, // ТОЛЬКО 1 SMS в минуту с одного IP
  message: {
    error: 'Too Many Requests',
    message: 'Можно отправить только 1 SMS в минуту. Подождите.',
  },
  skipSuccessfulRequests: false,
});

/**
 * Лимит для авторизации
 * Защита от брутфорса паролей/кодов
 * 10 попыток за 15 минут
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // Максимум 10 попыток входа
  message: {
    error: 'Too Many Requests',
    message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
  },
});

/**
 * Лимит для платежей
 * Защита от спама платежами
 * 5 попыток за час
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5, // Максимум 5 платежей в час
  message: {
    error: 'Too Many Requests',
    message: 'Слишком много попыток оплаты. Попробуйте позже.',
  },
});

/**
 * Лимит для создания контента (вакансии, отклики)
 * 20 созданий за час
 */
export const contentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 20,
  message: {
    error: 'Too Many Requests',
    message: 'Слишком много операций. Попробуйте позже.',
  },
});
