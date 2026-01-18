import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Settings,
  Trophy,
  Target,
  Gamepad2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUserStore } from '@/store/userStore';
import { useGraphStore } from '@/store/graphStore';
import { PixelCharacter } from '@/components/game';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Adventure', emoji: '🗺️' },
  { path: '/skills', icon: Sparkles, label: 'Skills', emoji: '⭐' },
  { path: '/connections', icon: Users, label: 'Party', emoji: '👥' },
  { path: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
];

export function Sidebar() {
  const { user, userAchievements } = useUserStore();
  const { stats } = useGraphStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-warm-100 dark:border-slate-800 flex flex-col z-30 shadow-warm dark:shadow-none">
      {/* Logo */}
      <div className="p-5 border-b border-warm-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center shadow-lg"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <Gamepad2 className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-cream-50 font-game">
              CareerCraft
            </h1>
            <p className="text-xs text-warm-500 dark:text-warm-400 font-medium">
              Level Up Your Career
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                'text-gray-600 dark:text-gray-400',
                'hover:bg-warm-50 dark:hover:bg-slate-800/50',
                isActive && [
                  'bg-gradient-to-r from-warm-100 to-warm-50 dark:from-warm-900/30 dark:to-transparent',
                  'text-warm-700 dark:text-warm-400',
                  'border border-warm-200 dark:border-warm-800/30',
                  'shadow-sm'
                ]
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-lg"
                >
                  {item.emoji}
                </motion.span>
                <span className="font-semibold font-game">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-2 h-2 rounded-full bg-warm-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Stats Summary */}
      {stats && (
        <div className="p-4 border-t border-warm-100 dark:border-slate-800">
          <div className="bg-gradient-to-br from-cream-50 to-warm-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-warm-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <Target size={16} className="text-warm-500" />
              <span className="font-semibold font-game">Quest Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                <span className="text-gray-800 dark:text-cream-50 font-bold">
                  {stats.completedNodes}/{stats.totalNodes}
                </span>
              </div>
              <div className="w-full h-3 bg-warm-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-warm-400 to-warm-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Preview */}
      <div className="p-4 border-t border-warm-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Trophy size={16} className="text-yellow-500" />
            <span className="font-semibold font-game">Trophies</span>
          </div>
          <span className="text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-bold">
            {userAchievements.length}
          </span>
        </div>
        <div className="flex gap-2">
          {userAchievements.slice(0, 5).map((ua, i) => (
            <motion.div
              key={ua.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-500/20 dark:to-orange-500/20 border border-yellow-300 dark:border-yellow-500/30 flex items-center justify-center shadow-sm"
            >
              <Trophy size={16} className="text-yellow-600 dark:text-yellow-400" />
            </motion.div>
          ))}
          {userAchievements.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              Complete quests to earn trophies!
            </p>
          )}
        </div>
      </div>

      {/* User Profile with Character */}
      {user && (
        <div className="p-4 border-t border-warm-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <PixelCharacter size="sm" state="idle" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-cream-50 truncate font-game">
                {user.name}
              </p>
              <p className="text-xs text-warm-500 dark:text-warm-400 capitalize font-medium">
                {user.stage} Adventurer
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
