// run-migration.ts
// Script to run database migrations

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'psiv_rentals',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigration(migrationFile: string) {
  console.log(`Running migration: ${migrationFile}`);
  console.log('----------------------------------------');

  try {
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(migrationSQL);
    console.log(`Migration ${migrationFile} completed successfully!\n`);
    return true;
  } catch (error: any) {
    console.error(`Migration ${migrationFile} failed:`, error.message);
    return false;
  }
}

async function runAllMigrations() {
  console.log('Starting database migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    await runMigration(file);
  }

  console.log('\nAll migrations completed!');
  await pool.end();
}

// Run specific migration from command line arg or all
const specificMigration = process.argv[2];
if (specificMigration) {
  runMigration(specificMigration).then(() => pool.end());
} else {
  runAllMigrations();
}
