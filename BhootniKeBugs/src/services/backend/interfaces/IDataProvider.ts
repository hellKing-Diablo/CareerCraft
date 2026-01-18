import type {
  User,
  UserSkill,
  CareerGoal,
  UserCourse,
  Project,
  UserAchievement
} from '@/types';

// Unsubscribe function type
export type UnsubscribeFn = () => void;

// User profile type for Firestore (without id, uses userId as document id)
export type UserProfile = Omit<User, 'id'>;

// Data Provider Interface - can be implemented by Firebase, Supabase, custom API, etc.
export interface IDataProvider {
  // User Profile CRUD
  getUserProfile(userId: string): Promise<UserProfile | null>;
  setUserProfile(userId: string, profile: UserProfile): Promise<void>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;
  deleteUserProfile(userId: string): Promise<void>;
  subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): UnsubscribeFn;

  // Skills CRUD
  getSkills(userId: string): Promise<UserSkill[]>;
  setSkill(userId: string, skill: UserSkill): Promise<void>;
  updateSkill(userId: string, skillId: string, updates: Partial<UserSkill>): Promise<void>;
  deleteSkill(userId: string, skillId: string): Promise<void>;
  subscribeToSkills(userId: string, callback: (skills: UserSkill[]) => void): UnsubscribeFn;

  // Career Goals CRUD
  getCareerGoals(userId: string): Promise<CareerGoal[]>;
  setCareerGoal(userId: string, goal: CareerGoal): Promise<void>;
  updateCareerGoal(userId: string, goalId: string, updates: Partial<CareerGoal>): Promise<void>;
  deleteCareerGoal(userId: string, goalId: string): Promise<void>;
  subscribeToCareerGoals(userId: string, callback: (goals: CareerGoal[]) => void): UnsubscribeFn;

  // User Courses CRUD
  getCourses(userId: string): Promise<UserCourse[]>;
  setCourse(userId: string, course: UserCourse): Promise<void>;
  updateCourse(userId: string, courseId: string, updates: Partial<UserCourse>): Promise<void>;
  deleteCourse(userId: string, courseId: string): Promise<void>;
  subscribeToCourses(userId: string, callback: (courses: UserCourse[]) => void): UnsubscribeFn;

  // Projects CRUD
  getProjects(userId: string): Promise<Project[]>;
  setProject(userId: string, project: Project): Promise<void>;
  updateProject(userId: string, projectId: string, updates: Partial<Project>): Promise<void>;
  deleteProject(userId: string, projectId: string): Promise<void>;
  subscribeToProjects(userId: string, callback: (projects: Project[]) => void): UnsubscribeFn;

  // Achievements CRUD
  getAchievements(userId: string): Promise<UserAchievement[]>;
  setAchievement(userId: string, achievement: UserAchievement): Promise<void>;
  deleteAchievement(userId: string, achievementId: string): Promise<void>;
  subscribeToAchievements(userId: string, callback: (achievements: UserAchievement[]) => void): UnsubscribeFn;

  // Batch operations for initial load/sync
  getAllUserData(userId: string): Promise<{
    profile: UserProfile | null;
    skills: UserSkill[];
    careerGoals: CareerGoal[];
    courses: UserCourse[];
    projects: Project[];
    achievements: UserAchievement[];
  }>;

  // Delete all user data (for account deletion)
  deleteAllUserData(userId: string): Promise<void>;
}
