/**
 * 360° РАБОТА - Wallet Service
 * Управление кошельком и транзакциями
 */

import { db } from '../config/database';
import {
  Wallet,
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentSystem,
  CardType,
} from '../types';

export interface CreateTransactionParams {
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentSystem?: PaymentSystem;
  cardType?: CardType;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionParams {
  status?: TransactionStatus;
  paymentId?: string;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export class WalletService {
  /**
   * Получить или создать кошелёк работодателя
   */
  static async getOrCreateWallet(employerId: string): Promise<Wallet> {
    try {
      // Проверяем существование кошелька
      let wallet = await db.oneOrNone<Wallet>(
        'SELECT * FROM company_wallets WHERE employer_id = $1',
        [employerId]
      );

      // Если кошелька нет - создаём
      if (!wallet) {
        wallet = await db.one<Wallet>(
          `INSERT INTO company_wallets (employer_id, balance, currency)
           VALUES ($1, 0, 'RUB')
           RETURNING *`,
          [employerId]
        );
      }

      return wallet;
    } catch (error) {
      console.error('Error in getOrCreateWallet:', error);
      throw new Error('Failed to get or create wallet');
    }
  }

  /**
   * Получить баланс кошелька
   */
  static async getBalance(employerId: string): Promise<number> {
    try {
      const wallet = await this.getOrCreateWallet(employerId);
      return wallet.balance;
    } catch (error) {
      console.error('Error in getBalance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  /**
   * Создать транзакцию
   */
  static async createTransaction(
    params: CreateTransactionParams
  ): Promise<Transaction> {
    try {
      // Получаем кошелёк
      const wallet = await this.getOrCreateWallet(params.userId);

      // Создаём транзакцию
      const transaction = await db.one<Transaction>(
        `INSERT INTO transactions (
          wallet_id, type, amount, currency, status,
          payment_system, card_type, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          wallet.id,
          params.type,
          params.amount,
          'RUB',
          params.status,
          params.paymentSystem || null,
          params.cardType || null,
          params.description || null,
          params.metadata ? JSON.stringify(params.metadata) : null,
        ]
      );

      return transaction;
    } catch (error) {
      console.error('Error in createTransaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  /**
   * Обновить транзакцию
   */
  static async updateTransaction(
    transactionId: string,
    params: UpdateTransactionParams
  ): Promise<Transaction> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (params.status) {
        updates.push(`status = $${paramIndex++}`);
        values.push(params.status);
      }

      if (params.paymentId) {
        updates.push(`payment_id = $${paramIndex++}`);
        values.push(params.paymentId);
      }

      if (params.completedAt) {
        updates.push(`completed_at = $${paramIndex++}`);
        values.push(params.completedAt);
      }

      if (params.metadata) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(params.metadata));
      }

      values.push(transactionId);

      const transaction = await db.one<Transaction>(
        `UPDATE transactions SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      return transaction;
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  /**
   * Завершить транзакцию и обновить баланс
   */
  static async completeTransaction(
    transactionId: string,
    params?: { amount?: number }
  ): Promise<Transaction> {
    try {
      return await db.tx(async (t) => {
        // Получаем транзакцию
        const transaction = await t.one(
          'SELECT * FROM transactions WHERE id = $1',
          [transactionId]
        ) as Transaction;

        if (transaction.status === 'completed') {
          return transaction; // Уже завершена
        }

        const amount = params?.amount || transaction.amount;

        // Обновляем статус транзакции
        const updatedTransaction = await t.one(
          `UPDATE transactions
           SET status = 'completed', completed_at = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING *`,
          [transactionId]
        ) as Transaction;

        // Обновляем баланс кошелька
        if (transaction.type === 'deposit') {
          // Пополнение - увеличиваем баланс
          await t.none(
            `UPDATE company_wallets
             SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [amount, transaction.wallet_id]
          );
        } else if (transaction.type === 'payment' || transaction.type === 'withdrawal') {
          // Списание - уменьшаем баланс
          await t.none(
            `UPDATE company_wallets
             SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [amount, transaction.wallet_id]
          );
        } else if (transaction.type === 'refund') {
          // Возврат - увеличиваем баланс
          await t.none(
            `UPDATE company_wallets
             SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [amount, transaction.wallet_id]
          );
        }

        return updatedTransaction;
      });
    } catch (error) {
      console.error('Error in completeTransaction:', error);
      throw new Error('Failed to complete transaction');
    }
  }

  /**
   * Получить историю транзакций
   */
  static async getTransactions(
    employerId: string,
    options?: { limit?: number; offset?: number; type?: TransactionType }
  ): Promise<Transaction[]> {
    try {
      const wallet = await this.getOrCreateWallet(employerId);

      let query = `
        SELECT t.* FROM transactions t
        WHERE t.wallet_id = $1
      `;

      const params: any[] = [wallet.id];
      let paramIndex = 2;

      if (options?.type) {
        query += ` AND t.type = $${paramIndex++}`;
        params.push(options.type);
      }

      query += ` ORDER BY t.created_at DESC`;

      if (options?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(options.limit);
      }

      if (options?.offset) {
        query += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }

      const transactions = await db.manyOrNone<Transaction>(query, params);

      return transactions || [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  /**
   * Получить транзакцию по ID
   */
  static async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      return await db.oneOrNone<Transaction>(
        'SELECT * FROM transactions WHERE id = $1',
        [transactionId]
      );
    } catch (error) {
      console.error('Error in getTransaction:', error);
      throw new Error('Failed to get transaction');
    }
  }

  /**
   * Списать средства с кошелька
   */
  static async deductFunds(
    employerId: string,
    amount: number,
    description: string
  ): Promise<Transaction> {
    try {
      return await db.tx(async (t) => {
        // Получаем кошелёк
        const wallet = await t.one(
          'SELECT * FROM company_wallets WHERE employer_id = $1 FOR UPDATE',
          [employerId]
        ) as Wallet;

        // Проверяем баланс
        if (wallet.balance < amount) {
          throw new Error('Insufficient funds');
        }

        // Создаём транзакцию списания
        const transaction = await t.one(
          `INSERT INTO transactions (
            wallet_id, type, amount, currency, status, description
          ) VALUES ($1, 'payment', $2, 'RUB', 'completed', $3)
          RETURNING *`,
          [wallet.id, amount, description]
        ) as Transaction;

        // Обновляем баланс
        await t.none(
          `UPDATE company_wallets
           SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [amount, wallet.id]
        );

        return transaction;
      });
    } catch (error) {
      console.error('Error in deductFunds:', error);
      throw error;
    }
  }

  /**
   * Проверить достаточность средств
   */
  static async hasSufficientFunds(employerId: string, amount: number): Promise<boolean> {
    try {
      const balance = await this.getBalance(employerId);
      return balance >= amount;
    } catch (error) {
      console.error('Error in hasSufficientFunds:', error);
      return false;
    }
  }
}
