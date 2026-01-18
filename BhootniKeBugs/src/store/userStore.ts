import { create } from 'zustand';
import { User, UserSkill, CareerGoal, UserCourse, Project, UserAchievement, SkillLevel, OnboardingData } from '@/types';
import { mockUser, mockUserSkills, mockCareerGoals, mockUserCourses, mockProjects, mockUserAchievements } from '@/data/mockUser';
import { checkNewAchievements } from '@/engine/achievementChecker';
import { getDataProvider, isRealBackend, type UserProfile, type UnsubscribeFn } from '@/services/backend';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface UserState {
  // User data
  user: User | null;
  userSkills: UserSkill[];
  careerGoals: CareerGoal[];
  userCourses: UserCourse[];
  projects: Project[];
  userAchievements: UserAchievement[];

  // UI state
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  // Sync state
  syncStatus: SyncStatus;
  syncError: string | null;
  currentUserId: string | null;

  // Actions
  setUser: (user: User) => void;
  loadMockUser: () => void;
  clearUser: () => void;

  // Skill actions
  updateSkillLevel: (skillId: string, level: SkillLevel) => void;
  addSkill: (skillId: string, level: SkillLevel, evidenceType?: string) => void;
  removeSkill: (skillId: string) => void;

  // Goal actions
  setCareerGoal: (roleId: string, timeframe: 'short' | 'long') => void;
  removeCareerGoal: (goalId: string) => void;

  // Course actions
  addCourse: (courseId: string) => void;
  updateCourseStatus: (courseId: string, status: 'planned' | 'in_progress' | 'completed') => void;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;

  // Onboarding
  completeOnboarding: (data: OnboardingData) => void;

  // Sync methods
  initializeSync: (userId: string) => void;
  cleanupSync: () => void;
}

// Store unsubscribe functions for cleanup
let unsubscribeFunctions: UnsubscribeFn[] = [];

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  userSkills: [],
  careerGoals: [],
  userCourses: [],
  projects: [],
  userAchievements: [],
  isLoading: false,
  hasCompletedOnboarding: false,
  syncStatus: 'idle',
  syncError: null,
  currentUserId: null,

  setUser: (user) => set({ user }),

  loadMockUser: () => {
    set({
      user: mockUser,
      userSkills: mockUserSkills,
      careerGoals: mockCareerGoals,
      userCourses: mockUserCourses,
      projects: mockProjects,
      userAchievements: mockUserAchievements,
      hasCompletedOnboarding: mockUser.hasCompletedOnboarding,
    });
  },

  clearUser: () => {
    set({
      user: null,
      userSkills: [],
      careerGoals: [],
      userCourses: [],
      projects: [],
      userAchievements: [],
      hasCompletedOnboarding: false,
      syncStatus: 'idle',
      syncError: null,
      currentUserId: null,
    });
  },

  updateSkillLevel: (skillId, level) => {
    const { userSkills, userAchievements, currentUserId } = get();

    const existingSkill = userSkills.find(skill => skill.skillId === skillId);
    if (!existingSkill) {
      console.warn('[Sync] Cannot update skill level - skill not found:', skillId);
      return;
    }

    const updatedSkill = { ...existingSkill, level, updatedAt: new Date() };
    const updatedSkills = userSkills.map(skill =>
      skill.skillId === skillId ? updatedSkill : skill
    );

    // Check for new achievements
    const newAchievements = checkNewAchievements(updatedSkills, userAchievements);
    const newUserAchievements: UserAchievement[] = newAchievements.map(a => ({
      id: `ua_${Date.now()}_${a.id}`,
      achievementId: a.id,
      earnedAt: new Date(),
    }));

    set({
      userSkills: updatedSkills,
      userAchievements: [...userAchievements, ...newUserAchievements],
    });

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      set({ syncStatus: 'syncing' });
      const dataProvider = getDataProvider();

      dataProvider.setSkill(currentUserId, updatedSkill)
        .then(() => {
          console.log('[Sync] Skill level updated in Firebase:', skillId, level);
          set({ syncStatus: 'synced', syncError: null });
        })
        .catch((error) => {
          console.error('[Sync] Failed to update skill level in Firebase:', error);
          set({ syncStatus: 'error', syncError: error.message || 'Failed to sync skill update' });
        });

      // Sync achievements
      newUserAchievements.forEach(a => {
        dataProvider.setAchievement(currentUserId, a).catch((error) => {
          console.error('[Sync] Failed to sync achievement:', error);
        });
      });
    } else {
      console.warn('[Sync] Cannot sync skill update - not logged in or backend not ready', {
        isRealBackend: isRealBackend(),
        currentUserId,
      });
    }
  },

  addSkill: (skillId, level, evidenceType) => {
    const { userSkills, userAchievements, currentUserId } = get();

    console.log('[addSkill] Called with:', { skillId, level, evidenceType, currentUserId, isRealBackend: isRealBackend() });

    // Check if skill already exists
    const existingSkill = userSkills.find(s => s.skillId === skillId);
    if (existingSkill) {
      console.log('[addSkill] Skill already exists, updating level instead:', existingSkill);
      get().updateSkillLevel(skillId, level);
      return;
    }

    const newSkill: UserSkill = {
      id: `us_${Date.now()}`,
      skillId,
      level,
      source: 'self_reported',
      evidenceType: (evidenceType || 'self_assessed') as UserSkill['evidenceType'],
      updatedAt: new Date(),
    };

    console.log('[addSkill] Creating new skill:', newSkill);

    const updatedSkills = [...userSkills, newSkill];

    // Check for new achievements
    const newAchievements = checkNewAchievements(updatedSkills, userAchievements);
    const newUserAchievements: UserAchievement[] = newAchievements.map(a => ({
      id: `ua_${Date.now()}_${a.id}`,
      achievementId: a.id,
      earnedAt: new Date(),
    }));

    set({
      userSkills: updatedSkills,
      userAchievements: [...userAchievements, ...newUserAchievements],
    });

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      console.log('[addSkill] Syncing to Firebase...');
      set({ syncStatus: 'syncing' });
      const dataProvider = getDataProvider();

      // Sync skill to Firebase
      dataProvider.setSkill(currentUserId, newSkill)
        .then(() => {
          console.log('[Sync] Skill added to Firebase:', skillId);
          set({ syncStatus: 'synced', syncError: null });
        })
        .catch((error) => {
          console.error('[Sync] Failed to add skill to Firebase:', error);
          set({ syncStatus: 'error', syncError: error.message || 'Failed to sync skill' });
        });

      // Sync achievements
      newUserAchievements.forEach(a => {
        dataProvider.setAchievement(currentUserId, a).catch((error) => {
          console.error('[Sync] Failed to sync achievement:', error);
        });
      });
    } else {
      console.warn('[addSkill] Cannot sync - not logged in or backend not ready', {
        isRealBackend: isRealBackend(),
        currentUserId,
      });
    }
  },

  removeSkill: (skillId) => {
    const { userSkills, currentUserId } = get();
    const skill = userSkills.find(s => s.skillId === skillId);

    if (!skill) {
      console.warn('[Sync] Cannot remove skill - skill not found:', skillId);
      return;
    }

    set(state => ({
      userSkills: state.userSkills.filter(s => s.skillId !== skillId),
    }));

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      set({ syncStatus: 'syncing' });
      const dataProvider = getDataProvider();

      dataProvider.deleteSkill(currentUserId, skill.id)
        .then(() => {
          console.log('[Sync] Skill removed from Firebase:', skillId);
          set({ syncStatus: 'synced', syncError: null });
        })
        .catch((error) => {
          console.error('[Sync] Failed to remove skill from Firebase:', error);
          set({ syncStatus: 'error', syncError: error.message || 'Failed to sync skill removal' });
        });
    } else {
      console.warn('[Sync] Cannot sync skill removal - not logged in or backend not ready', {
        isRealBackend: isRealBackend(),
        currentUserId,
      });
    }
  },

  setCareerGoal: (roleId, timeframe) => {
    const { careerGoals, currentUserId } = get();

    // Remove existing goal with same timeframe
    const filteredGoals = careerGoals.filter(g => g.timeframe !== timeframe);
    const removedGoal = careerGoals.find(g => g.timeframe === timeframe);

    const newGoal: CareerGoal = {
      id: `cg_${Date.now()}`,
      targetRoleId: roleId,
      timeframe,
      priority: timeframe === 'long' ? 1 : 2,
      createdAt: new Date(),
    };

    set({ careerGoals: [...filteredGoals, newGoal] });

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      const dataProvider = getDataProvider();
      if (removedGoal) {
        dataProvider.deleteCareerGoal(currentUserId, removedGoal.id).catch(console.error);
      }
      dataProvider.setCareerGoal(currentUserId, newGoal).catch(console.error);
    }
  },

  removeCareerGoal: (goalId) => {
    const { currentUserId } = get();

    set(state => ({
      careerGoals: state.careerGoals.filter(g => g.id !== goalId),
    }));

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      const dataProvider = getDataProvider();
      dataProvider.deleteCareerGoal(currentUserId, goalId).catch(console.error);
    }
  },

  addCourse: (courseId) => {
    const { userCourses, currentUserId } = get();

    if (userCourses.find(c => c.courseId === courseId)) return;

    const newCourse: UserCourse = {
      id: `uc_${Date.now()}`,
      courseId,
      status: 'planned',
    };

    set({ userCourses: [...userCourses, newCourse] });

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      const dataProvider = getDataProvider();
      dataProvider.setCourse(currentUserId, newCourse).catch(console.error);
    }
  },

  updateCourseStatus: (courseId, status) => {
    const { userCourses, currentUserId } = get();
    const course = userCourses.find(c => c.courseId === courseId);

    const updatedCourse = course
      ? { ...course, status, completedAt: status === 'completed' ? new Date() : undefined }
      : null;

    set(state => ({
      userCourses: state.userCourses.map(c =>
        c.courseId === courseId
          ? { ...c, status, completedAt: status === 'completed' ? new Date() : undefined }
          : c
      ),
    }));

    // Sync to Firebase
    if (isRealBackend() && currentUserId && updatedCourse) {
      const dataProvider = getDataProvider();
      dataProvider.setCourse(currentUserId, updatedCourse).catch(console.error);
    }
  },

  addProject: (projectData) => {
    const { currentUserId } = get();

    const newProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      createdAt: new Date(),
    };

    set(state => ({ projects: [...state.projects, newProject] }));

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      const dataProvider = getDataProvider();
      dataProvider.setProject(currentUserId, newProject).catch(console.error);
    }
  },

  completeOnboarding: (data) => {
    const { user, currentUserId } = get();

    // Create user skills from onboarding data
    const newSkills: UserSkill[] = data.skills.map((s, index) => ({
      id: `us_onboard_${index}`,
      skillId: s.skillId,
      level: s.level,
      source: 'self_reported' as const,
      updatedAt: new Date(),
    }));

    // Create career goals
    const goals: CareerGoal[] = [];
    if (data.shortTermGoal) {
      goals.push({
        id: 'cg_short',
        targetRoleId: data.shortTermGoal,
        timeframe: 'short',
        priority: 2,
        createdAt: new Date(),
      });
    }
    if (data.longTermGoal) {
      goals.push({
        id: 'cg_long',
        targetRoleId: data.longTermGoal,
        timeframe: 'long',
        priority: 1,
        createdAt: new Date(),
      });
    }

    // Create projects from onboarding
    const newProjects: Project[] = data.projects.map((p, index) => ({
      id: `proj_onboard_${index}`,
      title: p.title,
      description: p.description,
      skillsDemonstrated: p.skills,
      createdAt: new Date(),
    }));

    // Create or update user - handle case where user is null for new users
    const now = new Date();
    const updatedUser: User = user
      ? { ...user, stage: data.stage, hasCompletedOnboarding: true, updatedAt: now }
      : {
          id: currentUserId || `user_${Date.now()}`,
          email: '',
          name: 'User',
          stage: data.stage,
          hasCompletedOnboarding: true,
          createdAt: now,
          updatedAt: now,
        };

    set({
      user: updatedUser,
      userSkills: newSkills,
      careerGoals: goals,
      projects: newProjects,
      hasCompletedOnboarding: true,
    });

    // Sync to Firebase
    if (isRealBackend() && currentUserId) {
      const dataProvider = getDataProvider();

      // Update user profile - always update since we have a valid user now
      const profile: UserProfile = {
        email: updatedUser.email,
        name: updatedUser.name,
        stage: updatedUser.stage,
        hasCompletedOnboarding: true,
        createdAt: updatedUser.createdAt,
        updatedAt: now,
      };
      dataProvider.setUserProfile(currentUserId, profile).catch(console.error);

      // Sync skills
      newSkills.forEach(skill => {
        dataProvider.setSkill(currentUserId, skill).catch(console.error);
      });

      // Sync goals
      goals.forEach(goal => {
        dataProvider.setCareerGoal(currentUserId, goal).catch(console.error);
      });

      // Sync projects
      newProjects.forEach(project => {
        dataProvider.setProject(currentUserId, project).catch(console.error);
      });
    }
  },

  initializeSync: (userId: string) => {
    if (!isRealBackend()) {
      return;
    }

    const { currentUserId } = get();

    // Don't re-initialize if already syncing for this user
    if (currentUserId === userId) {
      return;
    }

    // Cleanup any existing subscriptions
    get().cleanupSync();

    set({ isLoading: true, syncStatus: 'syncing', currentUserId: userId });

    const dataProvider = getDataProvider();

    // Subscribe to user profile
    const unsubProfile = dataProvider.subscribeToUserProfile(userId, (profile) => {
      if (profile) {
        set({
          user: {
            id: userId,
            email: profile.email,
            name: profile.name,
            stage: profile.stage,
            hasCompletedOnboarding: profile.hasCompletedOnboarding,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          },
          hasCompletedOnboarding: profile.hasCompletedOnboarding,
          isLoading: false,
          syncStatus: 'synced',
        });
      } else {
        set({ isLoading: false, syncStatus: 'synced' });
      }
    });

    // Subscribe to skills
    const unsubSkills = dataProvider.subscribeToSkills(userId, (skills) => {
      set({ userSkills: skills });
    });

    // Subscribe to career goals
    const unsubGoals = dataProvider.subscribeToCareerGoals(userId, (goals) => {
      set({ careerGoals: goals });
    });

    // Subscribe to courses
    const unsubCourses = dataProvider.subscribeToCourses(userId, (courses) => {
      set({ userCourses: courses });
    });

    // Subscribe to projects
    const unsubProjects = dataProvider.subscribeToProjects(userId, (projects) => {
      set({ projects: projects });
    });

    // Subscribe to achievements
    const unsubAchievements = dataProvider.subscribeToAchievements(userId, (achievements) => {
      set({ userAchievements: achievements });
    });

    // Store unsubscribe functions
    unsubscribeFunctions = [
      unsubProfile,
      unsubSkills,
      unsubGoals,
      unsubCourses,
      unsubProjects,
      unsubAchievements,
    ];
  },

  cleanupSync: () => {
    // Unsubscribe from all listeners
    unsubscribeFunctions.forEach(unsub => unsub());
    unsubscribeFunctions = [];

    // Clear user data
    set({
      user: null,
      userSkills: [],
      careerGoals: [],
      userCourses: [],
      projects: [],
      userAchievements: [],
      hasCompletedOnboarding: false,
      syncStatus: 'idle',
      syncError: null,
      currentUserId: null,
    });
  },
}));
