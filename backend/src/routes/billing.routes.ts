/**
 * 360° РАБОТА - Billing Routes
 */

import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import { authMiddleware, requireEmployer } from '../middleware/auth';

const router = Router();

// ===================================
// WALLET ROUTES
// ===================================

/**
 * Получить баланс кошелька
 * GET /api/v1/billing/wallet/balance
 */
router.get('/wallet/balance', authMiddleware, requireEmployer, BillingController.getBalance);

/**
 * История транзакций
 * GET /api/v1/billing/wallet/transactions?limit=50&offset=0&type=deposit
 */
router.get(
  '/wallet/transactions',
  authMiddleware,
  requireEmployer,
  BillingController.getTransactions
);

// ===================================
// PAYMENT ROUTES
// ===================================

/**
 * Создать платёж (Tinkoff или Alfabank)
 * POST /api/v1/billing/payment/init
 * Body: { amount: 5000, paymentSystem: 'tinkoff', cardType: 'business' }
 */
router.post('/payment/init', authMiddleware, requireEmployer, BillingController.initPayment);

/**
 * Webhook от банка
 * POST /api/v1/billing/payment/webhook/:system
 */
router.post('/payment/webhook/:system', BillingController.handlePaymentWebhook);

/**
 * Проверить статус платежа
 * GET /api/v1/billing/payment/:paymentId/status
 */
router.get(
  '/payment/:paymentId/status',
  authMiddleware,
  requireEmployer,
  BillingController.checkPaymentStatus
);

// ===================================
// INVOICE ROUTES
// ===================================

/**
 * Сформировать счёт
 * POST /api/v1/billing/invoices/generate
 * Body: { items: [{ name, quantity, price, total }], description?, dueDate? }
 */
router.post(
  '/invoices/generate',
  authMiddleware,
  requireEmployer,
  BillingController.generateInvoice
);

/**
 * Получить список счетов
 * GET /api/v1/billing/invoices?limit=50&offset=0&status=paid
 */
router.get('/invoices', authMiddleware, requireEmployer, BillingController.getInvoices);

/**
 * Скачать счёт в PDF
 * GET /api/v1/billing/invoices/:id/pdf
 */
router.get(
  '/invoices/:id/pdf',
  authMiddleware,
  requireEmployer,
  BillingController.downloadInvoicePDF
);

/**
 * Оплатить счёт из кошелька
 * POST /api/v1/billing/invoices/:id/pay
 */
router.post(
  '/invoices/:id/pay',
  authMiddleware,
  requireEmployer,
  BillingController.payInvoiceFromWallet
);

// ===================================
// PRICING ROUTES
// ===================================

/**
 * Получить текущие тарифы (public)
 * GET /api/v1/billing/pricing
 */
router.get('/pricing', BillingController.getPricing);

export default router;
