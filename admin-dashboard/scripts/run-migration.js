#!/usr/bin/env node

/**
 * Migration Runner for 360° РАБОТА Admin Dashboard
 *
 * Usage:
 *   node scripts/run-migration.js <migration-number>
 *   Example: node scripts/run-migration.js 003
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const migrationNumber = process.argv[2];

if (!migrationNumber) {
  console.error('❌ Error: Migration number required');
  console.log('Usage: node scripts/run-migration.js <migration-number>');
  console.log('Example: node scripts/run-migration.js 003');
  process.exit(1);
}

// Database connection configuration
const config = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || '360_rabota',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
};

async function runMigration() {
  const client = new Client(config);

  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);

    await client.connect();
    console.log('✅ Connected to database\n');

    // Find migration file
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir);
    const migrationFile = files.find(f => f.startsWith(migrationNumber));

    if (!migrationFile) {
      console.error(`❌ Error: Migration file ${migrationNumber}*.sql not found`);
      console.log('Available migrations:');
      files.forEach(f => console.log(`   - ${f}`));
      process.exit(1);
    }

    const migrationPath = path.join(migrationsDir, migrationFile);
    console.log(`📄 Reading migration: ${migrationFile}`);

    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Executing migration...\n');
    console.log('─'.repeat(60));

    await client.query(sql);

    console.log('─'.repeat(60));
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();
