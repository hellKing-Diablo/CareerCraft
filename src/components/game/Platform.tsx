import { motion } from 'framer-motion';

interface PlatformProps {
  width?: number;
  variant?: 'grass' | 'stone' | 'gold' | 'checkpoint';
  className?: string;
  children?: React.ReactNode;
}

export function Platform({
  width = 120,
  variant = 'grass',
  className = '',
  children,
}: PlatformProps) {
  const variants = {
    grass: {
      top: 'bg-gradient-to-b from-green-400 to-green-500 dark:from-green-600 dark:to-green-700',
      bottom: 'bg-gradient-to-b from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800',
      accent: 'bg-green-300 dark:bg-green-500',
    },
    stone: {
      top: 'bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600',
      bottom: 'bg-gradient-to-b from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800',
      accent: 'bg-gray-300 dark:bg-gray-400',
    },
    gold: {
      top: 'bg-gradient-to-b from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600',
      bottom: 'bg-gradient-to-b from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
      accent: 'bg-yellow-300 dark:bg-yellow-400',
    },
    checkpoint: {
      top: 'bg-gradient-to-b from-warm-400 to-warm-500 dark:from-warm-500 dark:to-warm-600',
      bottom: 'bg-gradient-to-b from-warm-600 to-warm-700 dark:from-warm-700 dark:to-warm-800',
      accent: 'bg-warm-300 dark:bg-warm-400',
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width }}
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Grass/Top layer */}
      <div className={`relative h-4 ${style.top} rounded-t-lg overflow-hidden`}>
        {/* Grass tufts */}
        {variant === 'grass' && (
          <div className="absolute top-0 left-0 right-0 flex justify-around">
            {Array.from({ length: Math.floor(width / 20) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 ${style.accent} rounded-t-full -translate-y-1`}
                style={{ marginLeft: `${(i * 3) % 5}px` }}
              />
            ))}
          </div>
        )}
        {/* Stone/Gold texture dots */}
        {(variant === 'stone' || variant === 'gold') && (
          <div className="absolute inset-0 flex flex-wrap gap-2 p-1 opacity-30">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full" />
            ))}
          </div>
        )}
      </div>

      {/* Main platform body */}
      <div className={`h-8 ${style.bottom} relative overflow-hidden`}>
        {/* Brick/Block pattern */}
        <div className="absolute inset-0 grid grid-cols-4 gap-px">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border-r border-b border-black/10 dark:border-black/20"
            />
          ))}
        </div>
      </div>

      {/* Bottom shadow */}
      <div className="h-2 bg-gradient-to-b from-black/20 to-transparent rounded-b-sm" />

      {/* Content on platform */}
      {children && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          {children}
        </div>
      )}
    </motion.div>
  );
}
