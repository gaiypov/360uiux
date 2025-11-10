"use strict";
/**
 * 360° РАБОТА - Alfabank Acquiring Service
 * Интеграция с эквайрингом Альфабанка
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlfabankPaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
class AlfabankPaymentService {
    constructor() {
        this.userName = process.env.ALFABANK_USERNAME || '';
        this.password = process.env.ALFABANK_PASSWORD || '';
        this.apiUrl = process.env.ALFABANK_API_URL || 'https://payment.alfabank.ru/payment/rest';
        this.client = axios_1.default.create({
            baseURL: this.apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }
    /**
     * Регистрация заказа
     */
    async registerOrder(data) {
        try {
            const amountInKopecks = Math.round(data.amount * 100);
            const params = new URLSearchParams({
                userName: this.userName,
                password: this.password,
                orderNumber: data.orderNumber,
                amount: amountInKopecks.toString(),
                returnUrl: data.returnUrl,
                description: data.description,
            });
            // Добавляем дополнительные параметры
            if (data.email || data.phone) {
                params.append('jsonParams', JSON.stringify({
                    email: data.email,
                    phone: data.phone,
                }));
            }
            const response = await this.client.post('/register.do', params);
            // Проверяем на ошибки
            if (response.data.errorCode) {
                throw new Error(response.data.errorMessage || `Alfabank error code: ${response.data.errorCode}`);
            }
            return {
                orderId: response.data.orderId,
                formUrl: response.data.formUrl,
            };
        }
        catch (error) {
            console.error('Alfabank registerOrder error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to register Alfabank order');
        }
    }
    /**
     * Проверка статуса заказа (расширенная)
     */
    async getOrderStatus(orderId) {
        try {
            const params = new URLSearchParams({
                userName: this.userName,
                password: this.password,
                orderId: orderId,
            });
            const response = await this.client.post('/getOrderStatusExtended.do', params);
            return {
                orderStatus: response.data.orderStatus,
                amount: response.data.amount / 100, // Конвертируем из копеек
                currency: response.data.currency || 'RUB',
                errorCode: response.data.errorCode,
                errorMessage: response.data.errorMessage,
            };
        }
        catch (error) {
            console.error('Alfabank getOrderStatus error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to get order status');
        }
    }
    /**
     * Возврат средств
     */
    async refund(orderId, amount) {
        try {
            const amountInKopecks = Math.round(amount * 100);
            const params = new URLSearchParams({
                userName: this.userName,
                password: this.password,
                orderId: orderId,
                amount: amountInKopecks.toString(),
            });
            const response = await this.client.post('/refund.do', params);
            if (response.data.errorCode) {
                throw new Error(response.data.errorMessage || `Refund failed with code: ${response.data.errorCode}`);
            }
            return {
                success: true,
                errorCode: response.data.errorCode,
                errorMessage: response.data.errorMessage,
            };
        }
        catch (error) {
            console.error('Alfabank refund error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to refund payment');
        }
    }
    /**
     * Отмена заказа (до оплаты)
     */
    async reverseOrder(orderId) {
        try {
            const params = new URLSearchParams({
                userName: this.userName,
                password: this.password,
                orderId: orderId,
            });
            const response = await this.client.post('/reverse.do', params);
            if (response.data.errorCode) {
                throw new Error(response.data.errorMessage || `Reverse failed with code: ${response.data.errorCode}`);
            }
            return {
                success: true,
                errorCode: response.data.errorCode,
            };
        }
        catch (error) {
            console.error('Alfabank reverseOrder error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to reverse order');
        }
    }
    /**
     * Получение информации о заказе
     */
    async getOrderInfo(orderId) {
        try {
            const params = new URLSearchParams({
                userName: this.userName,
                password: this.password,
                orderId: orderId,
            });
            const response = await this.client.post('/getOrderStatusExtended.do', params);
            return response.data;
        }
        catch (error) {
            console.error('Alfabank getOrderInfo error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to get order info');
        }
    }
    /**
     * 🔴 КРИТИЧНО: Валидация webhook от Alfabank
     * Защита от подделки платежей!
     *
     * Alfabank отправляет checksum в поле 'checksum' для валидации
     * Формат: MD5(orderNumber;status;checksum_secret)
     */
    validateWebhook(webhookData, checksumSecret) {
        try {
            const receivedChecksum = webhookData.checksum;
            if (!receivedChecksum) {
                console.error('❌ Webhook validation failed: No checksum provided');
                return false;
            }
            // Формируем строку для проверки
            // Alfabank использует: orderNumber;status;secret
            const dataToHash = `${webhookData.mdOrder};${webhookData.status};${checksumSecret}`;
            // Вычисляем MD5 hash
            const computedChecksum = crypto
                .createHash('md5')
                .update(dataToHash)
                .digest('hex')
                .toUpperCase();
            const isValid = computedChecksum === receivedChecksum.toUpperCase();
            if (!isValid) {
                console.error('❌ Webhook validation failed: Invalid checksum');
                console.error(`Expected: ${computedChecksum}`);
                console.error(`Received: ${receivedChecksum}`);
            }
            return isValid;
        }
        catch (error) {
            console.error('❌ Webhook validation error:', error);
            return false;
        }
    }
}
exports.AlfabankPaymentService = AlfabankPaymentService;
//# sourceMappingURL=AlfabankPaymentService.js.map