// Auth User type returned by providers
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Unsubscribe function type
export type UnsubscribeFn = () => void;

// Auth Provider Interface - can be implemented by Firebase, Supabase, custom API, etc.
export interface IAuthProvider {
  // Get current authenticated user (synchronous, from cache)
  getCurrentUser(): AuthUser | null;

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void): UnsubscribeFn;

  // Email/Password authentication
  signUpWithEmail(email: string, password: string, name: string): Promise<AuthUser>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;

  // OAuth providers
  signInWithGoogle(): Promise<AuthUser>;

  // Sign out
  signOut(): Promise<void>;

  // Profile management
  updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void>;

  // Password management
  sendPasswordResetEmail(email: string): Promise<void>;

  // Account deletion
  deleteAccount(): Promise<void>;
}
