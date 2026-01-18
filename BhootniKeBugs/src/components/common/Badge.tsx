import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'warm' | 'pixel';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  animate = false,
}: BadgeProps) {
  const variantClasses = {
    default: cn(
      'bg-gray-100 text-gray-700',
      'dark:bg-slate-700 dark:text-gray-300'
    ),
    success: cn(
      'bg-green-100 text-green-700',
      'dark:bg-green-500/20 dark:text-green-400'
    ),
    warning: cn(
      'bg-yellow-100 text-yellow-700',
      'dark:bg-yellow-500/20 dark:text-yellow-400'
    ),
    danger: cn(
      'bg-red-100 text-red-700',
      'dark:bg-red-500/20 dark:text-red-400'
    ),
    info: cn(
      'bg-sky-100 text-sky-700',
      'dark:bg-sky-500/20 dark:text-sky-400'
    ),
    warm: cn(
      'bg-warm-100 text-warm-700',
      'dark:bg-warm-500/20 dark:text-warm-400'
    ),
    pixel: cn(
      'bg-cream-200 text-amber-800',
      'border-2 border-amber-600',
      'dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500'
    ),
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const Component = animate ? motion.span : 'span';
  const motionProps = animate
    ? {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', stiffness: 300 },
      }
    : {};

  return (
    <Component
      className={cn(
        'inline-flex items-center font-medium font-game',
        variant === 'pixel' ? 'rounded-sm' : 'rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

interface StatusBadgeProps {
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    locked: { label: 'Locked', variant: 'default' as const, icon: '🔒' },
    unlocked: { label: 'Ready', variant: 'info' as const, icon: '✨' },
    in_progress: { label: 'In Progress', variant: 'warning' as const, icon: '⚡' },
    completed: { label: 'Completed', variant: 'success' as const, icon: '✓' },
  };

  const { label, variant, icon } = config[status];

  return (
    <Badge variant={variant} animate>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: 'critical' | 'important' | 'nice_to_have';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    critical: { label: 'Critical', variant: 'danger' as const },
    important: { label: 'Important', variant: 'warning' as const },
    nice_to_have: { label: 'Nice to Have', variant: 'default' as const },
  };

  const { label, variant } = config[priority];

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

interface TierBadgeProps {
  tier: number;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const config: Record<number, { label: string; variant: BadgeProps['variant'] }> = {
    1: { label: 'Beginner', variant: 'default' },
    2: { label: 'Intermediate', variant: 'info' },
    3: { label: 'Advanced', variant: 'warning' },
    4: { label: 'Expert', variant: 'warm' },
    5: { label: 'Master', variant: 'success' },
  };

  const { label, variant } = config[tier] || config[1];

  return (
    <Badge variant={variant} size="sm">
      Tier {tier}: {label}
    </Badge>
  );
}
