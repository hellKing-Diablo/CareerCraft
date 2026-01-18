import { Skill, UserSkill, RoleBenchmark, SkillNode, SkillEdge, UserSkillGraph } from '@/types';
import { skillOntology, getSkillById } from '@/data/skillOntology';
import { computeNodeState, computeCompletionPercent } from './nodeStateComputer';

/**
 * Graph Generator
 *
 * DETERMINISTIC CODE - generates the visual skill flow graph
 * based on role requirements and user progress.
 */

// Layout constants
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 100;
const VERTICAL_GAP = 120;
const TIER_X_OFFSET = 300;

/**
 * Generate a skill graph for a target role
 */
export function generateSkillGraph(
  targetRole: RoleBenchmark,
  userSkills: UserSkill[]
): UserSkillGraph {
  // Get all required skills for the role
  const requiredSkillIds = new Set(targetRole.requiredSkills.map(r => r.skillId));

  // Also include prerequisite skills
  const allRelevantSkillIds = new Set<string>();

  function addSkillAndPrereqs(skillId: string) {
    if (allRelevantSkillIds.has(skillId)) return;
    allRelevantSkillIds.add(skillId);

    const skill = getSkillById(skillId);
    if (skill) {
      skill.prerequisites.forEach(prereqId => addSkillAndPrereqs(prereqId));
    }
  }

  requiredSkillIds.forEach(id => addSkillAndPrereqs(id));

  // Get skill objects
  const relevantSkills = skillOntology.filter(s => allRelevantSkillIds.has(s.id));
  const skillsMap = new Map(skillOntology.map(s => [s.id, s]));

  // Group skills by tier
  const skillsByTier = new Map<number, Skill[]>();
  relevantSkills.forEach(skill => {
    const tier = skill.tier;
    if (!skillsByTier.has(tier)) {
      skillsByTier.set(tier, []);
    }
    skillsByTier.get(tier)!.push(skill);
  });

  // Generate nodes with positions
  const nodes: SkillNode[] = [];
  const tiers = Array.from(skillsByTier.keys()).sort((a, b) => a - b);

  tiers.forEach((tier, tierIndex) => {
    const tierSkills = skillsByTier.get(tier)!;
    const tierX = tierIndex * TIER_X_OFFSET + 50;

    tierSkills.forEach((skill, skillIndex) => {
      const state = computeNodeState(skill, userSkills, skillsMap);
      const completionPercent = computeCompletionPercent(skill.id, userSkills);

      // Calculate Y position - center the tier vertically
      const tierHeight = tierSkills.length * (NODE_HEIGHT + VERTICAL_GAP);
      const startY = (600 - tierHeight) / 2 + 50; // Assume 600px viewport height
      const nodeY = startY + skillIndex * (NODE_HEIGHT + VERTICAL_GAP);

      nodes.push({
        id: `node_${skill.id}`,
        skillId: skill.id,
        position: { x: tierX, y: nodeY },
        state,
        completionPercent,
        tier: skill.tier,
      });
    });
  });

  // Generate edges based on prerequisites
  const edges: SkillEdge[] = [];
  relevantSkills.forEach(skill => {
    skill.prerequisites.forEach(prereqId => {
      // Only add edge if prerequisite is also in our relevant skills
      if (allRelevantSkillIds.has(prereqId)) {
        edges.push({
          id: `edge_${prereqId}_${skill.id}`,
          sourceNodeId: `node_${prereqId}`,
          targetNodeId: `node_${skill.id}`,
          type: 'prerequisite',
        });
      }
    });
  });

  return {
    targetRoleId: targetRole.id,
    nodes,
    edges,
    generatedAt: new Date(),
  };
}

/**
 * Update node states in an existing graph
 * Used when user skills change
 */
export function updateGraphNodeStates(
  graph: UserSkillGraph,
  userSkills: UserSkill[]
): UserSkillGraph {
  const skillsMap = new Map(skillOntology.map(s => [s.id, s]));

  const updatedNodes = graph.nodes.map(node => {
    const skill = getSkillById(node.skillId);
    if (!skill) return node;

    const state = computeNodeState(skill, userSkills, skillsMap);
    const completionPercent = computeCompletionPercent(skill.id, userSkills);

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
 * Generate a minimal graph showing only the path to unlock a specific skill
 */
export function generatePathToSkill(
  targetSkillId: string,
  userSkills: UserSkill[]
): { nodes: SkillNode[]; edges: SkillEdge[] } {
  const pathSkillIds = new Set<string>();
  const skillsMap = new Map(skillOntology.map(s => [s.id, s]));

  // Trace back through prerequisites
  function tracePrereqs(skillId: string) {
    if (pathSkillIds.has(skillId)) return;
    pathSkillIds.add(skillId);

    const skill = getSkillById(skillId);
    if (skill) {
      skill.prerequisites.forEach(prereqId => tracePrereqs(prereqId));
    }
  }

  tracePrereqs(targetSkillId);

  // Generate nodes and edges
  const pathSkills = skillOntology.filter(s => pathSkillIds.has(s.id));
  const nodes: SkillNode[] = [];
  const edges: SkillEdge[] = [];

  // Simple linear layout for path
  let xPos = 50;
  const sortedByTier = pathSkills.sort((a, b) => a.tier - b.tier);

  sortedByTier.forEach((skill) => {
    const state = computeNodeState(skill, userSkills, skillsMap);
    const completionPercent = computeCompletionPercent(skill.id, userSkills);

    nodes.push({
      id: `node_${skill.id}`,
      skillId: skill.id,
      position: { x: xPos, y: 200 },
      state,
      completionPercent,
      tier: skill.tier,
    });

    xPos += NODE_WIDTH + HORIZONTAL_GAP;
  });

  // Add edges
  pathSkills.forEach(skill => {
    skill.prerequisites.forEach(prereqId => {
      if (pathSkillIds.has(prereqId)) {
        edges.push({
          id: `edge_${prereqId}_${skill.id}`,
          sourceNodeId: `node_${prereqId}`,
          targetNodeId: `node_${skill.id}`,
          type: 'prerequisite',
        });
      }
    });
  });

  return { nodes, edges };
}

/**
 * Get statistics about the graph
 */
export function getGraphStats(graph: UserSkillGraph): {
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
