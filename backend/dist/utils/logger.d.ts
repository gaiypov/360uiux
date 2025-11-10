/**
 * 360° РАБОТА - Winston Logger Configuration
 * Централизованное логирование для production
 */
import winston from 'winston';
declare const logger: winston.Logger;
/**
 * Логирование платежных операций
 */
export declare function logPayment(action: string, data: any): void;
/**
 * Логирование безопасности (попытки взлома, подозрительная активность)
 */
export declare function logSecurity(event: string, data: any): void;
/**
 * Логирование ошибок с контекстом
 */
export declare function logError(error: Error, context?: any): void;
/**
 * Логирование успешных операций
 */
export declare function logSuccess(action: string, data?: any): void;
export default logger;
//# sourceMappingURL=logger.d.ts.map