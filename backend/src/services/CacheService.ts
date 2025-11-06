/**
 * 360° РАБОТА - Cache Service
 *
 * Сервис для кеширования часто запрашиваемых данных
 * Architecture v3: Redis caching для оптимизации производительности
 */

import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// TTL константы (в секундах)
const TTL = {
  SHORT: 60, // 1 минута
  MEDIUM: 300, // 5 минут
  LONG: 1800, // 30 минут
  HOUR: 3600, // 1 час
  DAY: 86400, // 24 часа
};

class CacheService {
  private client: Redis | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Инициализировать Redis клиент
   */
  private async initialize() {
    try {
      this.client = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.enabled = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis error:', error.message);
        this.enabled = false;
      });

      this.client.on('close', () => {
        console.warn('⚠️  Redis connection closed');
        this.enabled = false;
      });

      // Проверка подключения
      await this.client.ping();
    } catch (error: any) {
      console.warn('⚠️  Redis not available, caching disabled:', error.message);
      this.enabled = false;
      this.client = null;
    }
  }

  /**
   * Получить значение из кеша
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error: any) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Установить значение в кеш
   */
  async set(key: string, value: any, ttl: number = TTL.MEDIUM): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      return true;
    } catch (error: any) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  /**
   * Удалить значение из кеша
   */
  async del(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      console.error('Cache del error:', error.message);
      return false;
    }
  }

  /**
   * Удалить все ключи по паттерну
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.enabled || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(...keys);
      return keys.length;
    } catch (error: any) {
      console.error('Cache delPattern error:', error.message);
      return 0;
    }
  }

  /**
   * Проверить существование ключа
   */
  async exists(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  }

  /**
   * Получить или установить значение (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = TTL.MEDIUM
  ): Promise<T> {
    // Попытаться получить из кеша
    const cached = await this.get<T>(key);
    if (cached !== null) {
      console.log(`✅ Cache hit: ${key}`);
      return cached;
    }

    console.log(`❌ Cache miss: ${key}`);

    // Получить свежие данные
    const fresh = await factory();

    // Сохранить в кеш (асинхронно)
    this.set(key, fresh, ttl).catch((error) => {
      console.error('Failed to cache data:', error);
    });

    return fresh;
  }

  /**
   * Инвалидировать кеш для сущности
   */
  async invalidate(entity: string, id?: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      if (id) {
        // Инвалидировать конкретную сущность
        await this.delPattern(`${entity}:${id}:*`);
        console.log(`♻️  Invalidated cache for ${entity}:${id}`);
      } else {
        // Инвалидировать все сущности типа
        await this.delPattern(`${entity}:*`);
        console.log(`♻️  Invalidated cache for all ${entity}`);
      }
    } catch (error: any) {
      console.error('Cache invalidate error:', error.message);
    }
  }

  /**
   * Получить статистику кеша
   */
  async getStats() {
    if (!this.enabled || !this.client) {
      return {
        enabled: false,
        keys: 0,
        memory: '0B',
      };
    }

    try {
      const info = await this.client.info('stats');
      const dbsize = await this.client.dbsize();
      const memory = await this.client.info('memory');

      // Парсинг информации
      const usedMemory = memory.match(/used_memory_human:(.+)/)?.[1]?.trim() || '0B';

      return {
        enabled: true,
        keys: dbsize,
        memory: usedMemory,
      };
    } catch (error: any) {
      console.error('Cache stats error:', error.message);
      return {
        enabled: false,
        keys: 0,
        memory: '0B',
      };
    }
  }

  /**
   * Очистить весь кеш
   */
  async flush(): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      await this.client.flushdb();
      console.log('♻️  Cache flushed');
      return true;
    } catch (error: any) {
      console.error('Cache flush error:', error.message);
      return false;
    }
  }

  /**
   * Проверить доступность кеша
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Закрыть соединение
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.enabled = false;
      console.log('Redis connection closed');
    }
  }
}

// Singleton экспорт
export const cacheService = new CacheService();

// Экспорт TTL констант
export { TTL };
