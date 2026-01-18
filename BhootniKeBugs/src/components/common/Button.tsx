import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  pixelStyle?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', pixelStyle = false, children, disabled, type = 'button', ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'hover:scale-[1.02] active:scale-[0.98]',
      pixelStyle ? 'font-pixel text-xs' : 'font-game'
    );

    const variantStyles = {
      primary: cn(
        'bg-gradient-to-b from-warm-400 to-warm-500 text-white',
        'hover:from-warm-500 hover:to-warm-600',
        'shadow-[0_4px_0_0_#BD4516]',
        'hover:shadow-[0_6px_0_0_#BD4516]',
        'active:shadow-[0_2px_0_0_#BD4516] active:translate-y-0.5',
        'focus:ring-warm-400 focus:ring-offset-cream-50 dark:focus:ring-offset-slate-900',
        'dark:from-warm-500 dark:to-warm-600'
      ),
      secondary: cn(
        'bg-gradient-to-b from-cream-100 to-cream-200 text-warm-700',
        'hover:from-cream-200 hover:to-cream-300',
        'border border-warm-200',
        'shadow-[0_4px_0_0_#F9C093]',
        'hover:shadow-[0_6px_0_0_#F9C093]',
        'active:shadow-[0_2px_0_0_#F9C093] active:translate-y-0.5',
        'focus:ring-warm-300 focus:ring-offset-cream-50 dark:focus:ring-offset-slate-900',
        'dark:from-slate-700 dark:to-slate-800 dark:text-cream-100 dark:border-slate-600',
        'dark:shadow-[0_4px_0_0_#1e293b]'
      ),
      ghost: cn(
        'bg-transparent text-warm-600',
        'hover:bg-warm-100/50',
        'dark:text-warm-400 dark:hover:bg-slate-800',
        'focus:ring-warm-300 focus:ring-offset-cream-50 dark:focus:ring-offset-slate-900'
      ),
      danger: cn(
        'bg-gradient-to-b from-red-500 to-red-600 text-white',
        'hover:from-red-600 hover:to-red-700',
        'shadow-[0_4px_0_0_#991b1b]',
        'hover:shadow-[0_6px_0_0_#991b1b]',
        'active:shadow-[0_2px_0_0_#991b1b] active:translate-y-0.5',
        'focus:ring-red-400 focus:ring-offset-cream-50 dark:focus:ring-offset-slate-900'
      ),
      success: cn(
        'bg-gradient-to-b from-green-500 to-green-600 text-white',
        'hover:from-green-600 hover:to-green-700',
        'shadow-[0_4px_0_0_#166534]',
        'hover:shadow-[0_6px_0_0_#166534]',
        'active:shadow-[0_2px_0_0_#166534] active:translate-y-0.5',
        'focus:ring-green-400 focus:ring-offset-cream-50 dark:focus:ring-offset-slate-900'
      ),
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
