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
  static async getPricing(req: Request, res: Response) {
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
}
