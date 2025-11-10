"use strict";
/**
 * 360° РАБОТА - Tinkoff Acquiring Service
 * Интеграция с эквайрингом Тинькофф
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TinkoffPaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class TinkoffPaymentService {
    constructor() {
        this.terminalKey = process.env.TINKOFF_TERMINAL_KEY || '';
        this.secretKey = process.env.TINKOFF_SECRET_KEY || '';
        this.apiUrl = process.env.TINKOFF_API_URL || 'https://securepay.tinkoff.ru/v2';
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Генерация токена для запроса
     */
    generateToken(params) {
        // Удаляем Token из параметров
        const { Token, ...paramsWithoutToken } = params;
        // Сортируем ключи
        const sortedKeys = Object.keys(paramsWithoutToken).sort();
        // Создаем массив значений
        const values = sortedKeys.map(key => {
            const value = paramsWithoutToken[key];
            // Если значение - объект, конвертируем в JSON
            return typeof value === 'object' ? JSON.stringify(value) : value;
        });
        // Добавляем секретный ключ в конец
        values.push(this.secretKey);
        // Соединяем и хешируем
        const tokenString = values.join('');
        return crypto_1.default.createHash('sha256').update(tokenString).digest('hex');
    }
    /**
     * Инициализация платежа
     */
    async initPayment(data) {
        try {
            const amountInKopecks = Math.round(data.amount * 100);
            const params = {
                TerminalKey: this.terminalKey,
                Amount: amountInKopecks,
                OrderId: data.orderId,
                Description: data.description,
                DATA: {
                    Email: data.email,
                    Phone: data.phone,
                },
                Receipt: this.generateReceipt({
                    email: data.email,
                    phone: data.phone,
                    amount: data.amount,
                    description: data.description,
                }),
            };
            // Генерируем токен
            params.Token = this.generateToken(params);
            const response = await this.client.post('/Init', params);
            if (!response.data.Success) {
                throw new Error(response.data.Message || 'Tinkoff payment initialization failed');
            }
            return {
                paymentId: response.data.PaymentId,
                paymentUrl: response.data.PaymentURL,
                status: response.data.Status,
            };
        }
        catch (error) {
            console.error('Tinkoff initPayment error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to initialize Tinkoff payment');
        }
    }
    /**
     * Генерация чека для 54-ФЗ
     */
    generateReceipt(data) {
        const amountInKopecks = Math.round(data.amount * 100);
        return {
            Email: data.email,
            Phone: data.phone,
            Taxation: 'usn_income', // УСН доходы
            Items: [
                {
                    Name: data.description,
                    Price: amountInKopecks,
                    Quantity: 1.0,
                    Amount: amountInKopecks,
                    Tax: 'none', // Без НДС
                    PaymentMethod: 'full_prepayment',
                    PaymentObject: 'service',
                },
            ],
        };
    }
    /**
     * Проверка статуса платежа
     */
    async checkPaymentStatus(paymentId) {
        try {
            const params = {
                TerminalKey: this.terminalKey,
                PaymentId: paymentId,
            };
            params.Token = this.generateToken(params);
            const response = await this.client.post('/GetState', params);
            if (!response.data.Success) {
                throw new Error(response.data.Message || 'Failed to get payment status');
            }
            return {
                status: response.data.Status, // NEW, CONFIRMED, REJECTED, etc.
                amount: response.data.Amount / 100, // Конвертируем из копеек
                orderId: response.data.OrderId,
            };
        }
        catch (error) {
            console.error('Tinkoff checkPaymentStatus error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to check payment status');
        }
    }
    /**
     * Возврат платежа
     */
    async refundPayment(paymentId, amount) {
        try {
            const amountInKopecks = Math.round(amount * 100);
            const params = {
                TerminalKey: this.terminalKey,
                PaymentId: paymentId,
                Amount: amountInKopecks,
            };
            params.Token = this.generateToken(params);
            const response = await this.client.post('/Cancel', params);
            if (!response.data.Success) {
                throw new Error(response.data.Message || 'Failed to refund payment');
            }
            return {
                status: response.data.Status,
                originalAmount: response.data.OriginalAmount / 100,
                newAmount: response.data.NewAmount / 100,
            };
        }
        catch (error) {
            console.error('Tinkoff refundPayment error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to refund payment');
        }
    }
    /**
     * Валидация webhook токена от Тинькофф
     */
    validateWebhookToken(data) {
        try {
            const receivedToken = data.Token;
            const calculatedToken = this.generateToken(data);
            return receivedToken === calculatedToken;
        }
        catch (error) {
            console.error('Tinkoff validateWebhookToken error:', error);
            return false;
        }
    }
}
exports.TinkoffPaymentService = TinkoffPaymentService;
//# sourceMappingURL=TinkoffPaymentService.js.map