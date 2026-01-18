import { Achievement } from '@/types';

/**
 * Achievement Definitions
 *
 * Achievements serve as:
 * - Proof of progression
 * - Signals for readiness
 * - Motivation markers
 */
export const achievements: Achievement[] = [
  // ============================================
  // SKILL MASTERY ACHIEVEMENTS
  // ============================================
  {
    id: 'first_skill',
    name: 'First Steps',
    description: 'Reached level 2 in your first skill',
    type: 'skill_mastery',
    criteria: {
      type: 'skills_count',
      requiredCount: 1,
      requiredLevel: 2,
    },
    badgeIcon: 'Footprints',
  },
  {
    id: 'python_intermediate',
    name: 'Python Practitioner',
    description: 'Reached intermediate level in Python',
    type: 'skill_mastery',
    criteria: {
      type: 'skill_level',
      skillId: 'python_basics',
      requiredLevel: 3,
    },
    badgeIcon: 'Code',
  },
  {
    id: 'python_advanced',
    name: 'Python Expert',
    description: 'Mastered Python programming',
    type: 'skill_mastery',
    criteria: {
      type: 'skill_level',
      skillId: 'python_basics',
      requiredLevel: 5,
    },
    badgeIcon: 'Rocket',
  },
  {
    id: 'data_explorer',
    name: 'Data Explorer',
    description: 'Reached level 3 in data analysis skills',
    type: 'skill_mastery',
    criteria: {
      type: 'skill_level',
      skillId: 'python_data',
      requiredLevel: 3,
    },
    badgeIcon: 'Search',
  },
  {
    id: 'compliance_aware',
    name: 'Compliance Champion',
    description: 'Completed HIPAA compliance training',
    type: 'skill_mastery',
    criteria: {
      type: 'skill_level',
      skillId: 'hipaa_compliance',
      requiredLevel: 2,
    },
    badgeIcon: 'Shield',
  },
  {
    id: 'clinical_expert',
    name: 'Clinical Data Expert',
    description: 'Mastered clinical data fundamentals',
    type: 'skill_mastery',
    criteria: {
      type: 'skill_level',
      skillId: 'clinical_data',
      requiredLevel: 4,
    },
    badgeIcon: 'Stethoscope',
  },
  {
    id: 'ml_practitioner',
    name: 'ML Practitioner',
    description: 'Achieved competency in machine learning',
    type: 'skill_mastery',
    criteria: {
      type: 'skill_level',
      skillId: 'ml_fundamentals',
      requiredLevel: 3,
    },
    badgeIcon: 'Brain',
  },

  // ============================================
  // MILESTONE ACHIEVEMENTS
  // ============================================
  {
    id: 'foundation_complete',
    name: 'Foundation Builder',
    description: 'Completed all Tier 1 foundational skills',
    type: 'milestone',
    criteria: {
      type: 'skills_count',
      requiredCount: 5,
      requiredLevel: 2,
    },
    badgeIcon: 'Building',
  },
  {
    id: 'skill_collector_5',
    name: 'Skill Collector',
    description: 'Learned 5 different skills',
    type: 'milestone',
    criteria: {
      type: 'skills_count',
      requiredCount: 5,
      requiredLevel: 1,
    },
    badgeIcon: 'Boxes',
  },
  {
    id: 'skill_collector_10',
    name: 'Skill Enthusiast',
    description: 'Learned 10 different skills',
    type: 'milestone',
    criteria: {
      type: 'skills_count',
      requiredCount: 10,
      requiredLevel: 1,
    },
    badgeIcon: 'Trophy',
  },
  {
    id: 'skill_master_5',
    name: 'Skill Master',
    description: 'Mastered 5 skills to level 4 or higher',
    type: 'milestone',
    criteria: {
      type: 'skills_count',
      requiredCount: 5,
      requiredLevel: 4,
    },
    badgeIcon: 'Crown',
  },

  // ============================================
  // ROLE READINESS ACHIEVEMENTS
  // ============================================
  {
    id: 'analyst_ready',
    name: 'Analyst Ready',
    description: 'Met all requirements for Health Data Analyst',
    type: 'milestone',
    criteria: {
      type: 'role_ready',
      roleId: 'health_data_analyst',
    },
    badgeIcon: 'BarChart',
  },
  {
    id: 'informatics_ready',
    name: 'Informatics Ready',
    description: 'Met all requirements for Health Informatics Specialist',
    type: 'milestone',
    criteria: {
      type: 'role_ready',
      roleId: 'health_informatics_specialist',
    },
    badgeIcon: 'Lightbulb',
  },
  {
    id: 'data_scientist_ready',
    name: 'Data Scientist Ready',
    description: 'Met all requirements for Clinical Data Scientist',
    type: 'milestone',
    criteria: {
      type: 'role_ready',
      roleId: 'clinical_data_scientist',
    },
    badgeIcon: 'Sparkles',
  },
  {
    id: 'ai_engineer_ready',
    name: 'AI Engineer Ready',
    description: 'Met all requirements for Medical AI Engineer',
    type: 'milestone',
    criteria: {
      type: 'role_ready',
      roleId: 'medical_ai_engineer',
    },
    badgeIcon: 'Cpu',
  },

  // ============================================
  // SPECIAL ACHIEVEMENTS
  // ============================================
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined CareerCraft in its early days',
    type: 'special',
    criteria: {
      type: 'skills_count',
      requiredCount: 0,
    },
    badgeIcon: 'Star',
  },
  {
    id: 'healthcare_pioneer',
    name: 'Healthcare Pioneer',
    description: 'Completed both technical and domain skills in healthcare',
    type: 'special',
    criteria: {
      type: 'skills_count',
      requiredCount: 3,
      requiredLevel: 3,
    },
    badgeIcon: 'Heart',
  },
];

// Helper function to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}

// Helper function to get achievements by type
export function getAchievementsByType(type: string): Achievement[] {
  return achievements.filter(a => a.type === type);
}
