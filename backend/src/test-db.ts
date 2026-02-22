// ============================================================
// test-db.ts - Test database connection
// Run with: npx ts-node src/test-db.ts
// ============================================================

import 'dotenv/config';
import { db, testConnection } from './config/database';

async function main() {
  console.log('Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Database: ${process.env.DB_NAME}\n`);

  try {
    await testConnection();
    console.log('✅ Connection successful!\n');
    
    // Check if tables exist
    const tables = await db.raw('SHOW TABLES');
    console.log('Tables in database:');
    if (tables[0].length === 0) {
      console.log('  (none - run migrations with: npm run migrate)');
    } else {
      tables[0].forEach((row: any) => {
        console.log(`  - ${Object.values(row)[0]}`);
      });
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('  1. Make sure MySQL is running');
    console.error('  2. Check your .env file credentials');
    console.error('  3. Create the database: CREATE DATABASE taskflow_db;');
    process.exit(1);
  }
}

main();
