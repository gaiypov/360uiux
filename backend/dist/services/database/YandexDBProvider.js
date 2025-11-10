"use strict";
/**
 * 360° РАБОТА - Yandex Managed PostgreSQL Provider
 * https://cloud.yandex.ru/services/managed-postgresql
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.YandexDBProvider = void 0;
const pg_1 = require("pg");
const database_config_1 = require("../../config/database.config");
class YandexDBProvider {
    constructor() {
        const config = database_config_1.databaseConfig.yandex;
        this.pool = new pg_1.Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            ssl: config.ssl,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        this.pool.on('connect', () => {
            console.log('✅ Connected to Yandex Managed PostgreSQL');
        });
        this.pool.on('error', (err) => {
            console.error('❌ Yandex PostgreSQL error:', err);
        });
    }
    async query(text, params) {
        return this.pool.query(text, params);
    }
    async one(text, params) {
        const result = await this.pool.query(text, params);
        if (result.rows.length === 0) {
            throw new Error('No data returned from query');
        }
        return result.rows[0];
    }
    async oneOrNone(text, params) {
        const result = await this.pool.query(text, params);
        return result.rows[0] || null;
    }
    async manyOrNone(text, params) {
        const result = await this.pool.query(text, params);
        return result.rows || [];
    }
    async none(text, params) {
        await this.pool.query(text, params);
    }
    async connect() {
        await this.pool.connect();
    }
    async disconnect() {
        await this.pool.end();
    }
    async testConnection() {
        try {
            const result = await this.pool.query('SELECT 1 as test');
            return result.rows[0].test === 1;
        }
        catch (error) {
            console.error('❌ Yandex PostgreSQL connection test failed:', error);
            return false;
        }
    }
    getProvider() {
        return 'yandex';
    }
}
exports.YandexDBProvider = YandexDBProvider;
//# sourceMappingURL=YandexDBProvider.js.map