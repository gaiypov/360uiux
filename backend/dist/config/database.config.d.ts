/**
 * 360° РАБОТА - Database Provider Configuration
 * Переключаемые провайдеры: Yandex ⟷ VK Cloud ⟷ Supabase ⟷ Local PostgreSQL
 */
export type DBProvider = 'yandex' | 'vk' | 'supabase' | 'local';
export declare const databaseConfig: {
    provider: DBProvider;
    yandex: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        ssl: {
            rejectUnauthorized: boolean;
            ca: string | undefined;
        };
    };
    vk: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        ssl: boolean;
    };
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
        dbPassword: string;
    };
    local: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
};
export declare function validateDatabaseConfig(): void;
//# sourceMappingURL=database.config.d.ts.map