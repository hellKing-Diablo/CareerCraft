// Interfaces
export type { IAuthProvider, IDataProvider, AuthUser, UserProfile, UnsubscribeFn } from './interfaces';

// Factory
export {
  initializeBackend,
  getCurrentBackend,
  isBackendReady,
  isRealBackend,
  getAuthProvider,
  getDataProvider,
  type BackendType,
} from './BackendFactory';

// Firebase (for direct access if needed)
export { isFirebaseConfigured } from './firebase';
