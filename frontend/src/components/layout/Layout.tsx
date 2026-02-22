// ============================================================
// components/layout/Layout.tsx - App shell with sticky header
// ============================================================

import { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

/** Main application layout: sticky header + scrollable content area */
export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  /** Generate initials for the avatar */
  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div className={styles.layout}>
      {/* ── Sticky header ───────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>✦</div>
            <span className={styles.logoText}>TaskFlow</span>
          </div>

          {/* Right side: theme toggle + user info + logout */}
          <div className={styles.headerRight}>
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

            {user && (
              <div className={styles.userInfo}>
                <div className={styles.avatar} title={user.name}>
                  {initials}
                </div>
                <span className={styles.userName}>{user.name}</span>
              </div>
            )}
            <button
              className={styles.logoutBtn}
              onClick={logout}
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────── */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
