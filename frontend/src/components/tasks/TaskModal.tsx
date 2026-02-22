// ============================================================
// components/tasks/TaskModal.tsx - Create / Edit task modal
// ============================================================

import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskFormData } from '../../types';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import styles from './TaskModal.module.css';

interface TaskModalProps {
  /** The task to edit, or undefined to create a new one */
  task?: Task;
  onClose: () => void;
}

const DEFAULT_FORM: TaskFormData = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
};

/**
 * TaskModal – unified create/edit modal.
 * Uses framer-motion for smooth entrance/exit animations.
 * Validates the title before submission.
 */
export default function TaskModal({ task, onClose }: TaskModalProps) {
  const isEditing = !!task;

  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  // Pre-fill form when editing an existing task
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? '',
      });
    }
  }, [task]);

  /** Close modal when clicking outside or pressing Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  /** Update a single form field */
  const setField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /** Client-side validation */
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (form.dueDate && new Date(form.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.dueDate = 'Due date cannot be in the past.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };

    try {
      if (isEditing && task) {
        await updateMutation.mutateAsync({ id: task.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      // Errors are handled in the mutation hooks (toast notifications)
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    await deleteMutation.mutateAsync(task.id);
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label={isEditing ? 'Edit task' : 'Create task'}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>{isEditing ? 'Edit Task' : 'New Task'}</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} noValidate>
            {/* Title */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="What needs to be done?"
                className={`${styles.input} ${errors.title ? styles.error : ''}`}
                autoFocus
              />
              {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Add more details…"
                className={styles.textarea}
              />
            </div>

            {/* Status + Priority row */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value as TaskFormData['status'])}
                  className={styles.select}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  value={form.priority}
                  onChange={(e) =>
                    setField('priority', e.target.value as TaskFormData['priority'])
                  }
                  className={styles.select}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`${styles.input} ${errors.dueDate ? styles.error : ''}`}
              />
              {errors.dueDate && <span className={styles.errorMsg}>{errors.dueDate}</span>}
            </div>

            {/* Footer actions */}
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isPending}>
                {isPending
                  ? 'Saving…'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
              </button>
            </div>
          </form>

          {/* Delete button – only in edit mode */}
          {isEditing && (
            <div className={styles.dangerZone}>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => void handleDelete()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : '🗑 Delete Task'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
