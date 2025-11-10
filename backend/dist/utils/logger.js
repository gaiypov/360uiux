"use strict";
/**
 * 360° РАБОТА - Winston Logger Configuration
 * Централизованное логирование для production
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPayment = logPayment;
exports.logSecurity = logSecurity;
exports.logError = logError;
exports.logSuccess = logSuccess;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Определяем уровень логирования
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
// Создаем директорию для логов
const logsDir = path_1.default.join(process.cwd(), 'logs');
// Форматирование логов
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Форматирование для консоли (более читабельное)
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
// Создаем транспорты
const transports = [
    // Консоль (всегда)
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
];
// В production добавляем файловые транспорты
if (process.env.NODE_ENV === 'production') {
    transports.push(
    // Все логи
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5,
    }), 
    // Только ошибки
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5,
    }), 
    // Критичные события (платежи, безопасность)
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'critical.log'),
        level: 'warn',
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 10,
    }));
}
// Создаем logger
const logger = winston_1.default.createLogger({
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
function logPayment(action, data) {
    logger.info(`[PAYMENT] ${action}`, { ...data, type: 'payment' });
}
/**
 * Логирование безопасности (попытки взлома, подозрительная активность)
 */
function logSecurity(event, data) {
    logger.warn(`[SECURITY] ${event}`, { ...data, type: 'security' });
}
/**
 * Логирование ошибок с контекстом
 */
function logError(error, context) {
    logger.error(error.message, {
        error: error.stack,
        ...context,
        type: 'error',
    });
}
/**
 * Логирование успешных операций
 */
function logSuccess(action, data) {
    logger.info(`[SUCCESS] ${action}`, { ...data, type: 'success' });
}
// Экспортируем базовый logger
exports.default = logger;
//# sourceMappingURL=logger.js.map