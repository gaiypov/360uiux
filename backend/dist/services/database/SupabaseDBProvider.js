"use strict";
/**
 * 360° РАБОТА - Supabase Provider
 * https://supabase.com/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseDBProvider = void 0;
const pg_1 = require("pg");
const supabase_js_1 = require("@supabase/supabase-js");
const database_config_1 = require("../../config/database.config");
class SupabaseDBProvider {
    constructor() {
        const config = database_config_1.databaseConfig.supabase;
        // Supabase client для Auth, Realtime, Storage
        this.supabase = (0, supabase_js_1.createClient)(config.url, config.serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        // PostgreSQL pool для прямых SQL запросов
        // Supabase предоставляет прямое подключение к PostgreSQL
        const dbUrl = new URL(config.url);
        this.pool = new pg_1.Pool({
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
            console.error('❌ Supabase PostgreSQL connection test failed:', error);
            return false;
        }
    }
    getProvider() {
        return 'supabase';
    }
    /**
     * Получить Supabase client для дополнительных функций
     * (Auth, Realtime, Storage)
     */
    getSupabaseClient() {
        return this.supabase;
    }
}
exports.SupabaseDBProvider = SupabaseDBProvider;
//# sourceMappingURL=SupabaseDBProvider.js.map