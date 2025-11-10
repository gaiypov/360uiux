/**
 * 360° РАБОТА - Database Service Abstraction
 * Единый интерфейс для всех БД провайдеров
 */

import { Pool, QueryResult } from 'pg';
import { databaseConfig, validateDatabaseConfig, DBProvider } from '../../config/database.config';
import { YandexDBProvider } from './YandexDBProvider';
import { VKCloudDBProvider } from './VKCloudDBProvider';
import { SupabaseDBProvider } from './SupabaseDBProvider';
import { LocalDBProvider } from './LocalDBProvider';

// Интерфейс провайдера БД
export interface IDBProvider {
  pool: Pool;

  /**
   * Выполнить SQL запрос
   */
  query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>>;

  /**
   * Выполнить один запрос (вернуть одну строку или выбросить ошибку)
   */
  one<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T>;

  /**
   * Выполнить один запрос (вернуть одну строку или null)
   */
  oneOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T | null>;

  /**
   * Выполнить запрос (вернуть массив строк или пустой массив)
   */
  manyOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T[]>;

  /**
   * Выполнить запрос без возврата данных
   */
  none(text: string, params?: any[]): Promise<void>;

  /**
   * Подключиться к БД
   */
  connect(): Promise<void>;

  /**
   * Отключиться от БД
   */
  disconnect(): Promise<void>;

  /**
   * Проверить подключение
   */
  testConnection(): Promise<boolean>;

  /**
   * Получить провайдера
   */
  getProvider(): DBProvider;
}

/**
 * Фабрика БД-провайдеров
 * Singleton pattern
 */
export class DatabaseService implements IDBProvider {
  private provider: IDBProvider;
  private static instance: DatabaseService;

  public get pool(): Pool {
    return this.provider.pool;
  }

  private constructor() {
    // Валидировать конфигурацию
    validateDatabaseConfig();

    // Выбрать провайдера
    const providerType = databaseConfig.provider;

    switch (providerType) {
      case 'yandex':
        this.provider = new YandexDBProvider();
        break;
      case 'vk':
        this.provider = new VKCloudDBProvider();
        break;
      case 'supabase':
        this.provider = new SupabaseDBProvider();
        break;
      case 'local':
        this.provider = new LocalDBProvider();
        break;
      default:
        throw new Error(`Unknown database provider: ${providerType}`);
    }

    console.log(`✅ Database service initialized with provider: ${providerType}`);
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Выполнить SQL запрос
   */
  async query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.provider.query<T>(text, params);
  }

  /**
   * Выполнить один запрос (вернуть одну строку или выбросить ошибку)
   */
  async one<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T> {
    return this.provider.one<T>(text, params);
  }

  /**
   * Выполнить один запрос (вернуть одну строку или null)
   */
  async oneOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T | null> {
    return this.provider.oneOrNone<T>(text, params);
  }

  /**
   * Выполнить запрос (вернуть массив строк или пустой массив)
   */
  async manyOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T[]> {
    return this.provider.manyOrNone<T>(text, params);
  }

  /**
   * Выполнить запрос без возврата данных
   */
  async none(text: string, params?: any[]): Promise<void> {
    return this.provider.none(text, params);
  }

  /**
   * Подключиться к БД
   */
  async connect(): Promise<void> {
    return this.provider.connect();
  }

  /**
   * Отключиться от БД
   */
  async disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  /**
   * Проверить подключение
   */
  async testConnection(): Promise<boolean> {
    return this.provider.testConnection();
  }

  /**
   * Получить тип провайдера
   */
  getProvider(): DBProvider {
    return this.provider.getProvider();
  }

  /**
   * Транзакция
   */
  async transaction<T>(callback: (client: Pool) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client as any);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Алиас для транзакции (совместимость с pg-promise)
   */
  async tx<T>(callback: (t: any) => Promise<T>): Promise<T> {
    return this.transaction(async (client) => {
      // Создаём pg-promise-подобный интерфейс
      const t = {
        one: async <R extends Record<string, any> = any>(text: string, params?: any[]): Promise<R> => {
          const result = await client.query<R>(text, params);
          if (result.rows.length === 0) {
            throw new Error('No rows returned');
          }
          return result.rows[0];
        },
        oneOrNone: async <R extends Record<string, any> = any>(text: string, params?: any[]): Promise<R | null> => {
          const result = await client.query<R>(text, params);
          return result.rows.length > 0 ? result.rows[0] : null;
        },
        manyOrNone: async <R extends Record<string, any> = any>(text: string, params?: any[]): Promise<R[]> => {
          const result = await client.query<R>(text, params);
          return result.rows;
        },
        none: async (text: string, params?: any[]): Promise<void> => {
          await client.query(text, params);
        },
        query: async <R extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<R>> => {
          return client.query<R>(text, params);
        },
      };
      return callback(t);
    });
  }
}

// Экспорт singleton instance
export const db = DatabaseService.getInstance();

// Алиасы для удобства (как в pg-promise)
export const one = db.one.bind(db);
export const oneOrNone = db.oneOrNone.bind(db);
export const manyOrNone = db.manyOrNone.bind(db);
export const none = db.none.bind(db);
export const query = db.query.bind(db);
