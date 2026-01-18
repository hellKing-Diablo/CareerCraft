import { UserSkill, RoleBenchmark, SkillGap, GapAnalysisResult, SkillLevel } from '@/types';
import { getSkillById } from '@/data/skillOntology';

/**
 * Gap Analysis Engine
 *
 * This is DETERMINISTIC CODE - not LLM.
 * Compares user skills against role requirements.
 * Produces structured gap data for UI and LLM explanation.
 */

/**
 * Compute skill gaps between user skills and role requirements
 */
export function computeSkillGaps(
  userSkills: UserSkill[],
  roleBenchmark: RoleBenchmark
): SkillGap[] {
  return roleBenchmark.requiredSkills.map(requirement => {
    const userSkill = userSkills.find(s => s.skillId === requirement.skillId);
    const currentLevel = userSkill?.level ?? 0;
    const gap = requirement.minimumLevel - currentLevel;
    const skill = getSkillById(requirement.skillId);

    return {
      skillId: requirement.skillId,
      skillName: skill?.name ?? requirement.skillId,
      currentLevel: currentLevel as SkillLevel,
      requiredLevel: requirement.minimumLevel as SkillLevel,
      gap: Math.max(0, gap),
      priority: requirement.priority,
      status: gap <= 0 ? 'met' : gap <= 1 ? 'close' : 'gap',
    };
  });
}

/**
 * Separate gaps into actual gaps and strengths
 */
export function categorizeGaps(gaps: SkillGap[]): {
  gaps: SkillGap[];
  strengths: SkillGap[];
} {
  return {
    gaps: gaps.filter(g => g.status !== 'met').sort((a, b) => {
      // Sort by priority first, then by gap size
      const priorityOrder = { critical: 0, important: 1, nice_to_have: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.gap - a.gap;
    }),
    strengths: gaps.filter(g => g.status === 'met').sort((a, b) => {
      // Sort by how much they exceed requirements
      const aExcess = a.currentLevel - a.requiredLevel;
      const bExcess = b.currentLevel - b.requiredLevel;
      return bExcess - aExcess;
    }),
  };
}

/**
 * Perform full gap analysis
 */
export function analyzeGaps(
  userSkills: UserSkill[],
  roleBenchmark: RoleBenchmark
): GapAnalysisResult {
  const allGaps = computeSkillGaps(userSkills, roleBenchmark);
  const { gaps, strengths } = categorizeGaps(allGaps);
  const readinessScore = computeReadinessScore(allGaps);

  return {
    gaps,
    strengths,
    readinessScore,
    targetRole: roleBenchmark,
  };
}

/**
 * Compute overall readiness score (0-100)
 *
 * Weighted by priority:
 * - Critical skills: 3x weight
 * - Important skills: 2x weight
 * - Nice to have: 1x weight
 */
export function computeReadinessScore(gaps: SkillGap[]): number {
  if (gaps.length === 0) return 100;

  const weights = { critical: 3, important: 2, nice_to_have: 1 };

  let totalWeightedRequired = 0;
  let totalWeightedAchieved = 0;

  for (const gap of gaps) {
    const weight = weights[gap.priority];
    totalWeightedRequired += gap.requiredLevel * weight;
    // Cap current level at required level for scoring
    const effectiveLevel = Math.min(gap.currentLevel, gap.requiredLevel);
    totalWeightedAchieved += effectiveLevel * weight;
  }

  if (totalWeightedRequired === 0) return 100;

  return Math.round((totalWeightedAchieved / totalWeightedRequired) * 100);
}

/**
 * Get critical gaps that need immediate attention
 */
export function getCriticalGaps(gaps: SkillGap[]): SkillGap[] {
  return gaps.filter(g => g.priority === 'critical' && g.status === 'gap');
}

/**
 * Get skills that are close to being met (gap of 1)
 */
export function getAlmostThereSkills(gaps: SkillGap[]): SkillGap[] {
  return gaps.filter(g => g.status === 'close');
}

/**
 * Calculate estimated time to close all gaps
 * Based on skill estimated hours and gap size
 */
export function estimateTimeToReady(gaps: SkillGap[]): number {
  let totalHours = 0;

  for (const gap of gaps) {
    if (gap.gap > 0) {
      const skill = getSkillById(gap.skillId);
      if (skill) {
        // Estimate hours per level as fraction of total skill hours
        const hoursPerLevel = skill.estimatedHours / 5;
        totalHours += hoursPerLevel * gap.gap;
      }
    }
  }

  return Math.round(totalHours);
}
