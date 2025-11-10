/**
 * 360° РАБОТА - Billing Controller
 */

import { Request, Response } from 'express';
import { TinkoffPaymentService } from '../services/TinkoffPaymentService';
import { AlfabankPaymentService } from '../services/AlfabankPaymentService';
import { InvoiceService } from '../services/InvoiceService';
import { WalletService } from '../services/WalletService';
import { InitPaymentRequest } from '../types';

export class BillingController {
  /**
   * Получить баланс кошелька
   * GET /api/v1/billing/wallet/balance
   */
  static async getBalance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const wallet = await WalletService.getOrCreateWallet(req.user.userId);

      return res.json({
        balance: wallet.balance,
        currency: wallet.currency,
      });
    } catch (error) {
      console.error('Error in getBalance:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get balance',
      });
    }
  }

  /**
   * Получить историю транзакций
   * GET /api/v1/billing/wallet/transactions
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { limit, offset, type } = req.query;

      const transactions = await WalletService.getTransactions(req.user.userId, {
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        type: type as any,
      });

      return res.json({
        transactions,
        count: transactions.length,
      });
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get transactions',
      });
    }
  }

  /**
   * Инициализация платежа
   * POST /api/v1/billing/payment/init
   */
  static async initPayment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount, paymentSystem, cardType }: InitPaymentRequest = req.body;

      // Валидация
      if (!amount || amount < 100) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Minimum amount is 100 RUB',
        });
      }

      if (!paymentSystem || !['tinkoff', 'alfabank'].includes(paymentSystem)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid payment system. Use "tinkoff" or "alfabank"',
        });
      }

      // Получаем данные пользователя
      const { db } = require('../config/database');
      const user = await db.one('SELECT * FROM users WHERE id = $1', [req.user.userId]);

      // Создаём транзакцию
      const transaction = await WalletService.createTransaction({
        userId: req.user.userId,
        type: 'deposit',
        amount,
        status: 'pending',
        paymentSystem,
        cardType,
        description: `Deposit ${amount} RUB`,
      });

      // Выбираем платёжную систему
      let paymentUrl: string;

      if (paymentSystem === 'tinkoff') {
        const tinkoff = new TinkoffPaymentService();
        const payment = await tinkoff.initPayment({
          orderId: transaction.id,
          amount,
          description: `Пополнение кошелька на ${amount} ₽`,
          email: user.email || '',
          phone: user.phone,
        });

        paymentUrl = payment.paymentUrl;

        // Сохраняем paymentId
        await WalletService.updateTransaction(transaction.id, {
          paymentId: payment.paymentId,
        });
      } else {
        const alfa = new AlfabankPaymentService();
        const payment = await alfa.registerOrder({
          orderNumber: transaction.id,
          amount,
          returnUrl: `${process.env.APP_URL}/payment/success`,
          description: `Пополнение кошелька на ${amount} ₽`,
          email: user.email,
          phone: user.phone,
        });

        paymentUrl = payment.formUrl;

        await WalletService.updateTransaction(transaction.id, {
          paymentId: payment.orderId,
        });
      }

      return res.json({
        transactionId: transaction.id,
        paymentUrl,
        amount,
      });
    } catch (error) {
      console.error('Error in initPayment:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to init payment',
      });
    }
  }

  /**
   * Webhook от платёжной системы
   * POST /api/v1/billing/payment/webhook/:system
   */
  static async handlePaymentWebhook(req: Request, res: Response) {
    try {
      const { system } = req.params;
      const data = req.body;

      if (system === 'tinkoff') {
        const tinkoff = new TinkoffPaymentService();

        // Проверяем токен
        const isValid = tinkoff.validateWebhookToken(data);
        if (!isValid) {
          return res.status(400).json({ error: 'Invalid token' });
        }

        // Обрабатываем статус
        if (data.Status === 'CONFIRMED') {
          await WalletService.completeTransaction(data.OrderId, {
            amount: data.Amount / 100,
          });
        } else if (data.Status === 'REJECTED' || data.Status === 'CANCELED') {
          await WalletService.updateTransaction(data.OrderId, {
            status: 'failed',
          });
        }
      } else if (system === 'alfabank') {
        const alfabank = new AlfabankPaymentService();

        // 🔴 КРИТИЧНО: Валидация webhook от Alfabank
        const checksumSecret = process.env.ALFABANK_CHECKSUM_SECRET || '';

        if (!checksumSecret) {
          console.error('❌ ALFABANK_CHECKSUM_SECRET не установлен!');
          return res.status(500).json({ error: 'Configuration error' });
        }

        const isValid = alfabank.validateWebhook(data, checksumSecret);

        if (!isValid) {
          console.error('❌ Invalid Alfabank webhook signature!');
          console.error('Data:', JSON.stringify(data));
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        // Обработать Alfabank webhook
        if (data.status === 1) {
          // Оплачено
          await WalletService.completeTransaction(data.mdOrder, {
            amount: data.amount / 100,
          });
        } else if (data.status === 2) {
          // Отменено
          await WalletService.updateTransaction(data.mdOrder, {
            status: 'cancelled',
          });
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error in handlePaymentWebhook:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process webhook',
      });
    }
  }

  /**
   * Проверить статус платежа
   * GET /api/v1/billing/payment/:paymentId/status
   */
  static async checkPaymentStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { paymentId } = req.params;

      const transaction = await WalletService.getTransaction(paymentId);

      if (!transaction) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Transaction not found',
        });
      }

      return res.json({
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        createdAt: transaction.created_at,
        completedAt: transaction.completed_at,
      });
    } catch (error) {
      console.error('Error in checkPaymentStatus:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check payment status',
      });
    }
  }

  /**
   * Сгенерировать счёт
   * POST /api/v1/billing/invoices/generate
   */
  static async generateInvoice(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { items, description, dueDate } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Items array is required',
        });
      }

      const invoice = await InvoiceService.generateInvoice({
        employerId: req.user.userId,
        items,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      return res.status(201).json(invoice);
    } catch (error) {
      console.error('Error in generateInvoice:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate invoice',
      });
    }
  }

  /**
   * Получить список счетов
   * GET /api/v1/billing/invoices
   */
  static async getInvoices(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { limit, offset, status } = req.query;

      const invoices = await InvoiceService.getInvoices(req.user.userId, {
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        status: status as any,
      });

      return res.json({
        invoices,
        count: invoices.length,
      });
    } catch (error) {
      console.error('Error in getInvoices:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get invoices',
      });
    }
  }

  /**
   * Скачать PDF счёта
   * GET /api/v1/billing/invoices/:id/pdf
   */
  static async downloadInvoicePDF(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const invoice = await InvoiceService.getInvoice(id, req.user.userId);
      const pdfBuffer = await InvoiceService.generatePDF(invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice-${invoice.invoice_number}.pdf`
      );

      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error in downloadInvoicePDF:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to download invoice',
      });
    }
  }

  /**
   * Оплатить счёт из кошелька
   * POST /api/v1/billing/invoices/:id/pay
   */
  static async payInvoiceFromWallet(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const invoice = await InvoiceService.payInvoiceFromWallet(id, req.user.userId);

      return res.json({
        success: true,
        invoice,
      });
    } catch (error) {
      console.error('Error in payInvoiceFromWallet:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to pay invoice',
      });
    }
  }

  /**
   * Получить текущие тарифы
   * GET /api/v1/billing/pricing
   */
  static async getPricing(_req: Request, res: Response) {
    try {
      const { db } = require('../config/database');

      const plans = await db.manyOrNone(
        'SELECT * FROM pricing_plans WHERE is_active = true ORDER BY created_at DESC'
      );

      return res.json({
        plans: plans || [],
      });
    } catch (error) {
      console.error('Error in getPricing:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get pricing',
      });
    }
  }

  /**
   * ADMIN: Получить все транзакции всех пользователей
   * GET /api/v1/billing/admin/transactions
   */
  static async getAllTransactions(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'moderator') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const { limit = '50', offset = '0', type, status, userId } = req.query;

      const { db } = require('../services/database/DatabaseService');

      let query = `
        SELECT
          t.*,
          cw.employer_id,
          u.company_name,
          u.email,
          u.phone
        FROM transactions t
        LEFT JOIN company_wallets cw ON cw.id = t.wallet_id
        LEFT JOIN users u ON u.id = cw.employer_id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (type) {
        query += ` AND t.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status) {
        query += ` AND t.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (userId) {
        query += ` AND cw.employer_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const transactions = await db.manyOrNone(query, params);

      // Получить общую статистику
      const stats = await db.one(`
        SELECT
          COUNT(*) as total_count,
          SUM(CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_deposits,
          SUM(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_payments,
          SUM(CASE WHEN t.status = 'pending' THEN t.amount ELSE 0 END) as pending_amount
        FROM transactions t
      `);

      return res.json({
        success: true,
        transactions: transactions || [],
        count: transactions?.length || 0,
        stats: {
          total_count: parseInt(stats.total_count || '0'),
          total_deposits: parseFloat(stats.total_deposits || '0'),
          total_payments: parseFloat(stats.total_payments || '0'),
          pending_amount: parseFloat(stats.pending_amount || '0'),
        },
      });
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get all transactions',
      });
    }
  }

  /**
   * ADMIN: Получить статистику по доходам
   * GET /api/v1/billing/admin/revenue-stats
   */
  static async getRevenueStats(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'moderator') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const { period = 'month' } = req.query; // day, week, month, year

      const { db } = require('../services/database/DatabaseService');

      let intervalValue = '30 days';
      let groupFormat = 'YYYY-MM-DD';

      switch (period) {
        case 'day':
          intervalValue = '1 day';
          groupFormat = 'YYYY-MM-DD HH24:00';
          break;
        case 'week':
          intervalValue = '7 days';
          groupFormat = 'YYYY-MM-DD';
          break;
        case 'month':
          intervalValue = '30 days';
          groupFormat = 'YYYY-MM-DD';
          break;
        case 'year':
          intervalValue = '12 months';
          groupFormat = 'YYYY-MM';
          break;
      }

      // Используем интервал напрямую в запросе (безопасно, т.к. значения контролируются switch)
      const revenueByPeriod = await db.manyOrNone(`
        SELECT
          TO_CHAR(created_at, $1) as period,
          SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits,
          SUM(CASE WHEN type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) as payments,
          COUNT(*) as transactions_count
        FROM transactions
        WHERE created_at >= NOW() - INTERVAL '${intervalValue}'
        GROUP BY TO_CHAR(created_at, $1)
        ORDER BY period ASC
      `, [groupFormat]);

      // Топ работодателей по тратам
      const topSpenders = await db.manyOrNone(`
        SELECT
          u.id,
          u.company_name,
          u.email,
          SUM(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_spent,
          COUNT(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN 1 END) as transactions_count
        FROM transactions t
        LEFT JOIN company_wallets cw ON cw.id = t.wallet_id
        LEFT JOIN users u ON u.id = cw.employer_id
        WHERE t.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY u.id, u.company_name, u.email
        HAVING SUM(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN t.amount ELSE 0 END) > 0
        ORDER BY total_spent DESC
        LIMIT 10
      `);

      return res.json({
        success: true,
        revenue_by_period: revenueByPeriod || [],
        top_spenders: topSpenders || [],
      });
    } catch (error) {
      console.error('Error in getRevenueStats:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get revenue stats',
      });
    }
  }
}
