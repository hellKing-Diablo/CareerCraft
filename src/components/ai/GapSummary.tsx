import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { useGraphStore } from '@/store/graphStore';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';

interface GapSummaryProps {
  compact?: boolean;
}

export function GapSummary({ compact = false }: GapSummaryProps) {
  const { analysis, generateExplanation, analyzeGaps, isConfigured } = useAIStore();
  const { gapAnalysis, currentGraph } = useGraphStore();
  const { userSkills, user } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isLoading, setIsLoading] = useState(false);

  const explanation = analysis.explanation;

  // Run gap analysis when graph changes
  useEffect(() => {
    if (currentGraph && userSkills.length > 0 && !analysis.result) {
      const skills = userSkills.map(s => ({
        skill_id: s.skillId,
        level: s.level,
      }));
      analyzeGaps(skills, currentGraph.targetRoleId);
    }
  }, [currentGraph, userSkills, analysis.result, analyzeGaps]);

  const handleGenerate = async () => {
    if (!analysis.result) {
      // First run gap analysis
      if (currentGraph && userSkills.length > 0) {
        const skills = userSkills.map(s => ({
          skill_id: s.skillId,
          level: s.level,
        }));
        analyzeGaps(skills, currentGraph.targetRoleId);
      }
    }

    setIsLoading(true);
    try {
      const userStage = user?.stage || 'beginner';
      await generateExplanation(userStage);
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-expand if we have data
  useEffect(() => {
    if (explanation && !compact) {
      setIsExpanded(true);
    }
  }, [explanation, compact]);

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game mb-1">
              AI Analysis Available
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Get personalized insights about your skill gaps.
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

  // No gap analysis available
  if (!gapAnalysis) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set a career goal to see AI-powered gap analysis.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (analysis.status === 'loading' || isLoading) {
    return (
      <div className="p-4 rounded-xl bg-cream-50 dark:bg-slate-800/50 border border-warm-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
              Analyzing Your Gaps
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
  if (analysis.status === 'error') {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 font-game mb-1">
              Failed to Generate Analysis
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              {analysis.error?.message || 'Something went wrong'}
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

  // Has explanation - show it
  if (explanation) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
                AI Gap Analysis
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {analysis.result?.readiness.percentage}% ready for your goal
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
              <div className="px-4 pb-4 space-y-4">
                {/* Summary */}
                <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                  <p className="text-sm text-gray-700 dark:text-gray-200">{explanation.summary}</p>
                </div>

                {/* Gap Explanations */}
                {explanation.gap_explanations.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                      <Target size={12} />
                      Key Gaps to Address
                    </h5>
                    <div className="space-y-2">
                      {explanation.gap_explanations.slice(0, compact ? 3 : 5).map((gap, index) => (
                        <div
                          key={gap.skill_id || index}
                          className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-800 dark:text-cream-50">
                              {gap.skill_name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {gap.explanation}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                            <ArrowRight size={10} />
                            {gap.action_hint}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={14} className="text-green-500 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                        Recommendation
                      </h5>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {explanation.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                {explanation.motivation && !compact && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 italic">
                      "{explanation.motivation}"
                    </p>
                  </div>
                )}

                {/* Warnings */}
                {explanation.warnings && explanation.warnings.length > 0 && !compact && (
                  <div>
                    <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Things to Watch
                    </h5>
                    <ul className="space-y-1">
                      {explanation.warnings.map((warning, index) => (
                        <li
                          key={index}
                          className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1"
                        >
                          <span className="text-amber-500 mt-0.5">!</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Idle state - ready to generate
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game mb-1">
            AI Gap Analysis
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Get personalized insights about your skill gaps and a recommended learning path.
          </p>
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            <Sparkles size={14} className="mr-1" />
            Analyze My Gaps
          </Button>
        </div>
      </div>
    </div>
  );
}
