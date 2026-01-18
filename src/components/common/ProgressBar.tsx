import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Star } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'warm';
  animate?: boolean;
  variant?: 'default' | 'warm' | 'pixel';
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  label,
  color = 'warm',
  animate = true,
  variant = 'warm',
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    default: 'bg-gradient-to-r from-sky-400 to-sky-500',
    success: 'bg-gradient-to-r from-green-400 to-green-500',
    warning: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    danger: 'bg-gradient-to-r from-red-400 to-red-500',
    warm: 'bg-gradient-to-r from-warm-400 to-warm-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const trackClasses = {
    default: 'bg-gray-200 dark:bg-slate-700/50',
    warm: 'bg-warm-100 dark:bg-slate-700/50',
    pixel: 'bg-amber-200 dark:bg-slate-700 border-2 border-amber-600 dark:border-amber-500',
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 font-game">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-sm font-semibold text-warm-600 dark:text-warm-400">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          trackClasses[variant],
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            colorClasses[color],
            variant === 'pixel' && 'relative'
          )}
          initial={animate ? { width: 0 } : { width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Shine effect */}
          {variant !== 'pixel' && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface SkillLevelIndicatorProps {
  level: number;
  maxLevel?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SkillLevelIndicator({ level, maxLevel = 5, size = 'md' }: SkillLevelIndicatorProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full',
            sizeClasses[size],
            i < level
              ? 'bg-gradient-to-br from-warm-400 to-warm-500 shadow-sm'
              : 'bg-gray-200 dark:bg-slate-600'
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
        />
      ))}
    </div>
  );
}

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  stars,
  maxStars = 3,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => interactive && onRate?.(i + 1)}
          className={cn(
            interactive && 'cursor-pointer hover:scale-110',
            !interactive && 'cursor-default'
          )}
          whileHover={interactive ? { scale: 1.2 } : {}}
          whileTap={interactive ? { scale: 0.9 } : {}}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
        >
          <Star
            className={cn(
              sizeClasses[size],
              i < stars
                ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                : 'text-gray-300 dark:text-gray-600'
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}
