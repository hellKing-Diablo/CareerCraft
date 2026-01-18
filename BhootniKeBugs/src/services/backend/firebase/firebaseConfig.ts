import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

// Initialize Firebase
export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  // Check if already initialized
  if (app && auth && db) {
    return { app, auth, db };
  }

  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Please add Firebase config to .env file.');
    return null;
  }

  try {
    // Initialize Firebase app (check if already initialized)
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Auth
    auth = getAuth(app);

    // Initialize Firestore with unlimited cache
    db = getFirestore(app);

    // Enable offline persistence
    enableIndexedDbPersistence(db, { forceOwnership: false })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firestore persistence unavailable: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser doesn't support persistence
          console.warn('Firestore persistence unavailable: Browser not supported');
        }
      });

    // Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firebase emulators');
    }

    console.log('Firebase initialized successfully');
    return { app, auth, db };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

// Get Firebase instances (throws if not initialized)
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const result = initializeFirebase();
    if (!result) {
      throw new Error('Firebase is not initialized');
    }
  }
  return app!;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const result = initializeFirebase();
    if (!result) {
      throw new Error('Firebase is not initialized');
    }
  }
  return auth!;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    const result = initializeFirebase();
    if (!result) {
      throw new Error('Firebase is not initialized');
    }
  }
  return db!;
}
