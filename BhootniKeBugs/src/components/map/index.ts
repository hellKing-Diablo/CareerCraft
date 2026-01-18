/**
 * FOREST MAP COMPONENTS
 *
 * A game-like world map system for visualizing skill progression.
 */

// Main component
export { ForestMap } from './ForestMap';

// Sub-components
export { MapCheckpoint } from './MapCheckpoint';
export { MapRoads } from './MapRoads';
export { MapCharacter, useCharacterWalk } from './MapCharacter';

// Layout algorithm
export { generateForestMap, findPathBetweenCheckpoints, getWalkingWaypoints } from './layoutAlgorithm';

// Types
export type {
  CheckpointType,
  CheckpointState,
  MapCheckpoint as MapCheckpointData,
  RoadType,
  RoadState,
  MapRoad,
  CharacterAnimationState,
  CharacterDirection,
  MapCharacter as MapCharacterData,
  MapRegion,
  ForestMapData,
  MapLayoutConfig,
  CheckpointClickEvent,
} from './types';

export { DEFAULT_MAP_LAYOUT_CONFIG } from './types';
