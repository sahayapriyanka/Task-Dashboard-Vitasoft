// ============================================================
// migrations/20240101000001_create_users_table.ts
// ============================================================

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('name', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('email');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
