/**
 * Career Graph Generator
 *
 * Generates skill graphs based on the new career data (domains.json, skills.json).
 * Creates dynamic flowcharts based on user's career goals and current skills.
 */

import { UserSkill, SkillNode, SkillEdge, UserSkillGraph, SkillLevel } from '@/types';
import {
  skills as careerSkills,
  type Skill as CareerSkill
} from '@/data/careerData';

// Layout constants
const NODE_HEIGHT = 70;
const VERTICAL_GAP = 100;
const TIER_X_OFFSET = 280;

/**
 * Get skill state based on user's skill level
 */
function getSkillState(
  skillId: string,
  userSkills: UserSkill[],
  requiredLevel: number = 3
): 'completed' | 'in_progress' | 'unlocked' | 'locked' {
  const userSkill = userSkills.find(us => us.skillId === skillId);

  if (!userSkill) {
    return 'unlocked'; // User doesn't have it yet, but can learn it
  }

  if (userSkill.level >= requiredLevel) {
    return 'completed';
  }

  if (userSkill.level > 0) {
    return 'in_progress';
  }

  return 'unlocked';
}

/**
 * Get completion percent for a skill
 */
function getCompletionPercent(skillId: string, userSkills: UserSkill[], requiredLevel: number = 3): number {
  const userSkill = userSkills.find(us => us.skillId === skillId);
  if (!userSkill) return 0;
  return Math.min(100, Math.round((userSkill.level / requiredLevel) * 100));
}

/**
 * Find skills required for a specific job
 */
export function getSkillsForJob(jobTitle: string): CareerSkill[] {
  return careerSkills.filter(skill =>
    skill.jobs.some(job => job.toLowerCase() === jobTitle.toLowerCase())
  );
}

/**
 * Find skills in specific domains
 */
export function getSkillsForDomains(domains: string[]): CareerSkill[] {
  if (domains.length === 0) return [];
  return careerSkills.filter(skill =>
    skill.domain.some(d => domains.includes(d))
  );
}

/**
 * Generate a role benchmark dynamically from a job title
 */
export interface DynamicRoleBenchmark {
  id: string;
  roleName: string;
  domain: string;
  description: string;
  requiredSkills: Array<{
    skillId: string;
    skillName: string;
    minimumLevel: SkillLevel;
    priority: 'critical' | 'important' | 'nice_to_have';
    category: string;
  }>;
}

export function generateRoleBenchmark(jobTitle: string, domains: string[] = []): DynamicRoleBenchmark | null {
  const jobSkills = getSkillsForJob(jobTitle);

  if (jobSkills.length === 0) {
    // Try to find skills from domains
    const domainSkills = getSkillsForDomains(domains);
    if (domainSkills.length === 0) return null;

    // Use top skills from domains
    const topSkills = domainSkills.slice(0, 20);
    return {
      id: `role_${jobTitle.toLowerCase().replace(/\s+/g, '_')}`,
      roleName: jobTitle,
      domain: domains[0] || 'general',
      description: `Skills needed for ${jobTitle} role`,
      requiredSkills: topSkills.map((skill, index) => ({
        skillId: skill.id,
        skillName: skill.skillName,
        minimumLevel: skill.skillLevel as SkillLevel,
        priority: index < 5 ? 'critical' : index < 10 ? 'important' : 'nice_to_have',
        category: skill.category,
      })),
    };
  }

  // Sort skills by level (higher level = more advanced = less critical for entry)
  const sortedSkills = [...jobSkills].sort((a, b) => a.skillLevel - b.skillLevel);

  return {
    id: `role_${jobTitle.toLowerCase().replace(/\s+/g, '_')}`,
    roleName: jobTitle,
    domain: jobSkills[0]?.domain[0] || 'general',
    description: `Skills needed for ${jobTitle} role`,
    requiredSkills: sortedSkills.slice(0, 25).map((skill, index) => ({
      skillId: skill.id,
      skillName: skill.skillName,
      minimumLevel: skill.skillLevel as SkillLevel,
      priority: index < 8 ? 'critical' : index < 15 ? 'important' : 'nice_to_have',
      category: skill.category,
    })),
  };
}

/**
 * Generate a skill graph for a career goal
 */
export function generateCareerGraph(
  targetJobTitle: string,
  userSkills: UserSkill[],
  userDomains: string[] = []
): UserSkillGraph | null {
  const roleBenchmark = generateRoleBenchmark(targetJobTitle, userDomains);

  if (!roleBenchmark || roleBenchmark.requiredSkills.length === 0) {
    return null;
  }

  // Group skills by category for layout
  const skillsByCategory = new Map<string, typeof roleBenchmark.requiredSkills>();

  roleBenchmark.requiredSkills.forEach(skill => {
    const category = skill.category;
    if (!skillsByCategory.has(category)) {
      skillsByCategory.set(category, []);
    }
    skillsByCategory.get(category)!.push(skill);
  });

  // Sort categories for consistent layout
  const categories = Array.from(skillsByCategory.keys()).sort();

  // Generate nodes with positions
  const nodes: SkillNode[] = [];
  const edges: SkillEdge[] = [];

  let categoryIndex = 0;
  categories.forEach(category => {
    const categorySkills = skillsByCategory.get(category)!;
    const tierX = categoryIndex * TIER_X_OFFSET + 100;

    // Sort skills within category by level
    const sortedSkills = [...categorySkills].sort((a, b) => a.minimumLevel - b.minimumLevel);

    sortedSkills.forEach((skillReq, skillIndex) => {
      const state = getSkillState(skillReq.skillId, userSkills, skillReq.minimumLevel);
      const completionPercent = getCompletionPercent(skillReq.skillId, userSkills, skillReq.minimumLevel);

      // Calculate Y position
      const categoryHeight = sortedSkills.length * (NODE_HEIGHT + VERTICAL_GAP);
      const startY = Math.max(50, (700 - categoryHeight) / 2);
      const nodeY = startY + skillIndex * (NODE_HEIGHT + VERTICAL_GAP);

      const node: SkillNode = {
        id: `node_${skillReq.skillId}`,
        skillId: skillReq.skillId,
        position: { x: tierX, y: nodeY },
        state,
        completionPercent,
        tier: Math.max(1, skillReq.minimumLevel) as 1 | 2 | 3 | 4 | 5,
      };

      nodes.push(node);

      // Create edges between skills of adjacent levels within the same category
      if (skillIndex > 0) {
        const prevSkill = sortedSkills[skillIndex - 1];
        edges.push({
          id: `edge_${prevSkill.skillId}_${skillReq.skillId}`,
          sourceNodeId: `node_${prevSkill.skillId}`,
          targetNodeId: `node_${skillReq.skillId}`,
          type: 'prerequisite',
        });
      }
    });

    categoryIndex++;
  });

  // Add cross-category edges for skills at the same level
  // This creates a more connected graph
  const nodesByTier = new Map<number, SkillNode[]>();
  nodes.forEach(node => {
    if (!nodesByTier.has(node.tier)) {
      nodesByTier.set(node.tier, []);
    }
    nodesByTier.get(node.tier)!.push(node);
  });

  // Connect first nodes of each tier to create a path
  const tiers = Array.from(nodesByTier.keys()).sort((a, b) => a - b);
  for (let i = 0; i < tiers.length - 1; i++) {
    const currentTierNodes = nodesByTier.get(tiers[i])!;
    const nextTierNodes = nodesByTier.get(tiers[i + 1])!;

    if (currentTierNodes.length > 0 && nextTierNodes.length > 0) {
      // Connect last node of current tier to first node of next tier
      edges.push({
        id: `edge_tier_${tiers[i]}_to_${tiers[i + 1]}`,
        sourceNodeId: currentTierNodes[currentTierNodes.length - 1].id,
        targetNodeId: nextTierNodes[0].id,
        type: 'progression',
      });
    }
  }

  return {
    targetRoleId: roleBenchmark.id,
    nodes,
    edges,
    generatedAt: new Date(),
  };
}

/**
 * Update node states in an existing career graph
 */
export function updateCareerGraphStates(
  graph: UserSkillGraph,
  userSkills: UserSkill[]
): UserSkillGraph {
  const updatedNodes = graph.nodes.map(node => {
    const requiredLevel = node.tier || 3;
    const state = getSkillState(node.skillId, userSkills, requiredLevel);
    const completionPercent = getCompletionPercent(node.skillId, userSkills, requiredLevel);

    return {
      ...node,
      state,
      completionPercent,
    };
  });

  return {
    ...graph,
    nodes: updatedNodes,
    generatedAt: new Date(),
  };
}

/**
 * Get statistics about the career graph
 */
export function getCareerGraphStats(graph: UserSkillGraph): {
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  unlockedNodes: number;
  lockedNodes: number;
  completionPercent: number;
} {
  const completed = graph.nodes.filter(n => n.state === 'completed').length;
  const inProgress = graph.nodes.filter(n => n.state === 'in_progress').length;
  const unlocked = graph.nodes.filter(n => n.state === 'unlocked').length;
  const locked = graph.nodes.filter(n => n.state === 'locked').length;
  const total = graph.nodes.length;

  return {
    totalNodes: total,
    completedNodes: completed,
    inProgressNodes: inProgress,
    unlockedNodes: unlocked,
    lockedNodes: locked,
    completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Perform gap analysis for career goal
 */
export function analyzeCareerGaps(
  userSkills: UserSkill[],
  targetJobTitle: string,
  userDomains: string[] = []
): {
  readinessScore: number;
  gaps: Array<{
    skillId: string;
    skillName: string;
    currentLevel: SkillLevel;
    requiredLevel: SkillLevel;
    priority: 'critical' | 'important' | 'nice_to_have';
    category: string;
  }>;
  strengths: Array<{
    skillId: string;
    skillName: string;
    level: SkillLevel;
    category: string;
  }>;
} {
  const roleBenchmark = generateRoleBenchmark(targetJobTitle, userDomains);

  if (!roleBenchmark) {
    return { readinessScore: 0, gaps: [], strengths: [] };
  }

  const gaps: Array<{
    skillId: string;
    skillName: string;
    currentLevel: SkillLevel;
    requiredLevel: SkillLevel;
    priority: 'critical' | 'important' | 'nice_to_have';
    category: string;
  }> = [];

  const strengths: Array<{
    skillId: string;
    skillName: string;
    level: SkillLevel;
    category: string;
  }> = [];

  let totalRequired = 0;
  let totalAchieved = 0;

  roleBenchmark.requiredSkills.forEach(req => {
    const userSkill = userSkills.find(us => us.skillId === req.skillId);
    const currentLevel = (userSkill?.level || 0) as SkillLevel;

    totalRequired += req.minimumLevel;
    totalAchieved += Math.min(currentLevel, req.minimumLevel);

    if (currentLevel < req.minimumLevel) {
      gaps.push({
        skillId: req.skillId,
        skillName: req.skillName,
        currentLevel,
        requiredLevel: req.minimumLevel,
        priority: req.priority,
        category: req.category,
      });
    } else {
      strengths.push({
        skillId: req.skillId,
        skillName: req.skillName,
        level: currentLevel,
        category: req.category,
      });
    }
  });

  // Sort gaps by priority
  const priorityOrder = { critical: 0, important: 1, nice_to_have: 2 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const readinessScore = totalRequired > 0
    ? Math.round((totalAchieved / totalRequired) * 100)
    : 0;

  return { readinessScore, gaps, strengths };
}
