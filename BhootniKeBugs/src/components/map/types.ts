/**
 * FOREST MAP DATA MODEL
 *
 * This defines the data structures for a game-like world map
 * with checkpoints (villages, towns, mountains, castles) connected by roads.
 */

// ============================================
// CHECKPOINT TYPES
// ============================================

/**
 * Visual type of checkpoint on the map
 * - village: Small skill nodes (Tier 1-2)
 * - town: Intermediate skills (Tier 3)
 * - mountain: Advanced skills (Tier 4)
 * - castle: Goal/Role destinations (Tier 5 or career goals)
 * - start: Entry point to the map
 */
export type CheckpointType = 'start' | 'village' | 'town' | 'mountain' | 'castle';

/**
 * State of a checkpoint
 * - locked: Prerequisites not met, greyed out
 * - available: Can be started, visible but inactive
 * - active: Currently being worked on, glowing/highlighted
 * - completed: Finished, visually distinct
 */
export type CheckpointState = 'locked' | 'available' | 'active' | 'completed';

/**
 * A checkpoint on the map (node)
 */
export interface MapCheckpoint {
  id: string;

  // Reference to actual data (skill or goal)
  skillId?: string;
  goalId?: string;

  // Display info
  name: string;
  description?: string;
  type: CheckpointType;
  state: CheckpointState;

  // Position on the map (calculated by layout algorithm)
  position: {
    x: number;
    y: number;
  };

  // Graph structure
  tier: number; // Used for horizontal positioning
  parentIds: string[]; // Checkpoints that lead to this one
  childIds: string[]; // Checkpoints that branch from this one

  // Progress (0-100)
  progress: number;

  // Visual customization
  icon?: string;
}

// ============================================
// ROAD TYPES
// ============================================

/**
 * Type of road connecting checkpoints
 * - main: Primary path (thick, solid)
 * - branch: Alternative path (medium)
 * - optional: Nice-to-have path (thin, dashed)
 */
export type RoadType = 'main' | 'branch' | 'optional';

/**
 * State of a road
 * - locked: Not yet traversable
 * - available: Can be traveled
 * - traveled: Already completed
 */
export type RoadState = 'locked' | 'available' | 'traveled';

/**
 * A road connecting two checkpoints
 */
export interface MapRoad {
  id: string;

  // Connection
  fromId: string;
  toId: string;

  // Visual properties
  type: RoadType;
  state: RoadState;

  // Path data - control points for curved roads
  // Will be calculated by the layout algorithm
  pathData: string; // SVG path d attribute

  // Waypoints for character animation along the road
  waypoints: { x: number; y: number }[];
}

// ============================================
// CHARACTER TYPES
// ============================================

/**
 * Character animation state
 */
export type CharacterAnimationState = 'idle' | 'walking' | 'celebrating' | 'thinking';

/**
 * Character direction
 */
export type CharacterDirection = 'left' | 'right' | 'up' | 'down';

/**
 * The player's character on the map
 */
export interface MapCharacter {
  // Current position (interpolated during animation)
  position: {
    x: number;
    y: number;
  };

  // Current checkpoint (where character is stationed)
  currentCheckpointId: string;

  // Target checkpoint (when walking)
  targetCheckpointId?: string;

  // Animation
  animationState: CharacterAnimationState;
  direction: CharacterDirection;

  // Walking progress (0-1) when moving between checkpoints
  walkProgress: number;
}

// ============================================
// MAP REGION TYPES
// ============================================

/**
 * A region/zone on the map
 * The map can have multiple themed regions
 */
export interface MapRegion {
  id: string;
  name: string;
  theme: 'forest' | 'plains' | 'mountain' | 'castle_grounds';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ============================================
// COMPLETE MAP DATA
// ============================================

/**
 * Complete map data structure
 */
export interface ForestMapData {
  // Unique identifier
  id: string;

  // All checkpoints (nodes)
  checkpoints: MapCheckpoint[];

  // All roads (edges)
  roads: MapRoad[];

  // The player character
  character: MapCharacter;

  // Map dimensions
  dimensions: {
    width: number;
    height: number;
  };

  // Optional regions for visual theming
  regions?: MapRegion[];

  // Metadata
  generatedAt: Date;
  targetRoleId?: string;
}

// ============================================
// LAYOUT CONFIGURATION
// ============================================

/**
 * Configuration for the map layout algorithm
 */
export interface MapLayoutConfig {
  // Spacing
  horizontalSpacing: number; // Between tiers
  verticalSpacing: number; // Between nodes in same tier

  // Margins
  marginLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;

  // Node sizes (for collision detection)
  checkpointWidth: number;
  checkpointHeight: number;

  // Road curves
  roadCurvature: number; // 0 = straight, 1 = very curved

  // Jitter for natural feel
  positionJitter: number; // Random offset for organic look
}

/**
 * Default layout configuration
 * Clean tree layout: No crossings, max 2 children per node, 4 levels deep
 */
export const DEFAULT_MAP_LAYOUT_CONFIG: MapLayoutConfig = {
  horizontalSpacing: 400,  // Long horizontal roads between tiers
  verticalSpacing: 180,    // Vertical space between sibling nodes
  marginLeft: 180,
  marginTop: 150,
  marginRight: 180,
  marginBottom: 150,
  checkpointWidth: 120,
  checkpointHeight: 120,
  roadCurvature: 0.3,      // Smooth curves
  positionJitter: 0,       // No jitter for clean layout
};

// ============================================
// EVENTS
// ============================================

/**
 * Event emitted when a checkpoint is clicked
 */
export interface CheckpointClickEvent {
  checkpointId: string;
  checkpoint: MapCheckpoint;
}
