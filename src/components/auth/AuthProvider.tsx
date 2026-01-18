import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { initializeBackend, isRealBackend } from '@/services/backend';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize: initializeAuth, authUser, status } = useAuthStore();
  const { initializeSync, cleanupSync } = useUserStore();

  // Initialize backend and auth on mount
  useEffect(() => {
    // Initialize the backend (Firebase or mock)
    initializeBackend();

    // Initialize auth listener
    const unsubscribe = initializeAuth();

    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // Sync user data when auth state changes
  useEffect(() => {
    if (!isRealBackend()) {
      return;
    }

    if (status === 'authenticated' && authUser) {
      // User logged in, start syncing
      initializeSync(authUser.uid);
    } else if (status === 'unauthenticated') {
      // User logged out, cleanup
      cleanupSync();
    }
  }, [status, authUser, initializeSync, cleanupSync]);

  return <>{children}</>;
}
