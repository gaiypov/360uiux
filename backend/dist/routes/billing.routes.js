"use strict";
/**
 * 360° РАБОТА - Billing Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BillingController_1 = require("../controllers/BillingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ===================================
// WALLET ROUTES
// ===================================
/**
 * Получить баланс кошелька
 * GET /api/v1/billing/wallet/balance
 */
router.get('/wallet/balance', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.getBalance);
/**
 * История транзакций
 * GET /api/v1/billing/wallet/transactions?limit=50&offset=0&type=deposit
 */
router.get('/wallet/transactions', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.getTransactions);
// ===================================
// PAYMENT ROUTES
// ===================================
/**
 * Создать платёж (Tinkoff или Alfabank)
 * POST /api/v1/billing/payment/init
 * Body: { amount: 5000, paymentSystem: 'tinkoff', cardType: 'business' }
 */
router.post('/payment/init', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.initPayment);
/**
 * Webhook от банка
 * POST /api/v1/billing/payment/webhook/:system
 */
router.post('/payment/webhook/:system', BillingController_1.BillingController.handlePaymentWebhook);
/**
 * Проверить статус платежа
 * GET /api/v1/billing/payment/:paymentId/status
 */
router.get('/payment/:paymentId/status', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.checkPaymentStatus);
// ===================================
// INVOICE ROUTES
// ===================================
/**
 * Сформировать счёт
 * POST /api/v1/billing/invoices/generate
 * Body: { items: [{ name, quantity, price, total }], description?, dueDate? }
 */
router.post('/invoices/generate', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.generateInvoice);
/**
 * Получить список счетов
 * GET /api/v1/billing/invoices?limit=50&offset=0&status=paid
 */
router.get('/invoices', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.getInvoices);
/**
 * Скачать счёт в PDF
 * GET /api/v1/billing/invoices/:id/pdf
 */
router.get('/invoices/:id/pdf', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.downloadInvoicePDF);
/**
 * Оплатить счёт из кошелька
 * POST /api/v1/billing/invoices/:id/pay
 */
router.post('/invoices/:id/pay', auth_1.authMiddleware, auth_1.requireEmployer, BillingController_1.BillingController.payInvoiceFromWallet);
// ===================================
// PRICING ROUTES
// ===================================
/**
 * Получить текущие тарифы (public)
 * GET /api/v1/billing/pricing
 */
router.get('/pricing', BillingController_1.BillingController.getPricing);
// ===================================
// ADMIN ROUTES (moderators only)
// ===================================
/**
 * ADMIN: Получить все транзакции всех пользователей
 * GET /api/v1/billing/admin/transactions?limit=50&offset=0&type=deposit&status=completed
 */
router.get('/admin/transactions', auth_1.authMiddleware, BillingController_1.BillingController.getAllTransactions);
/**
 * ADMIN: Статистика по доходам
 * GET /api/v1/billing/admin/revenue-stats?period=month
 */
router.get('/admin/revenue-stats', auth_1.authMiddleware, BillingController_1.BillingController.getRevenueStats);
exports.default = router;
//# sourceMappingURL=billing.routes.js.map