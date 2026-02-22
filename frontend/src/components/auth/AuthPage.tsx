// ============================================================
// components/auth/AuthPage.tsx - Login / Register page
// ============================================================

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ApiResponse } from '../../types';
import styles from './AuthPage.module.css';

type AuthMode = 'login' | 'register';

/** Animated login/register form with real-time validation */
export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const { login, register, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Clear all errors when switching modes
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setApiError('');
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  /** Client-side validation before API call */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors['email'] = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors['email'] = 'Enter a valid email';
    if (!password) newErrors['password'] = 'Password is required';
    else if (password.length < 8) newErrors['password'] = 'Password must be at least 8 characters';
    if (mode === 'register' && !name.trim()) newErrors['name'] = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      // Navigation is handled by the router in App.tsx
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse>;
      setApiError(
        axiosErr.response?.data?.message ??
          axiosErr.response?.data?.errors?.[0] ??
          'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div className={styles.page}>
      {/* Theme toggle button */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✦</div>
          <span className={styles.logoText}>TaskFlow</span>
        </div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className={styles.title}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className={styles.subtitle}>
              {mode === 'login'
                ? 'Sign in to manage your tasks'
                : 'Start organising your work today'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* API Error */}
        <AnimatePresence>
          {apiError && (
            <motion.div
              className={styles.apiError}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className={styles.form} noValidate>
          {/* Name field – register only */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                className={styles.field}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className={styles.label} htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className={`${styles.input} ${errors['name'] ? styles.error : ''}`}
                  autoComplete="name"
                />
                {errors['name'] && <span className={styles.errorMsg}>{errors['name']}</span>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`${styles.input} ${errors['email'] ? styles.error : ''}`}
              autoComplete="email"
            />
            {errors['email'] && <span className={styles.errorMsg}>{errors['email']}</span>}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                className={`${styles.input} ${errors['password'] ? styles.error : ''}`}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors['password'] && <span className={styles.errorMsg}>{errors['password']}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <p className={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className={styles.switchLink}
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
