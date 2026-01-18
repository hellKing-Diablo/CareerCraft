import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  variant?: 'default' | 'warm' | 'pixel';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  variant = 'default',
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const variants = {
    default: cn(
      'bg-white dark:bg-slate-800',
      'border border-warm-200 dark:border-slate-700',
      'shadow-warm-lg dark:shadow-2xl'
    ),
    warm: cn(
      'bg-gradient-to-br from-cream-50 to-warm-50 dark:from-slate-800 dark:to-slate-900',
      'border border-warm-300 dark:border-warm-800/30',
      'shadow-warm-lg'
    ),
    pixel: cn(
      'bg-cream-100 dark:bg-slate-800',
      'border-4 border-amber-700 dark:border-amber-600',
      'shadow-pixel-lg'
    ),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={cn(
                'relative rounded-2xl',
                'max-h-[90vh] overflow-y-auto',
                variants[variant],
                size === 'sm' && 'w-full max-w-sm',
                size === 'md' && 'w-full max-w-md',
                size === 'lg' && 'w-full max-w-lg',
                size === 'xl' && 'w-full max-w-2xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-5 border-b border-warm-100 dark:border-slate-700">
                  {title && (
                    <h2 className="text-xl font-bold text-gray-800 dark:text-cream-50 font-game">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className={cn(
                        'p-2 rounded-xl',
                        'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                        'hover:bg-warm-100 dark:hover:bg-slate-700',
                        'transition-colors'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
