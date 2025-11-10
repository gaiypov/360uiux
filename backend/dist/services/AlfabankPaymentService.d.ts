/**
 * 360° РАБОТА - Alfabank Acquiring Service
 * Интеграция с эквайрингом Альфабанка
 */
export interface AlfabankRegisterOrderParams {
    orderNumber: string;
    amount: number;
    returnUrl: string;
    description: string;
    email?: string;
    phone?: string;
}
export interface AlfabankRegisterOrderResponse {
    orderId: string;
    formUrl: string;
}
export interface AlfabankOrderStatus {
    orderStatus: number;
    amount: number;
    currency: string;
    errorCode?: number;
    errorMessage?: string;
}
export declare class AlfabankPaymentService {
    private userName;
    private password;
    private apiUrl;
    private client;
    constructor();
    /**
     * Регистрация заказа
     */
    registerOrder(data: AlfabankRegisterOrderParams): Promise<AlfabankRegisterOrderResponse>;
    /**
     * Проверка статуса заказа (расширенная)
     */
    getOrderStatus(orderId: string): Promise<AlfabankOrderStatus>;
    /**
     * Возврат средств
     */
    refund(orderId: string, amount: number): Promise<any>;
    /**
     * Отмена заказа (до оплаты)
     */
    reverseOrder(orderId: string): Promise<any>;
    /**
     * Получение информации о заказе
     */
    getOrderInfo(orderId: string): Promise<any>;
    /**
     * 🔴 КРИТИЧНО: Валидация webhook от Alfabank
     * Защита от подделки платежей!
     *
     * Alfabank отправляет checksum в поле 'checksum' для валидации
     * Формат: MD5(orderNumber;status;checksum_secret)
     */
    validateWebhook(webhookData: any, checksumSecret: string): boolean;
}
//# sourceMappingURL=AlfabankPaymentService.d.ts.map