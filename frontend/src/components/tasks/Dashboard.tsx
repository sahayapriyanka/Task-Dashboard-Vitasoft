// ============================================================
// components/tasks/Dashboard.tsx - Main task management view
// ============================================================

import { useState, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useTasks } from '../../hooks/useTasks';
import { Task, TaskFilters, TaskPriority, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import styles from './Dashboard.module.css';

const DEFAULT_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all',
  search: '',
};

/**
 * Dashboard – the main authenticated view.
 * Features:
 *  - Real-time stats counters
 *  - Search + filter toolbar
 *  - Animated task grid with framer-motion layout animations
 *  - Create/Edit modal
 */
export default function Dashboard() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
  const deferredFilters = useDeferredValue(filters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Always fetch ALL tasks for stats; filtered tasks handled server-side
  const { data: allTasks = [] } = useTasks(DEFAULT_FILTERS);
  const { data: tasks = [], isLoading } = useTasks(deferredFilters);

  // Computed stats
  const stats = {
    total: allTasks.length,
    todo: allTasks.filter((t) => t.status === 'todo').length,
    inProgress: allTasks.filter((t) => t.status === 'in-progress').length,
    done: allTasks.filter((t) => t.status === 'done').length,
  };

  const openCreate = () => {
    setEditingTask(undefined);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(undefined);
  };

  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <>
      {/* ── Page header ─────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Good day, {firstName} </h1>
          <p className={styles.pageSubtitle}>Here's what's on your plate today</p>
        </div>
        <button className={styles.addBtn} onClick={openCreate}>
          + New Task
        </button>
      </div>

      {/* ── Stats row ───────────────────────────── */}
      <div className={styles.statsRow}>
        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className={styles.statLabel}>Total</p>
          <p className={`${styles.statValue} ${styles.blue}`}>{stats.total}</p>
        </motion.div>
        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className={styles.statLabel}>To Do</p>
          <p className={`${styles.statValue} ${styles.purple}`}>{stats.todo}</p>
        </motion.div>
        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className={styles.statLabel}>In Progress</p>
          <p className={`${styles.statValue} ${styles.amber}`}>{stats.inProgress}</p>
        </motion.div>
        <motion.div
          className={styles.statCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className={styles.statLabel}>Done</p>
          <p className={`${styles.statValue} ${styles.green}`}>{stats.done}</p>
        </motion.div>
      </div>

      {/* ── Toolbar: search + filters ────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="search"
            placeholder="Search tasks…"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value as TaskStatus | 'all')}
          className={styles.filterSelect}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value as TaskPriority | 'all')}
          className={styles.filterSelect}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* ── Task grid ───────────────────────────── */}
      {isLoading ? (
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : (
        <motion.div className={styles.taskGrid} layout>
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div
                className={styles.emptyState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.emptyIcon}>📋</div>
                <p className={styles.emptyTitle}>
                  {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                    ? 'No tasks match your filters'
                    : 'No tasks yet'}
                </p>
                <p className={styles.emptyText}>
                  {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Click "+ New Task" to create your first task'}
                </p>
              </motion.div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEdit} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Create/Edit Modal ────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal task={editingTask} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
}
