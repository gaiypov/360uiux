/**
 * 360° РАБОТА - Database Configuration
 */

import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise({
  // Initialization options
  error(error, e) {
    if (e.cn) {
      console.error('Database connection error:', error.message || error);
    }
  },
});

// Database connection
const db = pgp({
  connectionString: process.env.DATABASE_URL,
  max: 30, // Max connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
export async function testConnection() {
  try {
    await db.one('SELECT 1 as test');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { db, pgp };
