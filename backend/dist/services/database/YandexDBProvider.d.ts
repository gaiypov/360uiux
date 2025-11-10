/**
 * 360° РАБОТА - Yandex Managed PostgreSQL Provider
 * https://cloud.yandex.ru/services/managed-postgresql
 */
import { Pool, QueryResult } from 'pg';
import { DBProvider } from '../../config/database.config';
import { IDBProvider } from './DatabaseService';
export declare class YandexDBProvider implements IDBProvider {
    pool: Pool;
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
}
//# sourceMappingURL=YandexDBProvider.d.ts.map