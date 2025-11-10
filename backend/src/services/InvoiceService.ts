/**
 * 360° РАБОТА - Invoice Service
 * Генерация счетов и PDF
 */

import PDFDocument from 'pdfkit';
import { db } from '../config/database';
import { Invoice, InvoiceItem, InvoiceStatus } from '../types';

export interface GenerateInvoiceParams {
  employerId: string;
  items: InvoiceItem[];
  description?: string;
  dueDate?: Date;
}

export class InvoiceService {
  /**
   * Сгенерировать счёт
   */
  static async generateInvoice(params: GenerateInvoiceParams): Promise<Invoice> {
    try {
      // Рассчитываем суммы
      const amount = params.items.reduce((sum, item) => sum + item.total, 0);
      const vat = amount * 0.2; // НДС 20%
      const totalAmount = amount + vat;

      // Генерируем номер счёта
      const invoiceNumber = await db.one<{ invoice_number: string }>(
        'SELECT generate_invoice_number() as invoice_number'
      );

      // Создаём счёт
      const invoice = await db.one<Invoice>(
        `INSERT INTO invoices (
          invoice_number, employer_id, amount, vat, total_amount,
          currency, status, description, items, issue_date, due_date
        ) VALUES ($1, $2, $3, $4, $5, 'RUB', 'draft', $6, $7, CURRENT_DATE, $8)
        RETURNING *`,
        [
          invoiceNumber.invoice_number,
          params.employerId,
          amount,
          vat,
          totalAmount,
          params.description || null,
          JSON.stringify(params.items),
          params.dueDate || null,
        ]
      );

      return invoice;
    } catch (error) {
      console.error('Error in generateInvoice:', error);
      throw new Error('Failed to generate invoice');
    }
  }

  /**
   * Получить счёт
   */
  static async getInvoice(invoiceId: string, employerId: string): Promise<Invoice> {
    try {
      const invoice = await db.one<Invoice>(
        'SELECT * FROM invoices WHERE id = $1 AND employer_id = $2',
        [invoiceId, employerId]
      );

      return invoice;
    } catch (error) {
      console.error('Error in getInvoice:', error);
      throw new Error('Invoice not found');
    }
  }

  /**
   * Получить список счетов
   */
  static async getInvoices(
    employerId: string,
    options?: { limit?: number; offset?: number; status?: InvoiceStatus }
  ): Promise<Invoice[]> {
    try {
      let query = 'SELECT * FROM invoices WHERE employer_id = $1';
      const params: any[] = [employerId];
      let paramIndex = 2;

      if (options?.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(options.status);
      }

      query += ' ORDER BY created_at DESC';

      if (options?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(options.limit);
      }

      if (options?.offset) {
        query += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }

      const invoices = await db.manyOrNone<Invoice>(query, params);

      return invoices || [];
    } catch (error) {
      console.error('Error in getInvoices:', error);
      throw new Error('Failed to get invoices');
    }
  }

  /**
   * Обновить статус счёта
   */
  static async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus
  ): Promise<Invoice> {
    try {
      const invoice = await db.one<Invoice>(
        `UPDATE invoices
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, invoiceId]
      );

      return invoice;
    } catch (error) {
      console.error('Error in updateInvoiceStatus:', error);
      throw new Error('Failed to update invoice status');
    }
  }

  /**
   * Оплатить счёт из кошелька
   */
  static async payInvoiceFromWallet(
    invoiceId: string,
    employerId: string
  ): Promise<Invoice> {
    try {
      return await db.tx(async (t) => {
        // Получаем счёт
        const invoice = await t.one(
          'SELECT * FROM invoices WHERE id = $1 AND employer_id = $2 FOR UPDATE',
          [invoiceId, employerId]
        ) as Invoice;

        if (invoice.status === 'paid') {
          throw new Error('Invoice already paid');
        }

        // Получаем кошелёк
        const wallet = await t.one(
          'SELECT * FROM company_wallets WHERE employer_id = $1 FOR UPDATE',
          [employerId]
        );

        // Проверяем баланс
        if (wallet.balance < invoice.total_amount) {
          throw new Error('Insufficient funds');
        }

        // Списываем средства
        await t.none(
          `UPDATE company_wallets
           SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
           WHERE employer_id = $2`,
          [invoice.total_amount, employerId]
        );

        // Создаём транзакцию
        await t.none(
          `INSERT INTO transactions (
            wallet_id, type, amount, currency, status, description
          ) VALUES ($1, 'payment', $2, 'RUB', 'completed', $3)`,
          [wallet.id, invoice.total_amount, `Payment for invoice ${invoice.invoice_number}`]
        );

        // Обновляем статус счёта
        const updatedInvoice = await t.one(
          `UPDATE invoices
           SET status = 'paid', paid_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING *`,
          [invoiceId]
        ) as Invoice;

        return updatedInvoice;
      });
    } catch (error) {
      console.error('Error in payInvoiceFromWallet:', error);
      throw error;
    }
  }

  /**
   * Генерация PDF счёта
   */
  static async generatePDF(invoice: Invoice): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Получаем данные работодателя
        const employer = await db.one(
          'SELECT * FROM users WHERE id = $1',
          [invoice.employer_id]
        );

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Заголовок
        doc
          .fontSize(20)
          .text('СЧЁТ НА ОПЛАТУ', { align: 'center' })
          .moveDown();

        doc
          .fontSize(12)
          .text(`Номер: ${invoice.invoice_number}`)
          .text(`Дата: ${new Date(invoice.issue_date).toLocaleDateString('ru-RU')}`)
          .moveDown();

        // Информация о плательщике
        doc
          .fontSize(14)
          .text('Плательщик:', { underline: true })
          .fontSize(11)
          .text(`${employer.company_name}`)
          .text(`ИНН: ${employer.inn}`)
          .text(`Адрес: ${employer.legal_address || 'Не указан'}`)
          .moveDown();

        // Получатель (ваша компания)
        doc
          .fontSize(14)
          .text('Получатель:', { underline: true })
          .fontSize(11)
          .text('ООО "360° РАБОТА"')
          .text('ИНН: 1234567890')
          .text('КПП: 123456789')
          .text('Р/С: 40702810123456789012')
          .text('Банк: ПАО "СБЕРБАНК"')
          .text('БИК: 044525225')
          .text('К/С: 30101810400000000225')
          .moveDown(2);

        // Таблица товаров/услуг
        const tableTop = doc.y;
        const tableHeaders = ['№', 'Наименование', 'Кол-во', 'Цена', 'Сумма'];
        const colWidths = [30, 250, 50, 80, 90];
        let xPos = 50;

        // Заголовки таблицы
        doc.fontSize(10).font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
          xPos += colWidths[i];
        });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Строки таблицы
        doc.font('Helvetica').fontSize(9);
        let yPos = tableTop + 20;
        const items = JSON.parse(invoice.items as any) as InvoiceItem[];

        items.forEach((item, index) => {
          xPos = 50;
          doc.text(String(index + 1), xPos, yPos, { width: colWidths[0] });
          xPos += colWidths[0];
          doc.text(item.name, xPos, yPos, { width: colWidths[1] });
          xPos += colWidths[1];
          doc.text(String(item.quantity), xPos, yPos, { width: colWidths[2] });
          xPos += colWidths[2];
          doc.text(`${item.price.toFixed(2)} ₽`, xPos, yPos, { width: colWidths[3] });
          xPos += colWidths[3];
          doc.text(`${item.total.toFixed(2)} ₽`, xPos, yPos, { width: colWidths[4] });

          yPos += 20;
        });

        doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
        yPos += 10;

        // Итоговые суммы
        doc.fontSize(11);
        const summaryX = 370;

        doc.text('Сумма без НДС:', summaryX, yPos);
        doc.text(`${invoice.amount.toFixed(2)} ₽`, summaryX + 130, yPos, {
          align: 'right',
        });
        yPos += 20;

        doc.text('НДС 20%:', summaryX, yPos);
        doc.text(`${invoice.vat.toFixed(2)} ₽`, summaryX + 130, yPos, {
          align: 'right',
        });
        yPos += 20;

        doc.font('Helvetica-Bold').text('Итого к оплате:', summaryX, yPos);
        doc.text(`${invoice.total_amount.toFixed(2)} ₽`, summaryX + 130, yPos, {
          align: 'right',
        });

        // Подписи
        doc
          .moveDown(3)
          .font('Helvetica')
          .fontSize(10)
          .text('Руководитель: ___________________', 50)
          .moveDown()
          .text('Главный бухгалтер: ___________________', 50);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
