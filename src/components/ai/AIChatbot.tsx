import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Map, Target, ChevronRight } from 'lucide-react';
import { DashboardInsights } from './DashboardInsights';
import { LearningPath } from './LearningPath';
import { GapImprovementPlan } from './GapImprovementPlan';
import { useAIStore } from '@/store/aiStore';
import { cn } from '@/utils/cn';

type AITab = 'insights' | 'learning' | 'gaps';

interface TabConfig {
  id: AITab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'insights',
    label: 'AI Insights',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Career recommendations',
  },
  {
    id: 'learning',
    label: 'Learning Path',
    icon: <Map className="w-4 h-4" />,
    description: 'Step-by-step roadmap',
  },
  {
    id: 'gaps',
    label: 'Gap Plan',
    icon: <Target className="w-4 h-4" />,
    description: 'Improvement actions',
  },
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('insights');
  const { isConfigured } = useAIStore();

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-warm-500 to-warm-600',
          'hover:from-warm-600 hover:to-warm-700',
          'flex items-center justify-center',
          'border-2 border-white/20',
          isOpen && 'rotate-180'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse indicator when not configured */}
        {!isConfigured && !isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'fixed bottom-24 right-6 z-40',
              'w-[420px] max-h-[70vh]',
              'bg-white dark:bg-slate-900',
              'rounded-2xl shadow-2xl',
              'border border-gray-200 dark:border-slate-700',
              'overflow-hidden flex flex-col'
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-warm-500 to-warm-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Career Assistant</h3>
                  <p className="text-sm text-white/80">
                    {isConfigured ? 'Ready to help' : 'Configure API key in Settings'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 px-2',
                    'text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'text-warm-600 dark:text-warm-400 border-b-2 border-warm-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'insights' && <DashboardInsights compact />}
                  {activeTab === 'learning' && <LearningPath compact />}
                  {activeTab === 'gaps' && <GapImprovementPlan compact />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
              <div className="flex gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex items-center gap-2 p-2 rounded-lg text-xs',
                      'transition-colors',
                      activeTab === tab.id
                        ? 'bg-warm-100 dark:bg-warm-900/30 text-warm-700 dark:text-warm-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    )}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.description}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
