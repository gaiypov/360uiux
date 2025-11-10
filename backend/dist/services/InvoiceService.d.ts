/**
 * 360° РАБОТА - Invoice Service
 * Генерация счетов и PDF
 */
import { Invoice, InvoiceItem, InvoiceStatus } from '../types';
export interface GenerateInvoiceParams {
    employerId: string;
    items: InvoiceItem[];
    description?: string;
    dueDate?: Date;
}
export declare class InvoiceService {
    /**
     * Сгенерировать счёт
     */
    static generateInvoice(params: GenerateInvoiceParams): Promise<Invoice>;
    /**
     * Получить счёт
     */
    static getInvoice(invoiceId: string, employerId: string): Promise<Invoice>;
    /**
     * Получить список счетов
     */
    static getInvoices(employerId: string, options?: {
        limit?: number;
        offset?: number;
        status?: InvoiceStatus;
    }): Promise<Invoice[]>;
    /**
     * Обновить статус счёта
     */
    static updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice>;
    /**
     * Оплатить счёт из кошелька
     */
    static payInvoiceFromWallet(invoiceId: string, employerId: string): Promise<Invoice>;
    /**
     * Генерация PDF счёта
     */
    static generatePDF(invoice: Invoice): Promise<Buffer>;
}
//# sourceMappingURL=InvoiceService.d.ts.map