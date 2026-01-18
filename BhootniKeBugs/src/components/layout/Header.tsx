import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useGraphStore } from '@/store/graphStore';
import { useThemeStore } from '@/store/themeStore';
import { ProgressBar } from '@/components/common';
import { getRoleById } from '@/data/roleBenchmarks';

const pageTitles: Record<string, { title: string; emoji: string }> = {
  '/': { title: 'Skill Journey', emoji: '🗺️' },
  '/skills': { title: 'My Skills', emoji: '⭐' },
  '/connections': { title: 'Party Members', emoji: '👥' },
  '/settings': { title: 'Settings', emoji: '⚙️' },
};

export function Header() {
  const location = useLocation();
  const { gapAnalysis, currentGraph } = useGraphStore();
  const { theme, toggleTheme } = useThemeStore();

  const pageInfo = pageTitles[location.pathname] || { title: 'CareerCraft', emoji: '🎮' };
  const targetRole = currentGraph ? getRoleById(currentGraph.targetRoleId) : null;

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-warm-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Page Title & Role Target */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {pageInfo.emoji}
          </motion.span>
          <h1 className="text-xl font-bold text-gray-800 dark:text-cream-50 font-game">
            {pageInfo.title}
          </h1>
        </div>

        {targetRole && gapAnalysis && location.pathname === '/' && (
          <div className="flex items-center gap-4 pl-6 border-l border-warm-200 dark:border-slate-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Target Quest</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
                {targetRole.roleName}
              </p>
            </div>
            <div className="w-36">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Readiness</p>
              <ProgressBar
                value={gapAnalysis.readinessScore}
                size="sm"
                color={
                  gapAnalysis.readinessScore >= 80 ? 'success' :
                  gapAnalysis.readinessScore >= 50 ? 'warning' : 'danger'
                }
              />
            </div>
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-900/30 dark:to-warm-800/30 border border-warm-300 dark:border-warm-700/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg font-bold text-warm-600 dark:text-warm-400">
                {gapAnalysis.readinessScore}%
              </span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-warm-600 dark:hover:text-warm-400 hover:bg-warm-50 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </motion.button>

        {/* Search */}
        <motion.button
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-warm-600 dark:hover:text-warm-400 hover:bg-warm-50 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search size={20} />
        </motion.button>

        {/* Notifications */}
        <motion.button
          className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-warm-600 dark:hover:text-warm-400 hover:bg-warm-50 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={20} />
          <motion.span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-warm-500 rounded-full border-2 border-white dark:border-slate-900"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.button>
      </div>
    </header>
  );
}
