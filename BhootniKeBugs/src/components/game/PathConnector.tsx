import { motion } from 'framer-motion';

interface PathConnectorProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  variant?: 'dotted' | 'solid' | 'bridge';
  completed?: boolean;
  className?: string;
}

export function PathConnector({
  from,
  to,
  variant = 'dotted',
  completed = false,
  className = '',
}: PathConnectorProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const baseColor = completed
    ? 'bg-green-400 dark:bg-green-500'
    : 'bg-amber-400 dark:bg-amber-500';

  if (variant === 'dotted') {
    const numDots = Math.floor(length / 20);

    return (
      <div
        className={`absolute pointer-events-none ${className}`}
        style={{
          left: from.x,
          top: from.y,
          width: length,
          height: 8,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'left center',
        }}
      >
        <div className="flex items-center justify-around h-full">
          {Array.from({ length: numDots }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${baseColor}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: completed ? 1 : 0.5 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'bridge') {
    return (
      <div
        className={`absolute pointer-events-none ${className}`}
        style={{
          left: from.x,
          top: from.y,
          width: length,
          height: 16,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'left center',
        }}
      >
        {/* Bridge planks */}
        <div className="flex items-end justify-between h-full px-2">
          {Array.from({ length: Math.floor(length / 15) }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-3 bg-amber-700 dark:bg-amber-600 rounded-sm"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.03 }}
            />
          ))}
        </div>
        {/* Rope lines */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-800 dark:bg-amber-700" />
        <div className="absolute top-2 left-0 right-0 h-0.5 bg-amber-800/50 dark:bg-amber-700/50" />
      </div>
    );
  }

  // Solid variant
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: from.x,
        top: from.y,
        width: length,
        height: 4,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'left center',
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`w-full h-full ${baseColor} rounded-full`} />
    </motion.div>
  );
}
