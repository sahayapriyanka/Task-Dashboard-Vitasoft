// ============================================================
// controllers/taskController.ts - Full CRUD for tasks
// ============================================================

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { repository } from '../config/repository';
import { Task, TaskBody, ApiResponse, TaskStatus, TaskPriority } from '../types';

/**
 * GET /tasks
 *
 * Returns all tasks that belong to the authenticated user.
 * Supports optional query params: status, priority, search.
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  let tasks = await repository.getTasksByUser(userId);

  // Optional filter by status
  const { status, priority, search } = req.query;
  if (status && typeof status === 'string') {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (priority && typeof priority === 'string') {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  // Case-insensitive search on title + description
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  // Sort by creation date descending (newest first)
  tasks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const response: ApiResponse<Task[]> = { success: true, data: tasks };
  res.json(response);
};

/**
 * GET /tasks/:id
 *
 * Returns a single task by id.
 * Enforces ownership – users cannot access other users' tasks.
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const task = await repository.findTaskById(req.params['id']);
  if (!task || task.userId !== req.user!.userId) {
    res.status(404).json({ success: false, message: 'Task not found.' });
    return;
  }
  res.json({ success: true, data: task });
};

/**
 * POST /tasks
 *
 * Creates a new task for the authenticated user.
 */
export const createTask = async (
  req: Request<Record<string, never>, ApiResponse<Task>, TaskBody>,
  res: Response<ApiResponse<Task>>
): Promise<void> => {
  const { title, description = '', status = 'todo', priority = 'medium', dueDate = null } =
    req.body;

  const newTask: Task = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    status: status as TaskStatus,
    priority: priority as TaskPriority,
    dueDate: dueDate ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: req.user!.userId,
  };

  await repository.saveTask(newTask);

  res.status(201).json({
    success: true,
    data: newTask,
    message: 'Task created successfully.',
  });
};

/**
 * PATCH /tasks/:id
 *
 * Partially updates an existing task.
 * Only fields present in the request body are updated.
 * Enforces ownership check.
 */
export const updateTask = async (
  req: Request<{ id: string }, ApiResponse<Task>, Partial<TaskBody>>,
  res: Response<ApiResponse<Task>>
): Promise<void> => {
  const task = await repository.findTaskById(req.params['id']);

  // Task must exist and belong to the current user
  if (!task || task.userId !== req.user!.userId) {
    res.status(404).json({ success: false, message: 'Task not found.' });
    return;
  }

  const { title, description, status, priority, dueDate } = req.body;

  // Build updated task – only overwrite provided fields
  const updatedTask: Task = {
    ...task,
    title: title !== undefined ? title.trim() : task.title,
    description: description !== undefined ? description.trim() : task.description,
    status: status !== undefined ? (status as TaskStatus) : task.status,
    priority: priority !== undefined ? (priority as TaskPriority) : task.priority,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    updatedAt: new Date().toISOString(),
  };

  await repository.saveTask(updatedTask);

  res.json({
    success: true,
    data: updatedTask,
    message: 'Task updated successfully.',
  });
};

/**
 * DELETE /tasks/:id
 *
 * Permanently removes a task.
 * Enforces ownership check.
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const task = await repository.findTaskById(req.params['id']);

  if (!task || task.userId !== req.user!.userId) {
    res.status(404).json({ success: false, message: 'Task not found.' });
    return;
  }

  await repository.deleteTask(task.id);

  res.json({ success: true, message: 'Task deleted successfully.' });
};
