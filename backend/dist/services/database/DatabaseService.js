"use strict";
/**
 * 360° РАБОТА - Database Service Abstraction
 * Единый интерфейс для всех БД провайдеров
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.none = exports.manyOrNone = exports.oneOrNone = exports.one = exports.db = exports.DatabaseService = void 0;
const database_config_1 = require("../../config/database.config");
const YandexDBProvider_1 = require("./YandexDBProvider");
const VKCloudDBProvider_1 = require("./VKCloudDBProvider");
const SupabaseDBProvider_1 = require("./SupabaseDBProvider");
const LocalDBProvider_1 = require("./LocalDBProvider");
/**
 * Фабрика БД-провайдеров
 * Singleton pattern
 */
class DatabaseService {
    get pool() {
        return this.provider.pool;
    }
    constructor() {
        // Валидировать конфигурацию
        (0, database_config_1.validateDatabaseConfig)();
        // Выбрать провайдера
        const providerType = database_config_1.databaseConfig.provider;
        switch (providerType) {
            case 'yandex':
                this.provider = new YandexDBProvider_1.YandexDBProvider();
                break;
            case 'vk':
                this.provider = new VKCloudDBProvider_1.VKCloudDBProvider();
                break;
            case 'supabase':
                this.provider = new SupabaseDBProvider_1.SupabaseDBProvider();
                break;
            case 'local':
                this.provider = new LocalDBProvider_1.LocalDBProvider();
                break;
            default:
                throw new Error(`Unknown database provider: ${providerType}`);
        }
        console.log(`✅ Database service initialized with provider: ${providerType}`);
    }
    /**
     * Singleton pattern
     */
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    /**
     * Выполнить SQL запрос
     */
    async query(text, params) {
        return this.provider.query(text, params);
    }
    /**
     * Выполнить один запрос (вернуть одну строку или выбросить ошибку)
     */
    async one(text, params) {
        return this.provider.one(text, params);
    }
    /**
     * Выполнить один запрос (вернуть одну строку или null)
     */
    async oneOrNone(text, params) {
        return this.provider.oneOrNone(text, params);
    }
    /**
     * Выполнить запрос (вернуть массив строк или пустой массив)
     */
    async manyOrNone(text, params) {
        return this.provider.manyOrNone(text, params);
    }
    /**
     * Выполнить запрос без возврата данных
     */
    async none(text, params) {
        return this.provider.none(text, params);
    }
    /**
     * Подключиться к БД
     */
    async connect() {
        return this.provider.connect();
    }
    /**
     * Отключиться от БД
     */
    async disconnect() {
        return this.provider.disconnect();
    }
    /**
     * Проверить подключение
     */
    async testConnection() {
        return this.provider.testConnection();
    }
    /**
     * Получить тип провайдера
     */
    getProvider() {
        return this.provider.getProvider();
    }
    /**
     * Транзакция
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Алиас для транзакции (совместимость с pg-promise)
     */
    async tx(callback) {
        return this.transaction(async (client) => {
            // Создаём pg-promise-подобный интерфейс
            const t = {
                one: async (text, params) => {
                    const result = await client.query(text, params);
                    if (result.rows.length === 0) {
                        throw new Error('No rows returned');
                    }
                    return result.rows[0];
                },
                oneOrNone: async (text, params) => {
                    const result = await client.query(text, params);
                    return result.rows.length > 0 ? result.rows[0] : null;
                },
                manyOrNone: async (text, params) => {
                    const result = await client.query(text, params);
                    return result.rows;
                },
                none: async (text, params) => {
                    await client.query(text, params);
                },
                query: async (text, params) => {
                    return client.query(text, params);
                },
            };
            return callback(t);
        });
    }
}
exports.DatabaseService = DatabaseService;
// Экспорт singleton instance
exports.db = DatabaseService.getInstance();
// Алиасы для удобства (как в pg-promise)
exports.one = exports.db.one.bind(exports.db);
exports.oneOrNone = exports.db.oneOrNone.bind(exports.db);
exports.manyOrNone = exports.db.manyOrNone.bind(exports.db);
exports.none = exports.db.none.bind(exports.db);
exports.query = exports.db.query.bind(exports.db);
//# sourceMappingURL=DatabaseService.js.map