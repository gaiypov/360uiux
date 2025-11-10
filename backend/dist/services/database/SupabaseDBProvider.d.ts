/**
 * 360° РАБОТА - Supabase Provider
 * https://supabase.com/
 */
import { Pool, QueryResult } from 'pg';
import { SupabaseClient } from '@supabase/supabase-js';
import { DBProvider } from '../../config/database.config';
import { IDBProvider } from './DatabaseService';
export declare class SupabaseDBProvider implements IDBProvider {
    pool: Pool;
    private supabase;
    constructor();
    query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    one<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T>;
    oneOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T | null>;
    manyOrNone<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<T[]>;
    none(text: string, params?: any[]): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    testConnection(): Promise<boolean>;
    getProvider(): DBProvider;
    /**
     * Получить Supabase client для дополнительных функций
     * (Auth, Realtime, Storage)
     */
    getSupabaseClient(): SupabaseClient;
}
//# sourceMappingURL=SupabaseDBProvider.d.ts.map