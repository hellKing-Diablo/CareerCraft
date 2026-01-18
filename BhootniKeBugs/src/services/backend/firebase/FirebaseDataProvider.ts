import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebaseConfig';
import type { IDataProvider, UserProfile, UnsubscribeFn } from '../interfaces';
import type {
  UserSkill,
  CareerGoal,
  UserCourse,
  Project,
  UserAchievement
} from '@/types';

// Helper to check if value is a Firestore Timestamp
function isTimestamp(value: unknown): value is Timestamp {
  return value !== null && typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function';
}

// Helper to convert Firestore Timestamp to Date
function convertTimestamps<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  const result = { ...data } as Record<string, unknown>;
  for (const key in result) {
    const value = result[key];
    if (isTimestamp(value)) {
      result[key] = value.toDate();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertTimestamps(value);
    }
  }
  return result as T;
}

// Helper to convert Date to Firestore Timestamp
function prepareForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  const result = { ...data } as Record<string, unknown>;
  for (const key in result) {
    const value = result[key];
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = prepareForFirestore(value);
    }
  }
  return result as T;
}

export class FirebaseDataProvider implements IDataProvider {
  private getUserDocRef(userId: string) {
    return doc(getFirebaseDb(), 'users', userId);
  }

  private getCollectionRef(userId: string, collectionName: string) {
    return collection(getFirebaseDb(), 'users', userId, collectionName);
  }

  private getDocRef(userId: string, collectionName: string, docId: string) {
    return doc(getFirebaseDb(), 'users', userId, collectionName, docId);
  }

  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = this.getUserDocRef(userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return convertTimestamps(docSnap.data()) as UserProfile;
  }

  async setUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const docRef = this.getUserDocRef(userId);
    await setDoc(docRef, prepareForFirestore(profile), { merge: true });
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const docRef = this.getUserDocRef(userId);
    await updateDoc(docRef, prepareForFirestore(updates));
  }

  async deleteUserProfile(userId: string): Promise<void> {
    const docRef = this.getUserDocRef(userId);
    await deleteDoc(docRef);
  }

  subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): UnsubscribeFn {
    const docRef = this.getUserDocRef(userId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
        } else {
          callback(convertTimestamps(docSnap.data()) as UserProfile);
        }
      },
      (error) => {
        console.error('Error subscribing to user profile:', error);
        // Call with null to indicate no data (allows app to continue)
        callback(null);
      }
    );
  }

  // Generic collection helpers
  private async getCollection<T>(userId: string, collectionName: string): Promise<T[]> {
    const collRef = this.getCollectionRef(userId, collectionName);
    const snapshot = await getDocs(collRef);
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as T);
  }

  private async setDocument<T extends { id: string }>(
    userId: string,
    collectionName: string,
    data: T
  ): Promise<void> {
    const docRef = this.getDocRef(userId, collectionName, data.id);
    const { id, ...dataWithoutId } = data;
    await setDoc(docRef, prepareForFirestore(dataWithoutId), { merge: true });
  }

  private async updateDocument<T>(
    userId: string,
    collectionName: string,
    docId: string,
    updates: Partial<T>
  ): Promise<void> {
    const docRef = this.getDocRef(userId, collectionName, docId);
    await updateDoc(docRef, prepareForFirestore(updates as DocumentData));
  }

  private async deleteDocument(userId: string, collectionName: string, docId: string): Promise<void> {
    const docRef = this.getDocRef(userId, collectionName, docId);
    await deleteDoc(docRef);
  }

  private subscribeToCollection<T>(
    userId: string,
    collectionName: string,
    callback: (items: T[]) => void
  ): UnsubscribeFn {
    const collRef = this.getCollectionRef(userId, collectionName);
    return onSnapshot(
      collRef,
      (snapshot) => {
        const items = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as T);
        callback(items);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName}:`, error);
        // Call with empty array to indicate no data (allows app to continue)
        callback([]);
      }
    );
  }

  // Skills
  async getSkills(userId: string): Promise<UserSkill[]> {
    return this.getCollection<UserSkill>(userId, 'skills');
  }

  async setSkill(userId: string, skill: UserSkill): Promise<void> {
    console.log('[FirebaseDataProvider] setSkill called:', { userId, skill });
    try {
      await this.setDocument(userId, 'skills', skill);
      console.log('[FirebaseDataProvider] setSkill SUCCESS:', skill.skillId);
    } catch (error) {
      console.error('[FirebaseDataProvider] setSkill FAILED:', error);
      throw error;
    }
  }

  async updateSkill(userId: string, skillId: string, updates: Partial<UserSkill>): Promise<void> {
    return this.updateDocument(userId, 'skills', skillId, updates);
  }

  async deleteSkill(userId: string, skillId: string): Promise<void> {
    return this.deleteDocument(userId, 'skills', skillId);
  }

  subscribeToSkills(userId: string, callback: (skills: UserSkill[]) => void): UnsubscribeFn {
    return this.subscribeToCollection(userId, 'skills', callback);
  }

  // Career Goals
  async getCareerGoals(userId: string): Promise<CareerGoal[]> {
    return this.getCollection<CareerGoal>(userId, 'careerGoals');
  }

  async setCareerGoal(userId: string, goal: CareerGoal): Promise<void> {
    return this.setDocument(userId, 'careerGoals', goal);
  }

  async updateCareerGoal(userId: string, goalId: string, updates: Partial<CareerGoal>): Promise<void> {
    return this.updateDocument(userId, 'careerGoals', goalId, updates);
  }

  async deleteCareerGoal(userId: string, goalId: string): Promise<void> {
    return this.deleteDocument(userId, 'careerGoals', goalId);
  }

  subscribeToCareerGoals(userId: string, callback: (goals: CareerGoal[]) => void): UnsubscribeFn {
    return this.subscribeToCollection(userId, 'careerGoals', callback);
  }

  // Courses
  async getCourses(userId: string): Promise<UserCourse[]> {
    return this.getCollection<UserCourse>(userId, 'courses');
  }

  async setCourse(userId: string, course: UserCourse): Promise<void> {
    return this.setDocument(userId, 'courses', course);
  }

  async updateCourse(userId: string, courseId: string, updates: Partial<UserCourse>): Promise<void> {
    return this.updateDocument(userId, 'courses', courseId, updates);
  }

  async deleteCourse(userId: string, courseId: string): Promise<void> {
    return this.deleteDocument(userId, 'courses', courseId);
  }

  subscribeToCourses(userId: string, callback: (courses: UserCourse[]) => void): UnsubscribeFn {
    return this.subscribeToCollection(userId, 'courses', callback);
  }

  // Projects
  async getProjects(userId: string): Promise<Project[]> {
    return this.getCollection<Project>(userId, 'projects');
  }

  async setProject(userId: string, project: Project): Promise<void> {
    return this.setDocument(userId, 'projects', project);
  }

  async updateProject(userId: string, projectId: string, updates: Partial<Project>): Promise<void> {
    return this.updateDocument(userId, 'projects', projectId, updates);
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    return this.deleteDocument(userId, 'projects', projectId);
  }

  subscribeToProjects(userId: string, callback: (projects: Project[]) => void): UnsubscribeFn {
    return this.subscribeToCollection(userId, 'projects', callback);
  }

  // Achievements
  async getAchievements(userId: string): Promise<UserAchievement[]> {
    return this.getCollection<UserAchievement>(userId, 'achievements');
  }

  async setAchievement(userId: string, achievement: UserAchievement): Promise<void> {
    return this.setDocument(userId, 'achievements', achievement);
  }

  async deleteAchievement(userId: string, achievementId: string): Promise<void> {
    return this.deleteDocument(userId, 'achievements', achievementId);
  }

  subscribeToAchievements(userId: string, callback: (achievements: UserAchievement[]) => void): UnsubscribeFn {
    return this.subscribeToCollection(userId, 'achievements', callback);
  }

  // Batch operations
  async getAllUserData(userId: string): Promise<{
    profile: UserProfile | null;
    skills: UserSkill[];
    careerGoals: CareerGoal[];
    courses: UserCourse[];
    projects: Project[];
    achievements: UserAchievement[];
  }> {
    const [profile, skills, careerGoals, courses, projects, achievements] = await Promise.all([
      this.getUserProfile(userId),
      this.getSkills(userId),
      this.getCareerGoals(userId),
      this.getCourses(userId),
      this.getProjects(userId),
      this.getAchievements(userId),
    ]);

    return { profile, skills, careerGoals, courses, projects, achievements };
  }

  async deleteAllUserData(userId: string): Promise<void> {
    const db = getFirebaseDb();
    const batch = writeBatch(db);

    // Delete user profile
    batch.delete(this.getUserDocRef(userId));

    // Delete all subcollections
    const collections = ['skills', 'careerGoals', 'courses', 'projects', 'achievements'];
    for (const collName of collections) {
      const snapshot = await getDocs(this.getCollectionRef(userId, collName));
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();
  }
}
