/**
 * Career Data Types
 * Types for domains and skills used throughout the application
 */

export interface Domain {
  id: string;
  domain: string;
  category: string;
  jobs: string[];
}

export interface Skill {
  id: string;
  skillName: string;
  skillLevel: 1 | 2 | 3 | 4 | 5; // 1 = Beginner, 5 = Expert
  jobs: string[];
  domain: string[];
  time: string; // Time to learn/master
  category: string;
}

export interface UserSkillProgress {
  skillId: string;
  currentLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0 = Not learned yet
  startedAt?: Date;
  completedAt?: Date;
  lastUpdated: Date;
}

export interface CareerPath {
  id: string;
  userId: string;
  domain: string;
  targetJob: string;
  skills: UserSkillProgress[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserCareerProfile {
  userId: string;
  position: 'beginner' | 'student' | 'professional';
  primaryCareerPath: string; // ID of primary career path
  careerPaths: CareerPath[];
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Skill level descriptions
export const SKILL_LEVELS = {
  0: { label: 'Not Learned', description: 'Have not started learning this skill' },
  1: { label: 'Beginner', description: 'Basic understanding, just started' },
  2: { label: 'Elementary', description: 'Can perform basic tasks with guidance' },
  3: { label: 'Intermediate', description: 'Can work independently on standard tasks' },
  4: { label: 'Advanced', description: 'Can handle complex tasks and mentor others' },
  5: { label: 'Expert', description: 'Deep expertise, can lead and innovate' },
} as const;

// Position descriptions
export const POSITIONS = {
  beginner: { label: 'Beginner', description: 'New to the field, exploring options' },
  student: { label: 'Student', description: 'Currently studying or in training' },
  professional: { label: 'Working Professional', description: 'Already working in the industry' },
} as const;
