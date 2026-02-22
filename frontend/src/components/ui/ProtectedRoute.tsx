// ============================================================
// components/ui/ProtectedRoute.tsx - Guards authenticated routes
// ============================================================

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute – wraps routes that require authentication.
 * If no token is present in the store, redirects to /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
