// ============================================================
// services/api.ts - Axios instance with JWT auth interceptor
// ============================================================

import axios, { AxiosError } from 'axios';
import { ApiResponse, AuthResponseData, Task, TaskFormData, User } from '../types';

/** Base URL for all API requests */
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Configured Axios instance.
 * The request interceptor automatically attaches the stored JWT token
 * to every outgoing request's Authorization header.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor – attach JWT token ────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor – handle 401 globally ────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────

export const authApi = {
  /** Register a new user account */
  register: async (email: string, password: string, name: string) => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', {
      email,
      password,
      name,
    });
    return res.data;
  },

  /** Log in and receive a JWT token */
  login: async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  /** Get the currently authenticated user's profile */
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};

// ── Tasks API ─────────────────────────────────────────────────

export const tasksApi = {
  /** Fetch all tasks (with optional filters) */
  getAll: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return res.data;
  },

  /** Fetch a single task by id */
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  /** Create a new task */
  create: async (data: Partial<TaskFormData>) => {
    const res = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return res.data;
  },

  /** Partially update an existing task */
  update: async (id: string, data: Partial<TaskFormData>) => {
    const res = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },

  /** Delete a task */
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/tasks/${id}`);
    return res.data;
  },
};
