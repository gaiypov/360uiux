/**
 * Database Connection Utility
 * Shared connection pool for PostgreSQL database
 */

import { Pool, QueryResult, PoolClient, QueryResultRow } from 'pg';

// Database configuration
const dbConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || '360_rabota',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool: Pool | null = null;

/**
 * Get database pool instance (singleton pattern)
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);

    pool.on('connect', () => {
      console.log('✅ Admin Dashboard connected to PostgreSQL');
    });

    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err);
    });
  }

  return pool;
}

/**
 * Execute a query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

/**
 * Execute a query and return one row
 * Throws error if no rows returned
 */
export async function one<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T> {
  const result = await query<T>(text, params);
  if (result.rows.length === 0) {
    throw new Error('No data returned from query');
  }
  return result.rows[0];
}

/**
 * Execute a query and return one row or null
 */
export async function oneOrNone<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function many<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Execute a query that doesn't return data
 */
export async function none(text: string, params?: any[]): Promise<void> {
  await query(text, params);
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as test');
    return result.rows[0].test === 1;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

/**
 * Close all database connections
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database pool closed');
  }
}

// Export for convenience
export const db = {
  query,
  one,
  oneOrNone,
  many,
  none,
  getClient,
  transaction,
  testConnection,
  closePool,
};
