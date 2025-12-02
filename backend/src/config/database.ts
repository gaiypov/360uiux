/**
 * Rework - Database Configuration
 * ПЕРЕКЛЮЧАЕМЫЕ ПРОВАЙДЕРЫ через DatabaseService
 */

import dotenv from 'dotenv';
import { db, DatabaseService } from '../services/database/DatabaseService';

dotenv.config();

// Test connection
export async function testConnection() {
  try {
    const dbService = DatabaseService.getInstance();
    const isConnected = await dbService.testConnection();

    if (isConnected) {
      console.log(`✅ Database connected successfully (${dbService.getProvider()})`);
      return true;
    }

    console.error('❌ Database connection failed');
    return false;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Экспортируем singleton instance
export { db };

// Экспорт pool для health checks
export const pool = db.pool;

// Обратная совместимость со старым кодом
export default db;
