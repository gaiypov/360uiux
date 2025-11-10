/**
 * 360° РАБОТА - Supabase Provider
 * https://supabase.com/
 */

import { Pool, QueryResult } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { databaseConfig, DBProvider } from '../../config/database.config';
import { IDBProvider } from './DatabaseService';

export class SupabaseDBProvider implements IDBProvider {
  public pool: Pool;
  private supabase: SupabaseClient;

  constructor() {
    const config = databaseConfig.supabase;

    // Supabase client для Auth, Realtime, Storage
    this.supabase = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // PostgreSQL pool для прямых SQL запросов
    // Supabase предоставляет прямое подключение к PostgreSQL
    const dbUrl = new URL(config.url);

    this.pool = new Pool({
      host: `db.${dbUrl.hostname}`,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: config.dbPassword,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('connect', () => {
      console.log('✅ Connected to Supabase PostgreSQL');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Supabase PostgreSQL error:', err);
    });

    console.log('✅ Supabase client initialized');
  }

  async query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async one<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T> {
    const result = await this.pool.query<T>(text, params);
    if (result.rows.length === 0) {
      throw new Error('No data returned from query');
    }
    return result.rows[0];
  }

  async oneOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.pool.query<T>(text, params);
    return result.rows[0] || null;
  }

  async manyOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T[]> {
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
      console.error('❌ Supabase PostgreSQL connection test failed:', error);
      return false;
    }
  }

  getProvider(): DBProvider {
    return 'supabase';
  }

  /**
   * Получить Supabase client для дополнительных функций
   * (Auth, Realtime, Storage)
   */
  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }
}
