/**
 * MAP ROADS COMPONENT
 *
 * Renders dirt/forest paths between checkpoints.
 * Styled to match the forest map theme.
 */

import { motion } from 'framer-motion';
import { MapRoad } from './types';

interface MapRoadsProps {
  roads: MapRoad[];
  width: number;
  height: number;
}

export function MapRoads({ roads, width, height }: MapRoadsProps) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {/* Dirt path gradient */}
        <linearGradient id="dirtPath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B7355" />
          <stop offset="50%" stopColor="#A0896C" />
          <stop offset="100%" stopColor="#8B7355" />
        </linearGradient>

        {/* Completed path (green grass) */}
        <linearGradient id="completedPath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        {/* Available path (golden) */}
        <linearGradient id="availablePath" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop shadow for depth */}
        <filter id="pathShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Render roads - shadows first, then main paths */}
      {roads
        .sort((a, b) => {
          const order = { locked: 0, available: 1, traveled: 2 };
          return order[a.state] - order[b.state];
        })
        .map((road) => (
          <Road key={road.id} road={road} />
        ))}
    </svg>
  );
}

interface RoadProps {
  road: MapRoad;
}

function Road({ road }: RoadProps) {
  const { pathData, type, state } = road;

  // Road width based on type - thinner roads
  const strokeWidth = type === 'main' ? 8 : type === 'branch' ? 6 : 4;

  // Get stroke style based on state
  const getStroke = () => {
    switch (state) {
      case 'traveled':
        return 'url(#completedPath)';
      case 'available':
        return 'url(#availablePath)';
      case 'locked':
      default:
        return '#9ca3af';
    }
  };

  // Border color for depth
  const getBorderColor = () => {
    switch (state) {
      case 'traveled':
        return '#166534';
      case 'available':
        return '#b45309';
      case 'locked':
      default:
        return '#6b7280';
    }
  };

  return (
    <g>
      {/* Road shadow for depth */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={strokeWidth + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: 'translate(2px, 2px)' }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* Road border */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={getBorderColor()}
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Main road surface */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={getStroke()}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={state === 'locked' ? '15 12' : 'none'}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 0.1 }}
        filter={state === 'available' ? 'url(#pathGlow)' : undefined}
      />

      {/* Footsteps/dots for traveled paths */}
      {state === 'traveled' && (
        <motion.path
          d={pathData}
          fill="none"
          stroke="#86efac"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="2 15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
        />
      )}

      {/* Animated particles for available paths */}
      {state === 'available' && <PathParticles pathData={pathData} />}
    </g>
  );
}

// Animated particles along available paths
function PathParticles({ pathData }: { pathData: string }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          r={3}
          fill="#fef08a"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut',
          }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={pathData}
            begin={`${i * 0.75}s`}
          />
        </motion.circle>
      ))}
    </g>
  );
}
