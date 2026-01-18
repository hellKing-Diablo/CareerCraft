/**
 * MAP CHECKPOINT COMPONENT
 *
 * Renders checkpoints using custom images:
 * - village-removebg-preview.png (Tier 1-2)
 * - Mountains.png (Tier 3-4)
 * - castle-removebg-preview.png (Goal/Tier 5)
 */

import { motion } from 'framer-motion';
import { MapCheckpoint as CheckpointData, CheckpointClickEvent } from './types';
import { cn } from '@/utils/cn';

// Asset paths
const ASSETS = {
  village: '/assets/map/village-removebg-preview.png',
  mountain: '/assets/map/Mountains.png',
  castle: '/assets/map/castle-removebg-preview.png',
};

// Checkpoint sizes based on type
const CHECKPOINT_SIZES = {
  start: { width: 60, height: 60 },
  village: { width: 100, height: 100 },
  town: { width: 110, height: 110 },
  mountain: { width: 140, height: 80 },
  castle: { width: 120, height: 100 },
};

interface MapCheckpointProps {
  checkpoint: CheckpointData;
  isCharacterHere: boolean;
  onClick?: (event: CheckpointClickEvent) => void;
}

export function MapCheckpoint({ checkpoint, isCharacterHere, onClick }: MapCheckpointProps) {
  const { type, state, position, name, progress } = checkpoint;
  const size = CHECKPOINT_SIZES[type] || CHECKPOINT_SIZES.village;

  const handleClick = () => {
    if (state !== 'locked' && onClick) {
      onClick({ checkpointId: checkpoint.id, checkpoint });
    }
  };

  // Adjust vertical offset for castle to align road with castle entrance
  const verticalOffset = type === 'castle' ? 15 : 0;

  return (
    <motion.div
      className={cn(
        'absolute flex flex-col items-center cursor-pointer',
        state === 'locked' && 'opacity-40 grayscale cursor-not-allowed'
      )}
      style={{
        left: position.x,
        top: position.y - verticalOffset,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: state === 'active' ? 1.1 : 1,
        opacity: 1
      }}
      whileHover={state !== 'locked' ? { scale: state === 'active' ? 1.15 : 1.08 } : undefined}
      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
      onClick={handleClick}
    >
      {/* Active glow effect */}
      {state === 'active' && (
        <motion.div
          className="absolute rounded-full bg-yellow-400/40"
          style={{
            width: size.width + 40,
            height: size.height + 40,
            top: -20,
            left: -20,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Character here indicator */}
      {isCharacterHere && (
        <motion.div
          className="absolute border-4 border-yellow-400 rounded-full"
          style={{
            width: size.width + 20,
            height: size.height + 20,
            top: -10,
            left: -10,
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Checkpoint image */}
      <CheckpointImage type={type} state={state} size={size} />

      {/* Label */}
      <motion.div
        className={cn(
          'mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-center max-w-[120px]',
          'bg-white/95 dark:bg-slate-800/95 shadow-lg backdrop-blur-sm',
          'border-2',
          state === 'locked' && 'border-gray-300 text-gray-400',
          state === 'available' && 'border-amber-400 text-amber-700 dark:text-amber-300',
          state === 'active' && 'border-yellow-500 text-yellow-700 dark:text-yellow-300',
          state === 'completed' && 'border-green-500 text-green-700 dark:text-green-300'
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {name}
      </motion.div>

      {/* Progress bar for active */}
      {state === 'active' && progress > 0 && progress < 100 && (
        <div className="mt-1 w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Completion stars */}
      {state === 'completed' && <CompletionStars />}
    </motion.div>
  );
}

// ============================================
// CHECKPOINT IMAGES
// ============================================

interface CheckpointImageProps {
  type: CheckpointData['type'];
  state: CheckpointData['state'];
  size: { width: number; height: number };
}

function CheckpointImage({ type, state, size }: CheckpointImageProps) {
  // Get image source based on type
  const getImageSrc = () => {
    switch (type) {
      case 'castle':
        return ASSETS.castle;
      case 'mountain':
        return ASSETS.mountain;
      case 'village':
      case 'town':
      default:
        return ASSETS.village;
    }
  };

  // Start flag is special
  if (type === 'start') {
    return <StartFlag />;
  }

  return (
    <motion.div
      className="relative"
      style={{ width: size.width, height: size.height }}
      whileHover={state !== 'locked' ? { y: -5 } : undefined}
    >
      {/* Main image */}
      <img
        src={getImageSrc()}
        alt={type}
        className={cn(
          'w-full h-full object-contain drop-shadow-lg',
          state === 'completed' && 'drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]'
        )}
        style={{
          filter: state === 'active' ? 'drop-shadow(0 0 12px rgba(234,179,8,0.6))' : undefined,
        }}
      />

      {/* Completion checkmark */}
      {state === 'completed' && (
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          <span className="text-white text-sm">✓</span>
        </motion.div>
      )}

      {/* Lock icon for locked state */}
      {state === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-gray-600/80 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🔒</span>
          </div>
        </div>
      )}

      {/* Pulse effect for active */}
      {state === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-yellow-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// Start Flag
function StartFlag() {
  return (
    <div className="relative w-16 h-20 flex flex-col items-center">
      {/* Flag pole */}
      <div className="absolute left-1/2 bottom-0 w-2 h-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full transform -translate-x-1/2 shadow-md" />

      {/* Flag */}
      <motion.div
        className="absolute top-0 left-1/2 w-10 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-r-sm shadow-md"
        style={{ transformOrigin: 'left center' }}
        animate={{ rotateY: [-8, 8, -8], skewY: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">▶</span>
      </motion.div>

      {/* Base */}
      <div className="absolute bottom-0 left-1/2 w-10 h-4 bg-gradient-to-b from-stone-400 to-stone-500 rounded-t-sm transform -translate-x-1/2 shadow-md" />
    </div>
  );
}

// Completion stars
function CompletionStars() {
  return (
    <motion.div
      className="flex gap-1 mt-1"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="text-yellow-400 text-base drop-shadow-md"
          initial={{ rotateY: 0, scale: 0 }}
          animate={{ rotateY: 360, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
        >
          ⭐
        </motion.span>
      ))}
    </motion.div>
  );
}
