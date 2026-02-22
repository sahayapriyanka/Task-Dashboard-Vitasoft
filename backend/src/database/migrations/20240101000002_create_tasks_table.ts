// ============================================================
// migrations/20240101000002_create_tasks_table.ts
// ============================================================

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.enum('status', ['todo', 'in-progress', 'done']).notNullable().defaultTo('todo');
    table.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');
    table.date('due_date').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('user_id');
    table.index('status');
    table.index('priority');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('tasks');
}
