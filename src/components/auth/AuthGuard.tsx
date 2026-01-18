import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { isRealBackend } from '@/services/backend';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-warm-100 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center shadow-lg">
          <Loader2 size={32} className="text-white animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-game">Loading...</p>
      </motion.div>
    </div>
  );
}

export function AuthGuard({ children, requireAuth = true, redirectTo }: AuthGuardProps) {
  const { status } = useAuthStore();
  const location = useLocation();

  // If backend is not configured, allow access (local mode)
  if (!isRealBackend()) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return <LoadingScreen />;
  }

  // If auth is required but user is not authenticated
  if (requireAuth && status === 'unauthenticated') {
    return <Navigate to={redirectTo || '/login'} state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access auth pages (login/signup)
  if (!requireAuth && status === 'authenticated') {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// Wrapper for routes that should only be accessible when NOT logged in
export function GuestGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      {children}
    </AuthGuard>
  );
}
