/**
 * MAP LAYOUT ALGORITHM - SIMPLIFIED
 *
 * Creates a clean tree layout with NO crossing roads.
 *
 * ALGORITHM:
 * 1. Build a tree structure from the skill graph
 * 2. Use recursive tree layout - each subtree gets a contiguous vertical space
 * 3. This guarantees no edge crossings
 * 4. Limit nodes to keep the map clean (max 8-10 key skills)
 */

import {
  MapCheckpoint,
  MapRoad,
  ForestMapData,
  MapCharacter,
  CheckpointType,
  CheckpointState,
  RoadState,
  MapLayoutConfig,
  DEFAULT_MAP_LAYOUT_CONFIG,
} from './types';
import { UserSkillGraph, SkillNode, UserSkill, CareerGoal, NodeState } from '@/types';
import { getSkillById } from '@/data/careerData';

// ============================================
// TREE NODE FOR LAYOUT
// ============================================

interface TreeNode {
  id: string;
  skillNode: SkillNode;
  children: TreeNode[];
  // Layout properties (calculated)
  x: number;
  y: number;
  subtreeHeight: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapNodeStateToCheckpointState(state: NodeState): CheckpointState {
  switch (state) {
    case 'completed': return 'completed';
    case 'in_progress': return 'active';
    case 'unlocked': return 'available';
    case 'locked':
    default: return 'locked';
  }
}

function getCheckpointType(tier: number, isGoal: boolean = false): CheckpointType {
  if (isGoal) return 'castle';
  if (tier <= 2) return 'village';
  if (tier <= 3) return 'town';
  if (tier <= 4) return 'mountain';
  return 'castle';
}

function getRoadState(fromState: CheckpointState, toState: CheckpointState): RoadState {
  if (fromState === 'completed' && (toState === 'completed' || toState === 'active')) {
    return 'traveled';
  }
  if (fromState === 'completed' || fromState === 'active') {
    return 'available';
  }
  return 'locked';
}

/**
 * Generate a smooth bezier curve that connects from right edge of source to left edge of target
 */
function generateRoadPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromSize: { width: number; height: number },
  toSize: { width: number; height: number }
): { pathData: string; waypoints: { x: number; y: number }[] } {
  // Start from right edge of source
  const startX = from.x + fromSize.width / 2;
  const startY = from.y;

  // End at left edge of target
  const endX = to.x - toSize.width / 2;
  const endY = to.y;

  // Control points for smooth S-curve
  const midX = (startX + endX) / 2;

  // Simple horizontal bezier curve
  const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  // Generate waypoints for character animation
  const waypoints: { x: number; y: number }[] = [];
  const steps = 15;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;

    // Cubic bezier
    const x = mt * mt * mt * startX +
              3 * mt * mt * t * midX +
              3 * mt * t * t * midX +
              t * t * t * endX;
    const y = mt * mt * mt * startY +
              3 * mt * mt * t * startY +
              3 * mt * t * t * endY +
              t * t * t * endY;

    waypoints.push({ x, y });
  }

  return { pathData, waypoints };
}

// ============================================
// TREE BUILDING
// ============================================

/**
 * Build a tree from the graph, selecting only important nodes
 * Limits to ~8 nodes for a clean map
 */
function buildTree(
  nodes: SkillNode[],
  edges: { sourceNodeId: string; targetNodeId: string }[]
): TreeNode | null {
  if (nodes.length === 0) return null;

  // Create adjacency map
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();

  nodes.forEach(n => {
    childrenOf.set(n.id, []);
    parentsOf.set(n.id, []);
  });

  edges.forEach(edge => {
    const children = childrenOf.get(edge.sourceNodeId);
    if (children) children.push(edge.targetNodeId);

    const parents = parentsOf.get(edge.targetNodeId);
    if (parents) parents.push(edge.sourceNodeId);
  });

  // Find root nodes (no parents)
  const rootIds = nodes
    .filter(n => (parentsOf.get(n.id) || []).length === 0)
    .map(n => n.id);

  // If no roots, use lowest tier nodes
  const roots = rootIds.length > 0
    ? rootIds
    : nodes.sort((a, b) => a.tier - b.tier).slice(0, 1).map(n => n.id);

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const visited = new Set<string>();

  // Build tree recursively, limiting depth and breadth
  function buildSubtree(nodeId: string, depth: number): TreeNode | null {
    if (visited.has(nodeId) || depth > 4) return null; // Max 4 levels deep
    visited.add(nodeId);

    const skillNode = nodeMap.get(nodeId);
    if (!skillNode) return null;

    const childIds = childrenOf.get(nodeId) || [];
    // Limit children to max 2 per node for cleaner layout
    const limitedChildIds = childIds.slice(0, 2);

    const children: TreeNode[] = [];
    for (const childId of limitedChildIds) {
      const childTree = buildSubtree(childId, depth + 1);
      if (childTree) children.push(childTree);
    }

    return {
      id: nodeId,
      skillNode,
      children,
      x: 0,
      y: 0,
      subtreeHeight: 0,
    };
  }

  // Build from first root (for simplicity, create a virtual root if multiple)
  if (roots.length === 1) {
    return buildSubtree(roots[0], 0);
  }

  // Multiple roots - build each and combine
  const rootTrees: TreeNode[] = [];
  for (const rootId of roots.slice(0, 3)) { // Max 3 root branches
    const tree = buildSubtree(rootId, 0);
    if (tree) rootTrees.push(tree);
  }

  if (rootTrees.length === 0) return null;
  if (rootTrees.length === 1) return rootTrees[0];

  // Create virtual root
  return {
    id: 'virtual_root',
    skillNode: nodes[0], // Placeholder
    children: rootTrees,
    x: 0,
    y: 0,
    subtreeHeight: 0,
  };
}

// ============================================
// TREE LAYOUT (No Crossings)
// ============================================

/**
 * Calculate subtree heights recursively
 */
function calculateSubtreeHeights(node: TreeNode, nodeHeight: number, spacing: number): number {
  if (node.children.length === 0) {
    node.subtreeHeight = nodeHeight;
    return nodeHeight;
  }

  let totalHeight = 0;
  for (const child of node.children) {
    totalHeight += calculateSubtreeHeights(child, nodeHeight, spacing);
  }
  totalHeight += (node.children.length - 1) * spacing; // Spacing between children

  node.subtreeHeight = Math.max(nodeHeight, totalHeight);
  return node.subtreeHeight;
}

/**
 * Assign positions using the calculated subtree heights
 * This guarantees no crossing edges
 */
function assignPositions(
  node: TreeNode,
  x: number,
  yStart: number,
  yEnd: number,
  config: MapLayoutConfig
): void {
  // Center node in its allocated vertical space
  node.x = x;
  node.y = (yStart + yEnd) / 2;

  if (node.children.length === 0) return;

  // Distribute children in the vertical space
  const childX = x + config.horizontalSpacing;
  let currentY = yStart;

  const totalChildHeight = node.children.reduce((sum, c) => sum + c.subtreeHeight, 0);
  const totalSpacing = (node.children.length - 1) * config.verticalSpacing;
  const availableHeight = yEnd - yStart;

  // Scale factor if children need more space than available
  const scale = availableHeight / (totalChildHeight + totalSpacing);

  for (const child of node.children) {
    const childHeight = child.subtreeHeight * Math.min(scale, 1);
    const childEnd = currentY + childHeight;

    assignPositions(child, childX, currentY, childEnd, config);

    currentY = childEnd + config.verticalSpacing * Math.min(scale, 1);
  }
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

export function generateForestMap(
  graph: UserSkillGraph,
  _userSkills: UserSkill[],
  _careerGoals: CareerGoal[] = [],
  config: MapLayoutConfig = DEFAULT_MAP_LAYOUT_CONFIG
): ForestMapData {
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    return createEmptyMap();
  }

  // Build tree structure
  const tree = buildTree(nodes, edges);
  if (!tree) {
    return createEmptyMap();
  }

  // Calculate subtree heights
  const nodeHeight = config.checkpointHeight + 60; // Include label space
  calculateSubtreeHeights(tree, nodeHeight, config.verticalSpacing);

  // Calculate total height needed
  const totalHeight = tree.subtreeHeight + config.marginTop + config.marginBottom;

  // Assign positions (no crossings guaranteed)
  assignPositions(
    tree,
    config.marginLeft,
    config.marginTop,
    totalHeight - config.marginBottom,
    config
  );

  // Collect all nodes from tree
  const checkpoints: MapCheckpoint[] = [];
  const roads: MapRoad[] = [];
  const nodePositions = new Map<string, { x: number; y: number }>();

  // Add start checkpoint
  const startCheckpoint: MapCheckpoint = {
    id: 'start',
    name: 'Start',
    description: 'Your journey begins here!',
    type: 'start',
    state: 'completed',
    position: { x: config.marginLeft - 100, y: totalHeight / 2 },
    tier: 0,
    parentIds: [],
    childIds: [],
    progress: 100,
    icon: 'flag',
  };
  checkpoints.push(startCheckpoint);
  nodePositions.set('start', startCheckpoint.position);

  // Traverse tree and create checkpoints
  function collectNodes(node: TreeNode, parentId: string | null): void {
    // Skip virtual root
    if (node.id === 'virtual_root') {
      for (const child of node.children) {
        collectNodes(child, 'start');
      }
      return;
    }

    const skill = getSkillById(node.skillNode.skillId);
    const position = { x: node.x, y: node.y };
    nodePositions.set(node.id, position);

    const checkpoint: MapCheckpoint = {
      id: node.id,
      skillId: node.skillNode.skillId,
      name: skill?.skillName || 'Skill',
      description: skill ? `${skill.category} • ${skill.time}` : undefined,
      type: getCheckpointType(node.skillNode.tier),
      state: mapNodeStateToCheckpointState(node.skillNode.state),
      position,
      tier: node.skillNode.tier,
      parentIds: parentId ? [parentId] : [],
      childIds: node.children.map(c => c.id),
      progress: node.skillNode.completionPercent,
      icon: undefined, // Career skills don't have icons
    };

    checkpoints.push(checkpoint);

    // Create road from parent
    if (parentId) {
      const parentPos = nodePositions.get(parentId);
      if (parentPos) {
        const parentCheckpoint = checkpoints.find(c => c.id === parentId);
        const parentSize = parentId === 'start'
          ? { width: 60, height: 60 }
          : { width: config.checkpointWidth, height: config.checkpointHeight };

        const { pathData, waypoints } = generateRoadPath(
          parentPos,
          position,
          parentSize,
          { width: config.checkpointWidth, height: config.checkpointHeight }
        );

        roads.push({
          id: `road_${parentId}_${node.id}`,
          fromId: parentId,
          toId: node.id,
          type: 'main',
          state: getRoadState(
            parentCheckpoint?.state || 'completed',
            checkpoint.state
          ),
          pathData,
          waypoints,
        });
      }
    }

    // Recurse to children
    for (const child of node.children) {
      collectNodes(child, node.id);
    }
  }

  collectNodes(tree, 'start');

  // Update start checkpoint children
  const firstLevelNodes = tree.id === 'virtual_root'
    ? tree.children.map(c => c.id)
    : [tree.id];
  startCheckpoint.childIds = firstLevelNodes;

  // Calculate dimensions
  let maxX = config.marginLeft;
  let maxY = config.marginTop;

  nodePositions.forEach(pos => {
    maxX = Math.max(maxX, pos.x + config.checkpointWidth);
    maxY = Math.max(maxY, pos.y + config.checkpointHeight);
  });

  const dimensions = {
    width: maxX + config.marginRight,
    height: Math.max(maxY + config.marginBottom, totalHeight),
  };

  // Initialize character at current/active checkpoint
  const activeCheckpoint = checkpoints.find(c => c.state === 'active');
  const lastCompletedCheckpoint = [...checkpoints]
    .filter(c => c.state === 'completed' && c.id !== 'start')
    .sort((a, b) => b.tier - a.tier)[0];
  const currentCheckpoint = activeCheckpoint || lastCompletedCheckpoint || startCheckpoint;

  const character: MapCharacter = {
    position: { ...currentCheckpoint.position },
    currentCheckpointId: currentCheckpoint.id,
    animationState: 'idle',
    direction: 'right',
    walkProgress: 0,
  };

  return {
    id: `map_${graph.targetRoleId}_${Date.now()}`,
    checkpoints,
    roads,
    character,
    dimensions,
    generatedAt: new Date(),
    targetRoleId: graph.targetRoleId,
  };
}

function createEmptyMap(): ForestMapData {
  const startCheckpoint: MapCheckpoint = {
    id: 'start',
    name: 'Start',
    description: 'Set a career goal to begin!',
    type: 'start',
    state: 'completed',
    position: { x: 200, y: 250 },
    tier: 0,
    parentIds: [],
    childIds: [],
    progress: 100,
    icon: 'flag',
  };

  return {
    id: 'empty_map',
    checkpoints: [startCheckpoint],
    roads: [],
    character: {
      position: { x: 200, y: 250 },
      currentCheckpointId: 'start',
      animationState: 'idle',
      direction: 'right',
      walkProgress: 0,
    },
    dimensions: { width: 800, height: 500 },
    generatedAt: new Date(),
  };
}

/**
 * Find path between checkpoints (BFS)
 */
export function findPathBetweenCheckpoints(
  mapData: ForestMapData,
  fromId: string,
  toId: string
): MapRoad[] {
  const roadsByFrom = new Map<string, MapRoad[]>();
  mapData.roads.forEach(road => {
    const roads = roadsByFrom.get(road.fromId) || [];
    roads.push(road);
    roadsByFrom.set(road.fromId, roads);
  });

  const visited = new Set<string>();
  const queue: { id: string; path: MapRoad[] }[] = [{ id: fromId, path: [] }];

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    if (id === toId) return path;
    if (visited.has(id)) continue;
    visited.add(id);

    const outgoingRoads = roadsByFrom.get(id) || [];
    for (const road of outgoingRoads) {
      if (!visited.has(road.toId)) {
        queue.push({ id: road.toId, path: [...path, road] });
      }
    }
  }

  return [];
}

/**
 * Get waypoints for character walking
 */
export function getWalkingWaypoints(
  mapData: ForestMapData,
  fromId: string,
  toId: string
): { x: number; y: number }[] {
  const path = findPathBetweenCheckpoints(mapData, fromId, toId);

  const waypoints: { x: number; y: number }[] = [];
  path.forEach(road => {
    waypoints.push(...road.waypoints);
  });

  return waypoints;
}
