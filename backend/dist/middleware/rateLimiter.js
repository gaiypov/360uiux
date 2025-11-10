"use strict";
/**
 * 360° РАБОТА - Rate Limiting Middleware
 * Защита от DDoS, брутфорса и дорогих SMS счетов
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentCreationLimiter = exports.paymentLimiter = exports.authLimiter = exports.smsLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Общий лимит для всех API endpoints
 * 100 запросов за 15 минут
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
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
exports.smsLimiter = (0, express_rate_limit_1.default)({
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
exports.authLimiter = (0, express_rate_limit_1.default)({
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
exports.paymentLimiter = (0, express_rate_limit_1.default)({
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
exports.contentCreationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 20,
    message: {
        error: 'Too Many Requests',
        message: 'Слишком много операций. Попробуйте позже.',
    },
});
//# sourceMappingURL=rateLimiter.js.map