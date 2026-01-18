import type { IAuthProvider, IDataProvider } from './interfaces';
import { FirebaseAuthProvider, FirebaseDataProvider, initializeFirebase, isFirebaseConfigured } from './firebase';

export type BackendType = 'firebase' | 'mock';

// Backend state
let currentBackend: BackendType = 'mock';
let authProvider: IAuthProvider | null = null;
let dataProvider: IDataProvider | null = null;
let isInitialized = false;

// Mock provider that does nothing (for when Firebase isn't configured)
class MockAuthProvider implements IAuthProvider {
  getCurrentUser() { return null; }
  onAuthStateChanged(callback: (user: null) => void) {
    callback(null);
    return () => {};
  }
  async signUpWithEmail(): Promise<never> { throw new Error('Backend not configured'); }
  async signInWithEmail(): Promise<never> { throw new Error('Backend not configured'); }
  async signInWithGoogle(): Promise<never> { throw new Error('Backend not configured'); }
  async signOut(): Promise<void> { throw new Error('Backend not configured'); }
  async updateProfile(): Promise<void> { throw new Error('Backend not configured'); }
  async sendPasswordResetEmail(): Promise<void> { throw new Error('Backend not configured'); }
  async deleteAccount(): Promise<void> { throw new Error('Backend not configured'); }
}

class MockDataProvider implements IDataProvider {
  async getUserProfile() { return null; }
  async setUserProfile() {}
  async updateUserProfile() {}
  async deleteUserProfile() {}
  subscribeToUserProfile() { return () => {}; }

  async getSkills() { return []; }
  async setSkill() {}
  async updateSkill() {}
  async deleteSkill() {}
  subscribeToSkills() { return () => {}; }

  async getCareerGoals() { return []; }
  async setCareerGoal() {}
  async updateCareerGoal() {}
  async deleteCareerGoal() {}
  subscribeToCareerGoals() { return () => {}; }

  async getCourses() { return []; }
  async setCourse() {}
  async updateCourse() {}
  async deleteCourse() {}
  subscribeToCourses() { return () => {}; }

  async getProjects() { return []; }
  async setProject() {}
  async updateProject() {}
  async deleteProject() {}
  subscribeToProjects() { return () => {}; }

  async getAchievements() { return []; }
  async setAchievement() {}
  async deleteAchievement() {}
  subscribeToAchievements() { return () => {}; }

  async getAllUserData() {
    return {
      profile: null,
      skills: [],
      careerGoals: [],
      courses: [],
      projects: [],
      achievements: [],
    };
  }
  async deleteAllUserData() {}
}

// Initialize the backend
export function initializeBackend(preferredBackend: BackendType = 'firebase'): boolean {
  if (isInitialized) {
    return currentBackend !== 'mock';
  }

  if (preferredBackend === 'firebase' && isFirebaseConfigured()) {
    const result = initializeFirebase();
    if (result) {
      authProvider = new FirebaseAuthProvider();
      dataProvider = new FirebaseDataProvider();
      currentBackend = 'firebase';
      isInitialized = true;
      console.log('Backend initialized: Firebase');
      return true;
    }
  }

  // Fall back to mock
  authProvider = new MockAuthProvider();
  dataProvider = new MockDataProvider();
  currentBackend = 'mock';
  isInitialized = true;
  console.log('Backend initialized: Mock (Firebase not configured)');
  return false;
}

// Get current backend type
export function getCurrentBackend(): BackendType {
  return currentBackend;
}

// Check if backend is ready
export function isBackendReady(): boolean {
  return isInitialized;
}

// Check if using real backend (not mock)
export function isRealBackend(): boolean {
  return currentBackend !== 'mock';
}

// Get auth provider
export function getAuthProvider(): IAuthProvider {
  if (!isInitialized) {
    initializeBackend();
  }
  return authProvider!;
}

// Get data provider
export function getDataProvider(): IDataProvider {
  if (!isInitialized) {
    initializeBackend();
  }
  return dataProvider!;
}
