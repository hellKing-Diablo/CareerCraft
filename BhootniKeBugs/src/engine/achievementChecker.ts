import { Achievement, UserSkill, UserAchievement } from '@/types';
import { achievements } from '@/data/achievements';
import { computeReadinessScore, computeSkillGaps } from './gapAnalysis';
import { getRoleById } from '@/data/roleBenchmarks';

/**
 * Achievement Checker
 *
 * DETERMINISTIC CODE - checks if user has earned achievements
 * based on their skill progress.
 */

/**
 * Check if a single achievement criteria is met
 */
export function checkAchievementCriteria(
  achievement: Achievement,
  userSkills: UserSkill[]
): boolean {
  const { criteria } = achievement;

  switch (criteria.type) {
    case 'skill_level': {
      // Check if user has reached required level in specific skill
      const userSkill = userSkills.find(s => s.skillId === criteria.skillId);
      return (userSkill?.level ?? 0) >= (criteria.requiredLevel ?? 0);
    }

    case 'skills_count': {
      // Check if user has required number of skills at required level
      const qualifyingSkills = userSkills.filter(
        s => s.level >= (criteria.requiredLevel ?? 1)
      );
      return qualifyingSkills.length >= (criteria.requiredCount ?? 0);
    }

    case 'role_ready': {
      // Check if user meets all requirements for a role
      if (!criteria.roleId) return false;
      const role = getRoleById(criteria.roleId);
      if (!role) return false;

      const gaps = computeSkillGaps(userSkills, role);
      const readiness = computeReadinessScore(gaps);

      // User is ready if they have 100% readiness
      return readiness >= 100;
    }

    default:
      return false;
  }
}

/**
 * Get all earned achievements for a user
 */
export function getEarnedAchievements(
  userSkills: UserSkill[],
  existingAchievements: UserAchievement[]
): Achievement[] {
  const earnedIds = new Set(existingAchievements.map(a => a.achievementId));

  return achievements.filter(achievement => {
    // Already earned
    if (earnedIds.has(achievement.id)) return true;

    // Check if newly earned
    return checkAchievementCriteria(achievement, userSkills);
  });
}

/**
 * Check for newly earned achievements
 * Returns achievements that were just earned (not previously earned)
 */
export function checkNewAchievements(
  userSkills: UserSkill[],
  existingAchievements: UserAchievement[]
): Achievement[] {
  const earnedIds = new Set(existingAchievements.map(a => a.achievementId));

  return achievements.filter(achievement => {
    // Skip if already earned
    if (earnedIds.has(achievement.id)) return false;

    // Check if criteria is now met
    return checkAchievementCriteria(achievement, userSkills);
  });
}

/**
 * Get progress toward an achievement
 */
export function getAchievementProgress(
  achievement: Achievement,
  userSkills: UserSkill[]
): { current: number; required: number; percent: number } {
  const { criteria } = achievement;

  switch (criteria.type) {
    case 'skill_level': {
      const userSkill = userSkills.find(s => s.skillId === criteria.skillId);
      const current = userSkill?.level ?? 0;
      const required = criteria.requiredLevel ?? 0;
      return {
        current,
        required,
        percent: Math.min(100, Math.round((current / required) * 100)),
      };
    }

    case 'skills_count': {
      const qualifyingSkills = userSkills.filter(
        s => s.level >= (criteria.requiredLevel ?? 1)
      );
      const current = qualifyingSkills.length;
      const required = criteria.requiredCount ?? 0;
      return {
        current,
        required,
        percent: required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100,
      };
    }

    case 'role_ready': {
      if (!criteria.roleId) return { current: 0, required: 100, percent: 0 };
      const role = getRoleById(criteria.roleId);
      if (!role) return { current: 0, required: 100, percent: 0 };

      const gaps = computeSkillGaps(userSkills, role);
      const readiness = computeReadinessScore(gaps);

      return {
        current: readiness,
        required: 100,
        percent: readiness,
      };
    }

    default:
      return { current: 0, required: 0, percent: 0 };
  }
}

/**
 * Get upcoming achievements (partially completed)
 */
export function getUpcomingAchievements(
  userSkills: UserSkill[],
  existingAchievements: UserAchievement[]
): Array<Achievement & { progress: { current: number; required: number; percent: number } }> {
  const earnedIds = new Set(existingAchievements.map(a => a.achievementId));

  return achievements
    .filter(achievement => {
      // Not earned yet
      if (earnedIds.has(achievement.id)) return false;

      // Has some progress
      const progress = getAchievementProgress(achievement, userSkills);
      return progress.percent > 0 && progress.percent < 100;
    })
    .map(achievement => ({
      ...achievement,
      progress: getAchievementProgress(achievement, userSkills),
    }))
    .sort((a, b) => b.progress.percent - a.progress.percent);
}

/**
 * Get all achievements with their status
 */
export function getAllAchievementsWithStatus(
  userSkills: UserSkill[],
  existingAchievements: UserAchievement[]
): Array<Achievement & { earned: boolean; earnedAt?: Date; progress: { current: number; required: number; percent: number } }> {
  const earnedMap = new Map(existingAchievements.map(a => [a.achievementId, a]));

  return achievements.map(achievement => {
    const earned = earnedMap.get(achievement.id);
    const progress = getAchievementProgress(achievement, userSkills);

    return {
      ...achievement,
      earned: !!earned || progress.percent >= 100,
      earnedAt: earned?.earnedAt,
      progress,
    };
  });
}
