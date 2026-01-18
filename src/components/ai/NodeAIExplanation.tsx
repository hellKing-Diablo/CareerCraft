import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Settings,
  Target,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import type { NodeExplanation } from '@/services/ai/ResponseParser';

interface NodeAIExplanationProps {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  state: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  blockedBy: string[];
  unlocks: string[];
  targetRoleId: string;
  userId?: string;
}

export function NodeAIExplanation({
  skillId,
  skillName,
  currentLevel,
  requiredLevel,
  state,
  blockedBy,
  unlocks,
  targetRoleId,
  userId = 'current_user',
}: NodeAIExplanationProps) {
  const { nodeExplanations, getNodeExplanation, isConfigured } = useAIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const explanationState = nodeExplanations[skillId];
  const explanation = explanationState?.data;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      await getNodeExplanation(skillId, userId, targetRoleId, {
        skill_name: skillName,
        current_level: currentLevel,
        required_level: requiredLevel,
        state,
        blocked_by: blockedBy,
        unlocks,
      });
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-expand if we have data
  useEffect(() => {
    if (explanation) {
      setIsExpanded(true);
    }
  }, [explanation]);

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game mb-1">
              AI Insights Available
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Get personalized guidance for {skillName}.
            </p>
            <Link to="/settings">
              <Button variant="secondary" size="sm">
                <Settings size={14} className="mr-1" />
                Configure AI
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (explanationState?.status === 'loading' || isLoading) {
    return (
      <div className="p-4 rounded-xl bg-cream-50 dark:bg-slate-800/50 border border-warm-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
              Analyzing Skill
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generating personalized insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (explanationState?.status === 'error') {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 font-game mb-1">
              Failed to Load Insights
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              {explanationState.error?.message || 'Something went wrong'}
            </p>
            <Button variant="secondary" size="sm" onClick={handleGenerate}>
              <RefreshCw size={14} className="mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Has data - show explanation
  if (explanation) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
        {/* Header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
                AI Insights
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personalized guidance for this skill
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
            </Button>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ExplanationContent data={explanation} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Idle state - ready to generate
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game mb-1">
            AI Insights
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Get personalized guidance for mastering {skillName}.
          </p>
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            <Sparkles size={14} className="mr-1" />
            Get Insights
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExplanationContent({ data }: { data: NodeExplanation }) {
  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Why Important */}
      <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
        <div className="flex items-start gap-2">
          <Target size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
              Why This Matters
            </h5>
            <p className="text-sm text-gray-700 dark:text-gray-200">{data.why_important}</p>
          </div>
        </div>
      </div>

      {/* Current State */}
      <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
              Your Current State
            </h5>
            <p className="text-sm text-gray-700 dark:text-gray-200">{data.current_state}</p>
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
        <div className="flex items-start gap-2">
          <ArrowRight size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
              Recommended Next Step
            </h5>
            <p className="text-sm text-gray-700 dark:text-gray-200">{data.next_action}</p>
          </div>
        </div>
      </div>

      {/* Estimated Effort */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/30">
        <Clock size={16} className="text-indigo-500" />
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {data.estimated_effort}
        </span>
      </div>
    </div>
  );
}
