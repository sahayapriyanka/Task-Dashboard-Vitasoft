// ============================================================
// components/tasks/TaskCard.tsx - Individual task display card
// ============================================================

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';
import { Task } from '../../types';
import { useDeleteTask, useUpdateTask } from '../../hooks/useTasks';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

/** Maps status values to human-readable labels */
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

/** Maps priority values to human-readable labels */
const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/** Returns the CSS module class name for a given status */
function getStatusClass(status: string): string {
  if (status === 'todo') return styles.statusTodo;
  if (status === 'in-progress') return styles.statusInProgress;
  return styles.statusDone;
}

/** Returns the CSS module class name for a given priority (badge) */
function getPriorityBadgeClass(priority: string): string {
  if (priority === 'low') return styles.priorityLowBadge;
  if (priority === 'medium') return styles.priorityMediumBadge;
  return styles.priorityHighBadge;
}

/** Returns the CSS module class name for left-border accent */
function getPriorityCardClass(priority: string): string {
  if (priority === 'low') return styles.priorityLow;
  if (priority === 'medium') return styles.priorityMedium;
  return styles.priorityHigh;
}

/** Animated task card with edit/delete/quick-complete actions */
const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ task, onEdit }, ref) => {
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTask();

  const isOverdue =
    task.dueDate && task.status !== 'done' && isBefore(parseISO(task.dueDate), startOfToday());

  /** Toggle task completion with a single click */
  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    updateMutation.mutate({ id: task.id, data: { status: nextStatus } });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this task?')) {
      deleteMutation.mutate(task.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`${styles.card} ${getPriorityCardClass(task.priority)} ${
        task.status === 'done' ? styles.done : ''
      }`}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      onClick={() => onEdit(task)}
    >
      {/* ── Top row: status + priority badges ─── */}
      <div className={styles.topRow}>
        <span className={`${styles.badge} ${getStatusClass(task.status)}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <span className={`${styles.badge} ${getPriorityBadgeClass(task.priority)}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {/* ── Title ─────────────────────────────── */}
      <h3 className={styles.title}>{task.title}</h3>

      {/* ── Description ───────────────────────── */}
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {/* ── Bottom row: due date + actions ────── */}
      <div className={styles.bottomRow}>
        <div>
          {task.dueDate ? (
            <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
              📅 {format(parseISO(task.dueDate), 'MMM d, yyyy')}
              {isOverdue && ' · Overdue'}
            </span>
          ) : (
            <span className={styles.createdAt}>
              {format(new Date(task.createdAt), 'MMM d')}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          {/* Quick toggle done */}
          <button
            className={styles.actionBtn}
            onClick={handleToggleDone}
            title={task.status === 'done' ? 'Mark as to do' : 'Mark as done'}
          >
            {task.status === 'done' ? '↩' : '✓'}
          </button>

          {/* Edit */}
          <button className={styles.actionBtn} onClick={handleEdit} title="Edit task">
            ✎
          </button>

          {/* Delete */}
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
