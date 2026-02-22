// ============================================================
// types/index.ts - All shared TypeScript interfaces and types
// ============================================================

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Task entity stored in the in-memory store
 */
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

/**
 * Payload embedded inside a JWT access token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * User entity stored in the in-memory store
 */
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Request body for POST /auth/register
 */
export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

/**
 * Request body for POST /auth/login
 */
export interface LoginBody {
  email: string;
  password: string;
}

/**
 * Request body for POST /tasks and PATCH /tasks/:id
 */
export interface TaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Auth success response data
 */
export interface AuthResponseData {
  token: string;
  user: Omit<User, 'passwordHash'>;
}
