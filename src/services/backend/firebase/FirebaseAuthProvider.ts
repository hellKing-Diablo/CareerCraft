import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebaseConfig';
import type { IAuthProvider, AuthUser, UnsubscribeFn } from '../interfaces';

// Convert Firebase User to AuthUser
function toAuthUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

export class FirebaseAuthProvider implements IAuthProvider {
  private googleProvider = new GoogleAuthProvider();

  constructor() {
    // Add scopes for Google sign-in
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
  }

  getCurrentUser(): AuthUser | null {
    const auth = getFirebaseAuth();
    return toAuthUser(auth.currentUser);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): UnsubscribeFn {
    const auth = getFirebaseAuth();
    return firebaseOnAuthStateChanged(auth, (user) => {
      callback(toAuthUser(user));
    });
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthUser> {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    if (name) {
      await firebaseUpdateProfile(credential.user, { displayName: name });
    }

    const authUser = toAuthUser(credential.user);
    if (!authUser) {
      throw new Error('Failed to create user');
    }
    return authUser;
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const authUser = toAuthUser(credential.user);
    if (!authUser) {
      throw new Error('Failed to sign in');
    }
    return authUser;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, this.googleProvider);
    const authUser = toAuthUser(result.user);
    if (!authUser) {
      throw new Error('Failed to sign in with Google');
    }
    return authUser;
  }

  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }

  async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    await firebaseUpdateProfile(auth.currentUser, data);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const auth = getFirebaseAuth();
    await firebaseSendPasswordResetEmail(auth, email);
  }

  async deleteAccount(): Promise<void> {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }
    await deleteUser(auth.currentUser);
  }
}
