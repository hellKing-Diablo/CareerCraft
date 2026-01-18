/**
 * MAP CHARACTER COMPONENT
 *
 * Uses custom sprite sheet for walking animation.
 * Sprite: man_walk.png (4 columns x 3 rows = 12 frames)
 */

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MapCharacter as CharacterData, CharacterAnimationState, CharacterDirection } from './types';

// Sprite sheet configuration
const SPRITE_CONFIG = {
  src: '/assets/map/man_walk.png',
  cols: 4,
  rows: 3,
  totalFrames: 12,
  frameWidth: 100, // Will be calculated or estimated
  frameHeight: 120, // Will be calculated or estimated
  animationSpeed: 80, // ms per frame
};

interface MapCharacterProps {
  character: CharacterData;
  walkingWaypoints?: { x: number; y: number }[];
  onWalkComplete?: () => void;
}

export function MapCharacter({ character, walkingWaypoints, onWalkComplete }: MapCharacterProps) {
  const controls = useAnimation();
  const [currentState, setCurrentState] = useState<CharacterAnimationState>(character.animationState);
  const [direction, setDirection] = useState<CharacterDirection>(character.direction);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sprite frame animation
  useEffect(() => {
    if (currentState === 'walking') {
      // Animate through frames
      frameTimerRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % SPRITE_CONFIG.totalFrames);
      }, SPRITE_CONFIG.animationSpeed);
    } else {
      // Stop on first frame when idle
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
      }
      setCurrentFrame(0);
    }

    return () => {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
      }
    };
  }, [currentState]);

  // Handle walking animation along waypoints
  useEffect(() => {
    if (walkingWaypoints && walkingWaypoints.length > 1) {
      setCurrentState('walking');

      // Determine direction based on overall movement
      const startX = walkingWaypoints[0].x;
      const endX = walkingWaypoints[walkingWaypoints.length - 1].x;
      setDirection(endX > startX ? 'right' : 'left');

      // Animate through waypoints
      const animateWalk = async () => {
        for (let i = 0; i < walkingWaypoints.length; i++) {
          await controls.start({
            x: walkingWaypoints[i].x,
            y: walkingWaypoints[i].y - 40,
            transition: { duration: 0.05, ease: 'linear' },
          });
        }
        setCurrentState('celebrating');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCurrentState('idle');
        onWalkComplete?.();
      };

      animateWalk();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [walkingWaypoints, controls, onWalkComplete]);

  // Update position when character data changes (without animation)
  useEffect(() => {
    if (!walkingWaypoints) {
      controls.set({
        x: character.position.x,
        y: character.position.y - 40,
      });
    }
  }, [character.position, controls, walkingWaypoints]);

  // Calculate sprite position for current frame
  const frameCol = currentFrame % SPRITE_CONFIG.cols;
  const frameRow = Math.floor(currentFrame / SPRITE_CONFIG.cols);

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      initial={{ x: character.position.x, y: character.position.y - 40 }}
      animate={controls}
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      {/* Character sprite */}
      <div
        className="relative"
        style={{
          width: 80,
          height: 96,
          transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        {/* Sprite sheet animation */}
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${SPRITE_CONFIG.src})`,
            backgroundSize: `${SPRITE_CONFIG.cols * 100}% ${SPRITE_CONFIG.rows * 100}%`,
            backgroundPosition: `${(frameCol / (SPRITE_CONFIG.cols - 1)) * 100}% ${(frameRow / (SPRITE_CONFIG.rows - 1)) * 100}%`,
            imageRendering: 'auto',
          }}
        />

        {/* Shadow */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/30 rounded-full blur-sm"
          style={{
            transform: `translateX(-50%) scaleX(${currentState === 'walking' ? 0.8 + Math.sin(currentFrame * 0.5) * 0.2 : 1})`,
          }}
        />

        {/* Celebration effects */}
        {currentState === 'celebrating' && (
          <>
            <motion.span
              className="absolute -top-4 left-0 text-xl"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -20 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <motion.span
              className="absolute -top-2 right-0 text-xl"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -25 }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
            >
              ✨
            </motion.span>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// WALKING ANIMATION HOOK
// ============================================

export function useCharacterWalk(
  initialPosition: { x: number; y: number },
  waypoints: { x: number; y: number }[] | null,
  duration: number = 2000
) {
  const [position, setPosition] = useState(initialPosition);
  const [isWalking, setIsWalking] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    setIsWalking(true);
    const startTime = Date.now();
    const totalDuration = duration;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / totalDuration, 1);
      setProgress(t);

      const segmentCount = waypoints.length - 1;
      const segmentProgress = t * segmentCount;
      const segmentIndex = Math.min(Math.floor(segmentProgress), segmentCount - 1);
      const segmentT = segmentProgress - segmentIndex;

      const from = waypoints[segmentIndex];
      const to = waypoints[segmentIndex + 1];
      const x = from.x + (to.x - from.x) * segmentT;
      const y = from.y + (to.y - from.y) * segmentT;

      setPosition({ x, y });

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsWalking(false);
        setPosition(waypoints[waypoints.length - 1]);
      }
    };

    requestAnimationFrame(animate);
  }, [waypoints, duration]);

  return { position, isWalking, progress };
}
