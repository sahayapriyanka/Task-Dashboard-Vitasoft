// ============================================================
// config/repository.ts - Database repository (replaces store.ts)
// ============================================================

import { db } from './database';
import { User, Task } from '../types';

/**
 * Database repository using Knex for MySQL queries.
 * Replaces the in-memory store with persistent database storage.
 */
class DatabaseRepository {
  // ── Users ──────────────────────────────────────────────────

  /** Find a user by their unique id */
  async findUserById(id: string): Promise<User | undefined> {
    const row = await db('users').where({ id }).first();
    return row ? this.mapUserFromDb(row) : undefined;
  }

  /** Find a user by email address (case-insensitive) */
  async findUserByEmail(email: string): Promise<User | undefined> {
    const row = await db('users')
      .whereRaw('LOWER(email) = ?', [email.toLowerCase()])
      .first();
    return row ? this.mapUserFromDb(row) : undefined;
  }

  /** Persist a new user */
  async saveUser(user: User): Promise<void> {
    await db('users').insert({
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      name: user.name,
      created_at: db.fn.now(),
    });
  }

  // ── Tasks ──────────────────────────────────────────────────

  /** Return all tasks belonging to the given user */
  async getTasksByUser(userId: string): Promise<Task[]> {
    const rows = await db('tasks').where({ user_id: userId }).select('*');
    return rows.map(this.mapTaskFromDb);
  }

  /** Find a single task by id */
  async findTaskById(id: string): Promise<Task | undefined> {
    const row = await db('tasks').where({ id }).first();
    return row ? this.mapTaskFromDb(row) : undefined;
  }

  /** Persist a task (create or update) */
  async saveTask(task: Task): Promise<void> {
    const existing = await this.findTaskById(task.id);
    
    // Format due_date: handle string, Date object, or null
    let formattedDueDate = null;
    if (task.dueDate) {
      if (typeof task.dueDate === 'string') {
        formattedDueDate = task.dueDate.split('T')[0];
      } else if (task.dueDate instanceof Date) {
        formattedDueDate = task.dueDate.toISOString().split('T')[0];
      }
    }
    
    const data = {
      id: task.id,
      user_id: task.userId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: formattedDueDate,
      updated_at: db.fn.now(),
    };

    if (existing) {
      await db('tasks').where({ id: task.id }).update(data);
    } else {
      await db('tasks').insert({ ...data, created_at: db.fn.now() });
    }
  }

  /** Remove a task permanently */
  async deleteTask(id: string): Promise<boolean> {
    const deleted = await db('tasks').where({ id }).delete();
    return deleted > 0;
  }

  /** Map database row to Task type (snake_case to camelCase) */
  private mapTaskFromDb(row: any): Task {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /** Map database row to User type (snake_case to camelCase) */
  private mapUserFromDb(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password,
      createdAt: row.created_at,
    };
  }
}

// Export a singleton instance
export const repository = new DatabaseRepository();
