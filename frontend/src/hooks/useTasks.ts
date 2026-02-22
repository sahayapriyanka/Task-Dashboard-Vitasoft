// ============================================================
// hooks/useTasks.ts - React Query hooks for task operations
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksApi } from '../services/api';
import { TaskFilters, TaskFormData } from '../types';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types';

/** Query key factory – keeps cache keys consistent */
export const taskKeys = {
  all: ['tasks'] as const,
  filtered: (filters: Partial<TaskFilters>) => ['tasks', filters] as const,
  detail: (id: string) => ['tasks', id] as const,
};

/**
 * useTasks – fetch tasks with optional filters applied server-side.
 * Results are cached by React Query and refetched on focus.
 */
export const useTasks = (filters: TaskFilters) => {
  const params = {
    ...(filters.status !== 'all' && { status: filters.status }),
    ...(filters.priority !== 'all' && { priority: filters.priority }),
    ...(filters.search && { search: filters.search }),
  };

  return useQuery({
    queryKey: taskKeys.filtered(params),
    queryFn: () => tasksApi.getAll(params),
    select: (data) => data.data ?? [],
  });
};

/**
 * useCreateTask – mutation for creating a new task.
 * On success, invalidates the task list cache and shows a toast.
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TaskFormData>) => tasksApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task created!');
    },
    onError: (err: AxiosError<ApiResponse>) => {
      const msg =
        err.response?.data?.message ?? err.response?.data?.errors?.[0] ?? 'Failed to create task.';
      toast.error(msg);
    },
  });
};

/**
 * useUpdateTask – mutation for updating an existing task.
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task updated!');
    },
    onError: (err: AxiosError<ApiResponse>) => {
      const msg = err.response?.data?.message ?? 'Failed to update task.';
      toast.error(msg);
    },
  });
};

/**
 * useDeleteTask – mutation for deleting a task.
 * Uses optimistic invalidation for immediate UI feedback.
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task deleted.');
    },
    onError: (err: AxiosError<ApiResponse>) => {
      const msg = err.response?.data?.message ?? 'Failed to delete task.';
      toast.error(msg);
    },
  });
};
