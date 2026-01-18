import { motion } from 'framer-motion';
import { Lock, Star, CheckCircle, Circle, Sparkles } from 'lucide-react';

interface LevelNodeProps {
  level: number;
  name: string;
  state: 'locked' | 'available' | 'current' | 'completed' | 'mastered';
  stars?: number;
  onClick?: () => void;
  className?: string;
}

export function LevelNode({
  level,
  name,
  state,
  stars = 0,
  onClick,
  className = '',
}: LevelNodeProps) {
  const stateStyles = {
    locked: {
      bg: 'bg-gray-300 dark:bg-gray-600',
      border: 'border-gray-400 dark:border-gray-500',
      text: 'text-gray-500 dark:text-gray-400',
      icon: Lock,
      glow: '',
    },
    available: {
      bg: 'bg-cream-100 dark:bg-slate-700',
      border: 'border-warm-300 dark:border-warm-500',
      text: 'text-warm-600 dark:text-warm-400',
      icon: Circle,
      glow: '',
    },
    current: {
      bg: 'bg-warm-100 dark:bg-warm-900/50',
      border: 'border-warm-500 dark:border-warm-400',
      text: 'text-warm-700 dark:text-warm-300',
      icon: Sparkles,
      glow: 'shadow-glow',
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/50',
      border: 'border-green-500 dark:border-green-400',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle,
      glow: '',
    },
    mastered: {
      bg: 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50',
      border: 'border-yellow-500 dark:border-yellow-400',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: Star,
      glow: 'shadow-glow',
    },
  };

  const style = stateStyles[state];
  const Icon = style.icon;
  const isClickable = state !== 'locked';

  return (
    <motion.div
      className={`relative flex flex-col items-center ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Level number flag */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
        <div className="relative">
          {/* Flag pole */}
          <div className="w-1 h-8 bg-amber-700 dark:bg-amber-600 mx-auto" />
          {/* Flag */}
          <motion.div
            className="absolute top-0 left-1 w-8 h-5 bg-warm-500 dark:bg-warm-400 flex items-center justify-center"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              clipPath: 'polygon(0 0, 100% 20%, 100% 80%, 0 100%)',
            }}
          >
            <span className="text-xs font-bold text-white">{level}</span>
          </motion.div>
        </div>
      </div>

      {/* Main node button */}
      <motion.button
        onClick={isClickable ? onClick : undefined}
        className={`
          relative w-16 h-16 rounded-full
          ${style.bg} ${style.text}
          border-4 ${style.border}
          ${style.glow}
          flex items-center justify-center
          transition-all duration-200
          ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'}
        `}
        whileHover={isClickable ? { scale: 1.1 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
      >
        <Icon className="w-6 h-6" />

        {/* Sparkle effects for current/mastered */}
        {(state === 'current' || state === 'mastered') && (
          <>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              style={{
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
          </>
        )}
      </motion.button>

      {/* Stars display */}
      {state !== 'locked' && (
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: starNum * 0.1, type: 'spring' }}
            >
              <Star
                className={`w-4 h-4 ${
                  starNum <= stars
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Skill name label */}
      <div
        className={`
          mt-2 px-3 py-1 rounded-lg
          bg-white/80 dark:bg-gray-800/80
          backdrop-blur-sm
          border border-gray-200 dark:border-gray-700
          max-w-24 text-center
        `}
      >
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
          {name}
        </span>
      </div>
    </motion.div>
  );
}
