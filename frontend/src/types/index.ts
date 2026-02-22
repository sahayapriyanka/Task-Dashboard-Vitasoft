// ============================================================
// types/index.ts - Shared TypeScript types for the frontend
// ============================================================

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

/** Task model returned from the API */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/** User model (without password hash) */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/** Auth response data */
export interface AuthResponseData {
  token: string;
  user: User;
}

/** Form data for creating / updating a task */
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

/** Filter state for task list */
export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  search: string;
}
