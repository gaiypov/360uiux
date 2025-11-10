/**
 * 360° РАБОТА - Billing Controller
 */
import { Request, Response } from 'express';
export declare class BillingController {
    /**
     * Получить баланс кошелька
     * GET /api/v1/billing/wallet/balance
     */
    static getBalance(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить историю транзакций
     * GET /api/v1/billing/wallet/transactions
     */
    static getTransactions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Инициализация платежа
     * POST /api/v1/billing/payment/init
     */
    static initPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Webhook от платёжной системы
     * POST /api/v1/billing/payment/webhook/:system
     */
    static handlePaymentWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Проверить статус платежа
     * GET /api/v1/billing/payment/:paymentId/status
     */
    static checkPaymentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Сгенерировать счёт
     * POST /api/v1/billing/invoices/generate
     */
    static generateInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить список счетов
     * GET /api/v1/billing/invoices
     */
    static getInvoices(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Скачать PDF счёта
     * GET /api/v1/billing/invoices/:id/pdf
     */
    static downloadInvoicePDF(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Оплатить счёт из кошелька
     * POST /api/v1/billing/invoices/:id/pay
     */
    static payInvoiceFromWallet(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить текущие тарифы
     * GET /api/v1/billing/pricing
     */
    static getPricing(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ADMIN: Получить все транзакции всех пользователей
     * GET /api/v1/billing/admin/transactions
     */
    static getAllTransactions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ADMIN: Получить статистику по доходам
     * GET /api/v1/billing/admin/revenue-stats
     */
    static getRevenueStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=BillingController.d.ts.map