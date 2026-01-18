import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'warm' | 'pixel';
}

export function Card({ children, className, hover = false, onClick, variant = 'default' }: CardProps) {
  const variants = {
    default: cn(
      'bg-white dark:bg-slate-800/90',
      'border border-warm-100 dark:border-slate-700/50',
      'shadow-warm dark:shadow-none'
    ),
    warm: cn(
      'bg-gradient-to-br from-cream-50 to-warm-50 dark:from-slate-800 dark:to-slate-800/90',
      'border border-warm-200 dark:border-warm-800/30',
      'shadow-warm-lg dark:shadow-none'
    ),
    pixel: cn(
      'bg-cream-100 dark:bg-slate-800',
      'border-4 border-amber-700 dark:border-amber-600',
      'shadow-pixel dark:shadow-none'
    ),
  };

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'rounded-2xl p-5',
        variants[variant],
        hover && 'hover:shadow-warm-lg dark:hover:bg-slate-700/90 transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hover || onClick ? { y: -2, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-warm-100 dark:bg-warm-900/30 text-warm-600 dark:text-warm-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-cream-50 font-game">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-warm-100 dark:border-slate-700/50',
        className
      )}
    >
      {children}
    </div>
  );
}
