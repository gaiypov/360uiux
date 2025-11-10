/**
 * 360° РАБОТА - SMS Service
 * Отправка SMS кодов для верификации
 */
export declare class SMSService {
    private apiKey;
    private apiUrl;
    constructor();
    /**
     * Генерация 4-значного кода
     */
    private generateCode;
    /**
     * Отправка SMS кода
     */
    sendVerificationCode(phone: string): Promise<{
        code: string;
        expiresAt: Date;
    }>;
    /**
     * Проверка SMS кода
     */
    verifyCode(phone: string, code: string): Promise<boolean>;
    /**
     * Отправка SMS через провайдера
     */
    private sendSMS;
    /**
     * Очистка старых кодов (можно вызывать по крону)
     */
    cleanupExpiredCodes(): Promise<void>;
}
//# sourceMappingURL=SMSService.d.ts.map