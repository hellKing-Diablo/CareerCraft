import { motion } from 'framer-motion';

interface PixelCharacterProps {
  state?: 'idle' | 'walking' | 'jumping' | 'celebrating';
  direction?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PixelCharacter({
  state = 'idle',
  direction = 'right',
  size = 'md',
  className = '',
}: PixelCharacterProps) {
  const sizeClasses = {
    sm: 'w-8 h-12',
    md: 'w-12 h-16',
    lg: 'w-16 h-24',
  };

  const animations = {
    idle: {
      y: [0, -2, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    walking: {
      x: [0, 2, 0, -2, 0],
      y: [0, -4, 0, -4, 0],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    jumping: {
      y: [0, -20, 0],
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    celebrating: {
      y: [0, -10, 0],
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      animate={animations[state]}
      style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
    >
      {/* Character body - pixel art style using CSS */}
      <div className="relative w-full h-full">
        {/* Head */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-1/4 bg-amber-200 dark:bg-amber-300 rounded-t-lg pixel-art">
          {/* Hair */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-amber-800 dark:bg-amber-900 rounded-t-lg" />
          {/* Eye */}
          <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-gray-800 rounded-full" />
          {/* Smile */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-pink-400 rounded-full" />
        </div>

        {/* Body */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/5 h-2/5 bg-warm-500 dark:bg-warm-600 rounded-sm pixel-art">
          {/* Belt */}
          <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-amber-700" />
        </div>

        {/* Left Arm */}
        <motion.div
          className="absolute top-[28%] left-[15%] w-1/6 h-1/4 bg-amber-200 dark:bg-amber-300 rounded-sm origin-top pixel-art"
          animate={state === 'walking' ? { rotate: [20, -20, 20] } : { rotate: [0, 5, 0] }}
          transition={{ duration: state === 'walking' ? 0.4 : 1, repeat: Infinity }}
        />

        {/* Right Arm */}
        <motion.div
          className="absolute top-[28%] right-[15%] w-1/6 h-1/4 bg-amber-200 dark:bg-amber-300 rounded-sm origin-top pixel-art"
          animate={state === 'walking' ? { rotate: [-20, 20, -20] } : { rotate: [0, -5, 0] }}
          transition={{ duration: state === 'walking' ? 0.4 : 1, repeat: Infinity }}
        />

        {/* Left Leg */}
        <motion.div
          className="absolute top-[62%] left-[25%] w-1/5 h-1/3 bg-blue-600 dark:bg-blue-700 rounded-b-sm origin-top pixel-art"
          animate={state === 'walking' ? { rotate: [-15, 15, -15] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          {/* Shoe */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-amber-800 rounded-b-sm" />
        </motion.div>

        {/* Right Leg */}
        <motion.div
          className="absolute top-[62%] right-[25%] w-1/5 h-1/3 bg-blue-600 dark:bg-blue-700 rounded-b-sm origin-top pixel-art"
          animate={state === 'walking' ? { rotate: [15, -15, 15] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }}
        >
          {/* Shoe */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-amber-800 rounded-b-sm" />
        </motion.div>

        {/* Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-black/20 rounded-full blur-sm" />
      </div>

      {/* Celebration particles */}
      {state === 'celebrating' && (
        <>
          <motion.div
            className="absolute -top-2 left-0 w-2 h-2 bg-yellow-400"
            animate={{
              y: [-10, -30],
              x: [-10, -20],
              opacity: [1, 0],
              scale: [1, 0.5],
            }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
          />
          <motion.div
            className="absolute -top-2 right-0 w-2 h-2 bg-yellow-400"
            animate={{
              y: [-10, -30],
              x: [10, 20],
              opacity: [1, 0],
              scale: [1, 0.5],
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
          />
        </>
      )}
    </motion.div>
  );
}
