/**
 * 360° РАБОТА - Database Provider Configuration
 * Переключаемые провайдеры: Yandex ⟷ VK Cloud ⟷ Supabase ⟷ Local PostgreSQL
 */

export type DBProvider = 'yandex' | 'vk' | 'supabase' | 'local';

export const databaseConfig = {
  // Выбрать провайдера: 'yandex' | 'vk' | 'supabase' | 'local'
  provider: (process.env.DB_PROVIDER || 'local') as DBProvider,

  // Yandex Managed PostgreSQL
  yandex: {
    host: process.env.YANDEX_PG_HOST || '',
    port: 6432,
    database: process.env.YANDEX_PG_DATABASE || '360_rabota',
    user: process.env.YANDEX_PG_USER || '',
    password: process.env.YANDEX_PG_PASSWORD || '',
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.YANDEX_PG_CA_CERT,
    },
  },

  // VK Cloud PostgreSQL
  vk: {
    host: process.env.VK_PG_HOST || '',
    port: 5432,
    database: process.env.VK_PG_DATABASE || '360_rabota',
    user: process.env.VK_PG_USER || '',
    password: process.env.VK_PG_PASSWORD || '',
    ssl: true,
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    dbPassword: process.env.SUPABASE_DB_PASSWORD || '',
  },

  // Local PostgreSQL
  local: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || '360_rabota',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  },
};

// Валидация конфигурации
export function validateDatabaseConfig(): void {
  const { provider, yandex, vk, supabase, local: _local } = databaseConfig;

  switch (provider) {
    case 'yandex':
      if (!yandex.host || !yandex.user || !yandex.password) {
        throw new Error('Yandex PostgreSQL credentials are required when DB_PROVIDER=yandex');
      }
      break;
    case 'vk':
      if (!vk.host || !vk.user || !vk.password) {
        throw new Error('VK Cloud PostgreSQL credentials are required when DB_PROVIDER=vk');
      }
      break;
    case 'supabase':
      if (!supabase.url || !supabase.serviceRoleKey) {
        throw new Error('Supabase credentials are required when DB_PROVIDER=supabase');
      }
      break;
    case 'local':
      // Local всегда работает с дефолтными значениями
      break;
    default:
      throw new Error(
        `Unknown database provider: ${provider}. Must be 'yandex', 'vk', 'supabase', or 'local'`
      );
  }

  console.log(`🗄️  Database provider configured: ${provider}`);
}
