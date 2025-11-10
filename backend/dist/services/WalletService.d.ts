/**
 * 360° РАБОТА - Wallet Service
 * Управление кошельком и транзакциями
 */
import { Wallet, Transaction, TransactionType, TransactionStatus, PaymentSystem, CardType } from '../types';
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
export declare class WalletService {
    /**
     * Получить или создать кошелёк работодателя
     */
    static getOrCreateWallet(employerId: string): Promise<Wallet>;
    /**
     * Получить баланс кошелька
     */
    static getBalance(employerId: string): Promise<number>;
    /**
     * Создать транзакцию
     */
    static createTransaction(params: CreateTransactionParams): Promise<Transaction>;
    /**
     * Обновить транзакцию
     */
    static updateTransaction(transactionId: string, params: UpdateTransactionParams): Promise<Transaction>;
    /**
     * Завершить транзакцию и обновить баланс
     */
    static completeTransaction(transactionId: string, params?: {
        amount?: number;
    }): Promise<Transaction>;
    /**
     * Получить историю транзакций
     */
    static getTransactions(employerId: string, options?: {
        limit?: number;
        offset?: number;
        type?: TransactionType;
    }): Promise<Transaction[]>;
    /**
     * Получить транзакцию по ID
     */
    static getTransaction(transactionId: string): Promise<Transaction | null>;
    /**
     * Списать средства с кошелька
     */
    static deductFunds(employerId: string, amount: number, description: string): Promise<Transaction>;
    /**
     * Проверить достаточность средств
     */
    static hasSufficientFunds(employerId: string, amount: number): Promise<boolean>;
}
//# sourceMappingURL=WalletService.d.ts.map