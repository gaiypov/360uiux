/**
 * 360° РАБОТА - SMS Service
 * Отправка SMS кодов для верификации
 */

import axios from 'axios';
import { db } from '../config/database';
import { SMSCode } from '../types';

export class SMSService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || '';
    this.apiUrl = process.env.SMS_API_URL || 'https://sms.ru/sms/send';
  }

  /**
   * Генерация 4-значного кода
   */
  private generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Отправка SMS кода
   */
  async sendVerificationCode(phone: string): Promise<{ code: string; expiresAt: Date }> {
    try {
      // Проверяем, не было ли недавно отправлено SMS
      const recentCode = await db.oneOrNone<SMSCode>(
        `SELECT * FROM sms_codes
         WHERE phone = $1
         AND created_at > NOW() - INTERVAL '1 minute'
         ORDER BY created_at DESC
         LIMIT 1`,
        [phone]
      );

      if (recentCode) {
        throw new Error('SMS code already sent. Please wait 1 minute before requesting a new one.');
      }

      // Генерируем код
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

      // Сохраняем в базу
      await db.none(
        `INSERT INTO sms_codes (phone, code, expires_at)
         VALUES ($1, $2, $3)`,
        [phone, code, expiresAt]
      );

      // В development режиме не отправляем реальное SMS
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📱 SMS Code for ${phone}: ${code}\n`);
        return { code, expiresAt };
      }

      // Отправляем SMS через SMS.RU или другой провайдер
      await this.sendSMS(phone, `Ваш код для входа в 360° РАБОТА: ${code}`);

      return { code, expiresAt };
    } catch (error) {
      console.error('Error in sendVerificationCode:', error);
      throw error;
    }
  }

  /**
   * Проверка SMS кода
   */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    try {
      // Получаем последний код для этого телефона
      const smsCode = await db.oneOrNone<SMSCode>(
        `SELECT * FROM sms_codes
         WHERE phone = $1
         AND verified = false
         ORDER BY created_at DESC
         LIMIT 1`,
        [phone]
      );

      if (!smsCode) {
        throw new Error('No verification code found for this phone number');
      }

      // Проверяем срок действия
      if (new Date() > new Date(smsCode.expires_at)) {
        throw new Error('Verification code has expired');
      }

      // Проверяем количество попыток
      if (smsCode.attempts >= 3) {
        throw new Error('Too many attempts. Please request a new code.');
      }

      // Проверяем код
      if (smsCode.code !== code) {
        // Увеличиваем счетчик попыток
        await db.none(
          `UPDATE sms_codes
           SET attempts = attempts + 1
           WHERE id = $1`,
          [smsCode.id]
        );
        throw new Error('Invalid verification code');
      }

      // Помечаем код как использованный
      await db.none(
        `UPDATE sms_codes
         SET verified = true
         WHERE id = $1`,
        [smsCode.id]
      );

      return true;
    } catch (error) {
      console.error('Error in verifyCode:', error);
      throw error;
    }
  }

  /**
   * Отправка SMS через провайдера
   */
  private async sendSMS(phone: string, message: string): Promise<void> {
    try {
      // Пример для SMS.RU
      const response = await axios.get(this.apiUrl, {
        params: {
          api_id: this.apiKey,
          to: phone,
          msg: message,
          json: 1,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`SMS sending failed: ${response.data.status_text}`);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      // В production это должно выбрасывать ошибку
      // В development - просто логируем
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  /**
   * Очистка старых кодов (можно вызывать по крону)
   */
  async cleanupExpiredCodes(): Promise<void> {
    try {
      await db.none(
        `DELETE FROM sms_codes
         WHERE expires_at < NOW() - INTERVAL '1 day'`
      );
    } catch (error) {
      console.error('Error in cleanupExpiredCodes:', error);
    }
  }
}
