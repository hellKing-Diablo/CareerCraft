import { Skill, UserSkill, NodeState, SkillLevel } from '@/types';

/**
 * Node State Computer
 *
 * DETERMINISTIC CODE - computes the visual state of each skill node
 * based on user progress and prerequisites.
 */

/**
 * Compute the state of a single skill node
 */
export function computeNodeState(
  skill: Skill,
  userSkills: UserSkill[],
  _allSkillsMap: Map<string, Skill>
): NodeState {
  const userSkill = userSkills.find(s => s.skillId === skill.id);
  const userLevel = userSkill?.level ?? 0;

  // Check if all prerequisites are met (level 2 or higher)
  const prereqsMet = skill.prerequisites.every(prereqId => {
    const prereqUserSkill = userSkills.find(s => s.skillId === prereqId);
    return prereqUserSkill && prereqUserSkill.level >= 2;
  });

  // Node is locked if prerequisites aren't met
  if (!prereqsMet && skill.prerequisites.length > 0) {
    return 'locked';
  }

  // Node is completed if user has level 3 or higher
  if (userLevel >= 3) {
    return 'completed';
  }

  // Node is in progress if user has started (level 1-2)
  if (userLevel >= 1) {
    return 'in_progress';
  }

  // Node is unlocked but not started
  return 'unlocked';
}

/**
 * Compute completion percentage for a node
 * Based on level (0-5) mapped to percentage
 */
export function computeCompletionPercent(
  skillId: string,
  userSkills: UserSkill[],
  targetLevel: SkillLevel = 3 // Default target for "completed"
): number {
  const userSkill = userSkills.find(s => s.skillId === skillId);
  const currentLevel = userSkill?.level ?? 0;

  if (currentLevel >= targetLevel) {
    return 100;
  }

  return Math.round((currentLevel / targetLevel) * 100);
}

/**
 * Get all unlockable skills (prerequisites met, not yet started)
 */
export function getUnlockableSkills(
  skills: Skill[],
  userSkills: UserSkill[]
): Skill[] {
  const skillsMap = new Map(skills.map(s => [s.id, s]));

  return skills.filter(skill => {
    const state = computeNodeState(skill, userSkills, skillsMap);
    return state === 'unlocked';
  });
}

/**
 * Get skills that are currently locked
 */
export function getLockedSkills(
  skills: Skill[],
  userSkills: UserSkill[]
): Skill[] {
  const skillsMap = new Map(skills.map(s => [s.id, s]));

  return skills.filter(skill => {
    const state = computeNodeState(skill, userSkills, skillsMap);
    return state === 'locked';
  });
}

/**
 * Get skills that are in progress
 */
export function getInProgressSkills(
  skills: Skill[],
  userSkills: UserSkill[]
): Skill[] {
  const skillsMap = new Map(skills.map(s => [s.id, s]));

  return skills.filter(skill => {
    const state = computeNodeState(skill, userSkills, skillsMap);
    return state === 'in_progress';
  });
}

/**
 * Get completed skills
 */
export function getCompletedSkills(
  skills: Skill[],
  userSkills: UserSkill[]
): Skill[] {
  const skillsMap = new Map(skills.map(s => [s.id, s]));

  return skills.filter(skill => {
    const state = computeNodeState(skill, userSkills, skillsMap);
    return state === 'completed';
  });
}

/**
 * Check if a skill would be unlocked if another skill reaches a certain level
 */
export function wouldUnlock(
  targetSkill: Skill,
  ifSkillId: string,
  ifLevel: SkillLevel,
  userSkills: UserSkill[],
  allSkillsMap: Map<string, Skill>
): boolean {
  // Create a simulated user skills array
  const simulatedSkills = userSkills.map(s =>
    s.skillId === ifSkillId ? { ...s, level: ifLevel } : s
  );

  // If skill not in user skills, add it
  if (!simulatedSkills.find(s => s.skillId === ifSkillId)) {
    simulatedSkills.push({
      id: `simulated_${ifSkillId}`,
      skillId: ifSkillId,
      level: ifLevel,
      source: 'self_reported',
      updatedAt: new Date(),
    });
  }

  const currentState = computeNodeState(targetSkill, userSkills, allSkillsMap);
  const simulatedState = computeNodeState(targetSkill, simulatedSkills, allSkillsMap);

  return currentState === 'locked' && simulatedState !== 'locked';
}

/**
 * Get the next skills that would be unlocked by completing a skill
 */
export function getNextUnlockableSkills(
  completedSkillId: string,
  skills: Skill[],
  userSkills: UserSkill[]
): Skill[] {
  const skillsMap = new Map(skills.map(s => [s.id, s]));

  return skills.filter(skill => {
    // Check if this skill has the completed skill as a prerequisite
    if (!skill.prerequisites.includes(completedSkillId)) {
      return false;
    }

    // Check if completing the skill would unlock it
    return wouldUnlock(skill, completedSkillId, 2, userSkills, skillsMap);
  });
}
