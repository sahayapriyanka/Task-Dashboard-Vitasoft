// ============================================================
// config/database.ts - Knex database connection
// ============================================================

import knex, { Knex } from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

/**
 * Singleton Knex instance for database queries.
 * Automatically handles connection pooling.
 */
export const db: Knex = knex(knexConfig);

/**
 * Test database connection on startup
 */
export const testConnection = async (): Promise<void> => {
  try {
    await db.raw('SELECT 1');
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
};
