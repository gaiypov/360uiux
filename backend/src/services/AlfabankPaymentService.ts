/**
 * 360° РАБОТА - Alfabank Acquiring Service
 * Интеграция с эквайрингом Альфабанка
 */

import axios, { AxiosInstance } from 'axios';

export interface AlfabankRegisterOrderParams {
  orderNumber: string;
  amount: number; // В рублях
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
  orderStatus: number; // 0=зарегистрирован, 1=оплачен, 2=отменен
  amount: number;
  currency: string;
  errorCode?: number;
  errorMessage?: string;
}

export class AlfabankPaymentService {
  private userName: string;
  private password: string;
  private apiUrl: string;
  private client: AxiosInstance;

  constructor() {
    this.userName = process.env.ALFABANK_USERNAME || '';
    this.password = process.env.ALFABANK_PASSWORD || '';
    this.apiUrl = process.env.ALFABANK_API_URL || 'https://payment.alfabank.ru/payment/rest';

    this.client = axios.create({
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
  async registerOrder(
    data: AlfabankRegisterOrderParams
  ): Promise<AlfabankRegisterOrderResponse> {
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
        params.append(
          'jsonParams',
          JSON.stringify({
            email: data.email,
            phone: data.phone,
          })
        );
      }

      const response = await this.client.post('/register.do', params);

      // Проверяем на ошибки
      if (response.data.errorCode) {
        throw new Error(
          response.data.errorMessage || `Alfabank error code: ${response.data.errorCode}`
        );
      }

      return {
        orderId: response.data.orderId,
        formUrl: response.data.formUrl,
      };
    } catch (error) {
      console.error('Alfabank registerOrder error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to register Alfabank order'
      );
    }
  }

  /**
   * Проверка статуса заказа (расширенная)
   */
  async getOrderStatus(orderId: string): Promise<AlfabankOrderStatus> {
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
    } catch (error) {
      console.error('Alfabank getOrderStatus error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get order status'
      );
    }
  }

  /**
   * Возврат средств
   */
  async refund(orderId: string, amount: number): Promise<any> {
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
        throw new Error(
          response.data.errorMessage || `Refund failed with code: ${response.data.errorCode}`
        );
      }

      return {
        success: true,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
      };
    } catch (error) {
      console.error('Alfabank refund error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to refund payment');
    }
  }

  /**
   * Отмена заказа (до оплаты)
   */
  async reverseOrder(orderId: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        userName: this.userName,
        password: this.password,
        orderId: orderId,
      });

      const response = await this.client.post('/reverse.do', params);

      if (response.data.errorCode) {
        throw new Error(
          response.data.errorMessage || `Reverse failed with code: ${response.data.errorCode}`
        );
      }

      return {
        success: true,
        errorCode: response.data.errorCode,
      };
    } catch (error) {
      console.error('Alfabank reverseOrder error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to reverse order');
    }
  }

  /**
   * Получение информации о заказе
   */
  async getOrderInfo(orderId: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        userName: this.userName,
        password: this.password,
        orderId: orderId,
      });

      const response = await this.client.post('/getOrderStatusExtended.do', params);

      return response.data;
    } catch (error) {
      console.error('Alfabank getOrderInfo error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get order info'
      );
    }
  }
}
