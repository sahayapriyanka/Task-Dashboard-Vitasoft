// ============================================================
// config/store.ts - In-memory data store (replaces a database)
// In production, replace with PostgreSQL / MongoDB connection.
// ============================================================

import { User, Task } from '../types';

/**
 * Simple in-memory store that acts as a database replacement.
 * Data resets on server restart – swap with a real DB for production.
 */
class InMemoryStore {
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();

  // ── Users ──────────────────────────────────────────────────

  /** Find a user by their unique id */
  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  /** Find a user by email address (case-insensitive) */
  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  /** Persist a new user */
  saveUser(user: User): void {
    this.users.set(user.id, user);
  }

  // ── Tasks ──────────────────────────────────────────────────

  /** Return all tasks belonging to the given user */
  getTasksByUser(userId: string): Task[] {
    return Array.from(this.tasks.values()).filter((t) => t.userId === userId);
  }

  /** Find a single task by id */
  findTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /** Persist a task (create or update) */
  saveTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  /** Remove a task permanently */
  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }
}

// Export a singleton instance used across the entire application
export const store = new InMemoryStore();
