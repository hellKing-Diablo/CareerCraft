import { create } from 'zustand';
import { getAuthProvider, getDataProvider, isRealBackend, type AuthUser, type UserProfile } from '@/services/backend';
import type { UnsubscribeFn } from '@/services/backend/interfaces';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  // Auth state
  authUser: AuthUser | null;
  status: AuthStatus;
  error: string | null;

  // Loading states for specific operations
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;

  // Actions
  initialize: () => UnsubscribeFn;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  status: 'loading',
  error: null,
  isSigningIn: false,
  isSigningUp: false,
  isSigningOut: false,

  initialize: () => {
    if (!isRealBackend()) {
      // No backend configured, set as unauthenticated immediately
      set({ status: 'unauthenticated', authUser: null });
      return () => {};
    }

    const authProvider = getAuthProvider();

    // Subscribe to auth state changes
    const unsubscribe = authProvider.onAuthStateChanged((user) => {
      set({
        authUser: user,
        status: user ? 'authenticated' : 'unauthenticated',
        error: null,
      });
    });

    return unsubscribe;
  },

  signUpWithEmail: async (email, password, name) => {
    set({ isSigningUp: true, error: null });
    try {
      const authProvider = getAuthProvider();
      const dataProvider = getDataProvider();
      const authUser = await authProvider.signUpWithEmail(email, password, name);

      // Create initial user profile in Firestore
      const profile: UserProfile = {
        email: authUser.email || email,
        name: authUser.displayName || name,
        stage: 'beginner',
        hasCompletedOnboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await dataProvider.setUserProfile(authUser.uid, profile);

      set({ authUser, status: 'authenticated', isSigningUp: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign up';
      set({ error: message, isSigningUp: false });
      throw error;
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isSigningIn: true, error: null });
    try {
      const authProvider = getAuthProvider();
      const authUser = await authProvider.signInWithEmail(email, password);
      set({ authUser, status: 'authenticated', isSigningIn: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      set({ error: message, isSigningIn: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ isSigningIn: true, error: null });
    try {
      const authProvider = getAuthProvider();
      const dataProvider = getDataProvider();
      const authUser = await authProvider.signInWithGoogle();

      // Check if user profile exists, create if not
      const existingProfile = await dataProvider.getUserProfile(authUser.uid);
      if (!existingProfile) {
        const profile: UserProfile = {
          email: authUser.email || '',
          name: authUser.displayName || 'User',
          stage: 'beginner',
          hasCompletedOnboarding: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await dataProvider.setUserProfile(authUser.uid, profile);
      }

      set({ authUser, status: 'authenticated', isSigningIn: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      set({ error: message, isSigningIn: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isSigningOut: true, error: null });
    try {
      const authProvider = getAuthProvider();
      await authProvider.signOut();
      set({ authUser: null, status: 'unauthenticated', isSigningOut: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: message, isSigningOut: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    const { authUser } = get();
    if (!authUser) throw new Error('Not authenticated');

    try {
      const authProvider = getAuthProvider();
      const dataProvider = getDataProvider();

      await authProvider.updateProfile(data);

      // Update Firestore profile
      if (data.displayName) {
        await dataProvider.updateUserProfile(authUser.uid, {
          name: data.displayName,
          updatedAt: new Date(),
        });
      }

      // Update local state
      set({
        authUser: {
          ...authUser,
          displayName: data.displayName ?? authUser.displayName,
          photoURL: data.photoURL ?? authUser.photoURL,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: message });
      throw error;
    }
  },

  sendPasswordResetEmail: async (email) => {
    try {
      const authProvider = getAuthProvider();
      await authProvider.sendPasswordResetEmail(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send password reset email';
      set({ error: message });
      throw error;
    }
  },

  deleteAccount: async () => {
    const { authUser } = get();
    if (!authUser) throw new Error('Not authenticated');

    try {
      const authProvider = getAuthProvider();
      const dataProvider = getDataProvider();

      // Delete all user data first
      await dataProvider.deleteAllUserData(authUser.uid);

      // Then delete the auth account
      await authProvider.deleteAccount();

      set({ authUser: null, status: 'unauthenticated' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
