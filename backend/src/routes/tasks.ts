// ============================================================
// routes/tasks.ts - Task CRUD endpoints with Swagger docs
// All routes protected by JWT authentication middleware
// ============================================================

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Apply authentication middleware to every task route
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management (all endpoints require Bearer token)
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task UUID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getTaskById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Implement authentication
 *               description:
 *                 type: string
 *                 example: Build JWT login flow
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 default: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 nullable: true
 *                 example: 2024-12-31
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required.'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'done'])
      .withMessage('Status must be todo, in-progress, or done.'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high.'),
    body('dueDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Due date must be a valid ISO 8601 date.')
      .custom((value) => {
        if (value && new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
          throw new Error('Due date cannot be in the past.');
        }
        return true;
      }),
  ],
  validate,
  createTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update an existing task (partial update)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'done'])
      .withMessage('Status must be todo, in-progress, or done.'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high.'),
    body('dueDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Due date must be a valid ISO 8601 date.')
      .custom((value) => {
        if (value && new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
          throw new Error('Due date cannot be in the past.');
        }
        return true;
      }),
  ],
  validate,
  updateTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task permanently
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteTask);

export default router;
