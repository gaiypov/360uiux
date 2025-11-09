/**
 * 360° РАБОТА - Local PostgreSQL Provider
 * Локальная БД для разработки
 */

import { Pool, QueryResult } from 'pg';
import { databaseConfig, DBProvider } from '../../config/database.config';
import { IDBProvider } from './DatabaseService';

export class LocalDBProvider implements IDBProvider {
  public pool: Pool;

  constructor() {
    const config = databaseConfig.local;

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('connect', () => {
      console.log('✅ Connected to Local PostgreSQL');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Local PostgreSQL error:', err);
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async one<T = any>(text: string, params?: any[]): Promise<T> {
    const result = await this.pool.query<T>(text, params);
    if (result.rows.length === 0) {
      throw new Error('No data returned from query');
    }
    return result.rows[0];
  }

  async oneOrNone<T = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.pool.query<T>(text, params);
    return result.rows[0] || null;
  }

  async manyOrNone<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query<T>(text, params);
    return result.rows || [];
  }

  async none(text: string, params?: any[]): Promise<void> {
    await this.pool.query(text, params);
  }

  async connect(): Promise<void> {
    await this.pool.connect();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1 as test');
      return result.rows[0].test === 1;
    } catch (error) {
      console.error('❌ Local PostgreSQL connection test failed:', error);
      return false;
    }
  }

  getProvider(): DBProvider {
    return 'local';
  }
}
