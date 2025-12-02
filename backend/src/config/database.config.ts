/**
 * Rework - Database Provider Configuration
 * Переключаемые провайдеры: Yandex ⟷ VK Cloud ⟷ Supabase ⟷ Local PostgreSQL
 */

import fs from 'fs';
import path from 'path';

export type DBProvider = 'yandex' | 'vk' | 'supabase' | 'local';

// Парсинг DATABASE_URL
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6432,
      database: parsed.pathname.slice(1),
      user: parsed.username,
      password: decodeURIComponent(parsed.password),
    };
  } catch {
    return null;
  }
}

// Загрузить CA сертификат Yandex Cloud
function loadYandexCACert(): string | undefined {
  const certPaths = [
    '/app/certs/root.crt',
    '/etc/ssl/certs/yandex-cloud-ca.pem',
    path.join(__dirname, '../../certs/root.crt'),
  ];

  for (const certPath of certPaths) {
    try {
      if (fs.existsSync(certPath)) {
        return fs.readFileSync(certPath, 'utf-8');
      }
    } catch {
      continue;
    }
  }

  return process.env.YANDEX_PG_CA_CERT;
}

const dbUrlParsed = parseDatabaseUrl(process.env.DATABASE_URL || '');

export const databaseConfig = {
  provider: (process.env.DB_PROVIDER || 'local') as DBProvider,

  // Yandex Managed PostgreSQL
  yandex: {
    host: process.env.YANDEX_PG_HOST || dbUrlParsed?.host || '',
    port: parseInt(process.env.YANDEX_PG_PORT || '') || dbUrlParsed?.port || 6432,
    database: process.env.YANDEX_PG_DATABASE || dbUrlParsed?.database || 'rework',
    user: process.env.YANDEX_PG_USER || dbUrlParsed?.user || '',
    password: process.env.YANDEX_PG_PASSWORD || dbUrlParsed?.password || '',
    ssl: {
      rejectUnauthorized: false,
      ca: loadYandexCACert(),
    },
  },

  // VK Cloud PostgreSQL
  vk: {
    host: process.env.VK_PG_HOST || '',
    port: 5432,
    database: process.env.VK_PG_DATABASE || 'rework',
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
    database: process.env.PG_DATABASE || 'rework',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  },
};

// Валидация конфигурации
export function validateDatabaseConfig(): void {
  const { provider, yandex, vk, supabase } = databaseConfig;

  switch (provider) {
    case 'yandex':
      if (!yandex.host || !yandex.user || !yandex.password) {
        console.error('Yandex config:', { host: yandex.host, user: yandex.user, hasPassword: !!yandex.password });
        console.error('DATABASE_URL parsed:', dbUrlParsed);
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
      break;
    default:
      throw new Error(`Unknown database provider: ${provider}`);
  }

  console.log(`🗄️  Database provider configured: ${provider}`);
}
