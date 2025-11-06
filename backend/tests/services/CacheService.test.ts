/**
 * CacheService Unit Tests
 * 360° РАБОТА - Backend Testing
 */

import { cacheService, TTL } from '../../src/services/CacheService';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const store = new Map<string, { value: string; expiry: number }>();

    return {
      get: jest.fn(async (key: string) => {
        const item = store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
          store.delete(key);
          return null;
        }
        return item.value;
      }),
      setex: jest.fn(async (key: string, ttl: number, value: string) => {
        store.set(key, { value, expiry: Date.now() + ttl * 1000 });
        return 'OK';
      }),
      del: jest.fn(async (key: string) => {
        store.delete(key);
        return 1;
      }),
      keys: jest.fn(async (pattern: string) => {
        return Array.from(store.keys()).filter((key) =>
          key.startsWith(pattern.replace('*', ''))
        );
      }),
      exists: jest.fn(async (key: string) => {
        return store.has(key) ? 1 : 0;
      }),
      ping: jest.fn(async () => 'PONG'),
      quit: jest.fn(async () => 'OK'),
      flushdb: jest.fn(async () => {
        store.clear();
        return 'OK';
      }),
      dbsize: jest.fn(async () => store.size),
      info: jest.fn(async () => 'used_memory_human:1.5MB'),
      on: jest.fn(),
    };
  });
});

describe('CacheService', () => {
  describe('get and set', () => {
    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = { foo: 'bar', num: 123 };

      await cacheService.set(key, value);
      const result = await cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should respect TTL', async () => {
      const key = 'test:ttl';
      const value = 'test-value';

      await cacheService.set(key, value, 1); // 1 second TTL
      const immediate = await cacheService.get(key);
      expect(immediate).toBe(value);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const expired = await cacheService.get(key);
      expect(expired).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const key = 'test:delete';
      await cacheService.set(key, 'value');

      const exists = await cacheService.exists(key);
      expect(exists).toBe(true);

      await cacheService.del(key);
      const existsAfter = await cacheService.exists(key);
      expect(existsAfter).toBe(false);
    });

    it('should delete multiple keys by pattern', async () => {
      await cacheService.set('user:1', 'data1');
      await cacheService.set('user:2', 'data2');
      await cacheService.set('product:1', 'product1');

      const deleted = await cacheService.delPattern('user:*');
      expect(deleted).toBe(2);

      const user1 = await cacheService.exists('user:1');
      const user2 = await cacheService.exists('user:2');
      const product1 = await cacheService.exists('product:1');

      expect(user1).toBe(false);
      expect(user2).toBe(false);
      expect(product1).toBe(true);
    });
  });

  describe('getOrSet', () => {
    it('should call factory and cache result on cache miss', async () => {
      const key = 'test:getOrSet';
      const factory = jest.fn(async () => ({ data: 'from-factory' }));

      const result = await cacheService.getOrSet(key, factory);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: 'from-factory' });

      // Second call should use cache
      const result2 = await cacheService.getOrSet(key, factory);
      expect(factory).toHaveBeenCalledTimes(1); // Not called again
      expect(result2).toEqual({ data: 'from-factory' });
    });

    it('should return cached value on cache hit', async () => {
      const key = 'test:cached';
      const cachedValue = { data: 'cached' };
      await cacheService.set(key, cachedValue);

      const factory = jest.fn(async () => ({ data: 'from-factory' }));
      const result = await cacheService.getOrSet(key, factory);

      expect(factory).not.toHaveBeenCalled();
      expect(result).toEqual(cachedValue);
    });
  });

  describe('invalidate', () => {
    it('should invalidate all keys for entity', async () => {
      await cacheService.set('vacancy:1:data', 'data1');
      await cacheService.set('vacancy:1:analytics', 'analytics1');
      await cacheService.set('vacancy:2:data', 'data2');

      await cacheService.invalidate('vacancy', '1');

      const vacancy1Data = await cacheService.exists('vacancy:1:data');
      const vacancy1Analytics = await cacheService.exists('vacancy:1:analytics');
      const vacancy2Data = await cacheService.exists('vacancy:2:data');

      expect(vacancy1Data).toBe(false);
      expect(vacancy1Analytics).toBe(false);
      expect(vacancy2Data).toBe(true);
    });

    it('should invalidate all keys for entity type', async () => {
      await cacheService.set('application:1', 'app1');
      await cacheService.set('application:2', 'app2');
      await cacheService.set('user:1', 'user1');

      await cacheService.invalidate('application');

      const app1 = await cacheService.exists('application:1');
      const app2 = await cacheService.exists('application:2');
      const user1 = await cacheService.exists('user:1');

      expect(app1).toBe(false);
      expect(app2).toBe(false);
      expect(user1).toBe(true);
    });
  });

  describe('TTL constants', () => {
    it('should export TTL constants', () => {
      expect(TTL.SHORT).toBe(60);
      expect(TTL.MEDIUM).toBe(300);
      expect(TTL.LONG).toBe(1800);
      expect(TTL.HOUR).toBe(3600);
      expect(TTL.DAY).toBe(86400);
    });
  });

  describe('isEnabled', () => {
    it('should return enabled status', () => {
      const enabled = cacheService.isEnabled();
      expect(typeof enabled).toBe('boolean');
    });
  });

  describe('flush', () => {
    it('should clear all cache', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');

      await cacheService.flush();

      const key1 = await cacheService.exists('key1');
      const key2 = await cacheService.exists('key2');

      expect(key1).toBe(false);
      expect(key2).toBe(false);
    });
  });
});
