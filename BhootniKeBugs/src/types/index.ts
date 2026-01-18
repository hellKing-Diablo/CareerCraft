// ============================================
// USER TYPES
// ============================================
export type UserStage = 'beginner' | 'student' | 'professional' | 'switcher';

export interface User {
  id: string;
  email: string;
  name: string;
  stage: UserStage;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SKILL TYPES
// ============================================
export type SkillCategory = 'technical' | 'domain' | 'soft' | 'certification';
export type SkillDomain = 'healthcare_tech';
export type SkillTier = 1 | 2 | 3 | 4 | 5;
export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5; // 0=none, 5=expert

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  domain: SkillDomain;
  description: string;
  prerequisites: string[]; // Skill IDs
  estimatedHours: number;
  tier: SkillTier;
  icon?: string;
}

export type SkillSource = 'self_reported' | 'llm_extracted' | 'verified';
export type EvidenceType = 'course' | 'project' | 'certification' | 'experience';

export interface UserSkill {
  id: string;
  skillId: string;
  level: SkillLevel;
  source: SkillSource;
  evidenceType?: EvidenceType;
  evidenceId?: string;
  updatedAt: Date;
}

// ============================================
// ROLE & CAREER TYPES
// ============================================
export type SkillPriority = 'critical' | 'important' | 'nice_to_have';
export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'lead';

export interface RoleSkillRequirement {
  skillId: string;
  minimumLevel: SkillLevel;
  priority: SkillPriority;
}

export interface RoleBenchmark {
  id: string;
  roleName: string;
  domain: SkillDomain;
  requiredSkills: RoleSkillRequirement[];
  seniorityLevel: SeniorityLevel;
  description: string;
  icon?: string;
}

export type GoalTimeframe = 'short' | 'long';

export interface CareerGoal {
  id: string;
  targetRoleId: string;
  timeframe: GoalTimeframe;
  priority: number;
  createdAt: Date;
}

// ============================================
// COURSE & PROJECT TYPES
// ============================================
export type CourseProvider = 'coursera' | 'udemy' | 'internal' | 'other';
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'planned' | 'in_progress' | 'completed';

export interface Course {
  id: string;
  title: string;
  provider: CourseProvider;
  url?: string;
  skillsCovered: string[];
  estimatedHours: number;
  difficulty: CourseDifficulty;
}

export interface UserCourse {
  id: string;
  courseId: string;
  status: CourseStatus;
  completedAt?: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skillsDemonstrated: string[];
  url?: string;
  createdAt: Date;
}

// ============================================
// ACHIEVEMENT TYPES
// ============================================
export type AchievementType = 'skill_mastery' | 'milestone' | 'streak' | 'special';

export interface AchievementCriteria {
  type: 'skill_level' | 'skills_count' | 'role_ready';
  skillId?: string;
  requiredLevel?: number;
  requiredCount?: number;
  roleId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  criteria: AchievementCriteria;
  badgeIcon: string;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  earnedAt: Date;
}

// ============================================
// SKILL FLOW GRAPH TYPES
// ============================================
export type NodeState = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface SkillNode {
  id: string;
  skillId: string;
  position: { x: number; y: number };
  state: NodeState;
  completionPercent: number;
  tier: SkillTier;
}

export type EdgeType = 'prerequisite' | 'recommended' | 'progression';

export interface SkillEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
}

export interface UserSkillGraph {
  targetRoleId: string;
  nodes: SkillNode[];
  edges: SkillEdge[];
  generatedAt: Date;
}

// ============================================
// PROGRESS & ANALYTICS TYPES
// ============================================
export interface ProgressSnapshot {
  id: string;
  timestamp: Date;
  overallReadiness: number;
  skillLevels: Record<string, SkillLevel>;
  targetRoleId: string;
  gapsCount: number;
}

// ============================================
// GAP ANALYSIS TYPES
// ============================================
export type GapStatus = 'met' | 'close' | 'gap';

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  gap: number;
  priority: SkillPriority;
  status: GapStatus;
}

export interface GapAnalysisResult {
  gaps: SkillGap[];
  strengths: SkillGap[];
  readinessScore: number;
  targetRole: RoleBenchmark;
}

// ============================================
// CONNECTION TYPES (Mock)
// ============================================
export interface Connection {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  sharedSkills: string[];
  relevanceScore: number;
}

// ============================================
// ONBOARDING TYPES
// ============================================
export interface OnboardingData {
  stage: UserStage;
  skills: { skillId: string; level: SkillLevel }[];
  courses: string[];
  projects: { title: string; description: string; skills: string[] }[];
  achievements: string[];
  shortTermGoal: string;
  longTermGoal: string;
}
