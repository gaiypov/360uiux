/**
 * 360° РАБОТА - Database Service Abstraction
 * Единый интерфейс для всех БД провайдеров
 */
import { Pool, QueryResult } from 'pg';
import { DBProvider } from '../../config/database.config';
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
export declare class DatabaseService implements IDBProvider {
    private provider;
    private static instance;
    get pool(): Pool;
    private constructor();
    /**
     * Singleton pattern
     */
    static getInstance(): DatabaseService;
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
     * Получить тип провайдера
     */
    getProvider(): DBProvider;
    /**
     * Транзакция
     */
    transaction<T>(callback: (client: Pool) => Promise<T>): Promise<T>;
    /**
     * Алиас для транзакции (совместимость с pg-promise)
     */
    tx<T>(callback: (t: any) => Promise<T>): Promise<T>;
}
export declare const db: DatabaseService;
export declare const one: <T extends Record<string, any> = any>(text: string, params?: any[]) => Promise<T>;
export declare const oneOrNone: <T extends Record<string, any> = any>(text: string, params?: any[]) => Promise<T | null>;
export declare const manyOrNone: <T extends Record<string, any> = any>(text: string, params?: any[]) => Promise<T[]>;
export declare const none: (text: string, params?: any[]) => Promise<void>;
export declare const query: <T extends Record<string, any> = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
//# sourceMappingURL=DatabaseService.d.ts.map