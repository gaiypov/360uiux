/**
 * 360° РАБОТА - Rate Limiting Middleware
 * Защита от DDoS, брутфорса и дорогих SMS счетов
 */
/**
 * Общий лимит для всех API endpoints
 * 100 запросов за 15 минут
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * КРИТИЧНО: Строгий лимит для SMS
 * ТОЛЬКО 1 SMS в минуту!
 * Защищает от огромных счетов за SMS
 */
export declare const smsLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Лимит для авторизации
 * Защита от брутфорса паролей/кодов
 * 10 попыток за 15 минут
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Лимит для платежей
 * Защита от спама платежами
 * 5 попыток за час
 */
export declare const paymentLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Лимит для создания контента (вакансии, отклики)
 * 20 созданий за час
 */
export declare const contentCreationLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map