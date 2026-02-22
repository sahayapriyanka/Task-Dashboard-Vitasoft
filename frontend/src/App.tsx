// ============================================================
// App.tsx - Application root with routing and providers
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import ProtectedRoute from './components/ui/ProtectedRoute';
import AuthPage from './components/auth/AuthPage';
import Layout from './components/layout/Layout';
import Dashboard from './components/tasks/Dashboard';

/**
 * Configure the React Query client.
 * - staleTime: 30s – prevents unnecessary refetches for fresh data
 * - retry: 1 – retry failed requests once before showing an error
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

/** Root application component */
export default function App() {
  const { token } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Toast notification provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#131d31',
            color: '#f0f4ff',
            border: '1px solid #1e2d4a',
            borderRadius: '10px',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: '#4ade80', secondary: '#131d31' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#131d31' },
          },
        }}
      />

      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public auth route */}
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <AuthPage />}
          />

          {/* Protected dashboard route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all – redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* React Query DevTools – only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
