/**
 * 360° РАБОТА - Tinkoff Acquiring Service
 * Интеграция с эквайрингом Тинькофф
 */
export interface TinkoffInitPaymentParams {
    orderId: string;
    amount: number;
    description: string;
    email: string;
    phone: string;
}
export interface TinkoffPaymentResponse {
    paymentId: string;
    paymentUrl: string;
    status: string;
}
export interface TinkoffPaymentStatus {
    status: string;
    amount: number;
    orderId: string;
}
export declare class TinkoffPaymentService {
    private terminalKey;
    private secretKey;
    private apiUrl;
    private client;
    constructor();
    /**
     * Генерация токена для запроса
     */
    private generateToken;
    /**
     * Инициализация платежа
     */
    initPayment(data: TinkoffInitPaymentParams): Promise<TinkoffPaymentResponse>;
    /**
     * Генерация чека для 54-ФЗ
     */
    private generateReceipt;
    /**
     * Проверка статуса платежа
     */
    checkPaymentStatus(paymentId: string): Promise<TinkoffPaymentStatus>;
    /**
     * Возврат платежа
     */
    refundPayment(paymentId: string, amount: number): Promise<any>;
    /**
     * Валидация webhook токена от Тинькофф
     */
    validateWebhookToken(data: Record<string, any>): boolean;
}
//# sourceMappingURL=TinkoffPaymentService.d.ts.map