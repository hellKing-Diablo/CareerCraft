import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Settings,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Badge } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { generateSkillGuidance, isAIConfigured } from '@/services/aiService';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import type { SkillGuidance as SkillGuidanceType, LearningResource } from '@/types/ai';

interface SkillGuidanceProps {
  skillId: string;
  skillName: string;
}

const resourceIcons: Record<LearningResource['type'], typeof BookOpen> = {
  course: BookOpen,
  book: BookOpen,
  tutorial: Lightbulb,
  practice: Sparkles,
  project: Sparkles,
};

export function SkillGuidance({ skillId, skillName }: SkillGuidanceProps) {
  const { skillGuidance, setSkillGuidanceStatus } = useAIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isConfigured = isAIConfigured();

  const guidanceState = skillGuidance[skillId];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSkillGuidanceStatus(skillId, 'loading');

    try {
      const guidance = await generateSkillGuidance(skillId);
      setSkillGuidanceStatus(skillId, 'success', guidance);
      setIsExpanded(true);
    } catch (error) {
      const aiError = error as { code: string; message: string };
      setSkillGuidanceStatus(skillId, 'error', null, {
        code: aiError.code as 'no_api_key' | 'invalid_key' | 'rate_limit' | 'network_error' | 'parse_error' | 'unknown',
        message: aiError.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-expand if we have data
  useEffect(() => {
    if (guidanceState?.data) {
      setIsExpanded(true);
    }
  }, [guidanceState?.data]);

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game mb-1">
              AI Guidance Available
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Get personalized tips for learning {skillName}.
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
  if (guidanceState?.status === 'loading' || isGenerating) {
    return (
      <div className="p-4 rounded-xl bg-cream-50 dark:bg-slate-800/50 border border-warm-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
              Generating Guidance
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Analyzing skill requirements...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (guidanceState?.status === 'error') {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 font-game mb-1">
              Failed to Load Guidance
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              {guidanceState.error?.message || 'Something went wrong'}
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

  // Has data - show expanded guidance
  if (guidanceState?.data) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30 overflow-hidden">
        {/* Header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game">
                AI Guidance
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personalized tips for {skillName}
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
              disabled={isGenerating}
            >
              <RefreshCw size={14} className={cn(isGenerating && 'animate-spin')} />
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
              <GuidanceContent data={guidanceState.data} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Idle state - ready to generate
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-cream-50 font-game mb-1">
            AI Guidance
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Get personalized learning tips for {skillName}.
          </p>
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            <Sparkles size={14} className="mr-1" />
            Get Guidance
          </Button>
        </div>
      </div>
    </div>
  );
}

function GuidanceContent({ data }: { data: SkillGuidanceType }) {
  return (
    <div className="px-4 pb-4 space-y-4">
      {/* Overview */}
      {data.overview && (
        <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
          <p className="text-sm text-gray-700 dark:text-gray-200">{data.overview}</p>
        </div>
      )}

      {/* Why Important */}
      {data.whyImportant && (
        <div>
          <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
            <Lightbulb size={12} />
            Why This Matters
          </h5>
          <p className="text-xs text-gray-600 dark:text-gray-400">{data.whyImportant}</p>
        </div>
      )}

      {/* Learning Tips */}
      {data.learningTips && data.learningTips.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
            <Sparkles size={12} />
            Learning Tips
          </h5>
          <ul className="space-y-1.5">
            {data.learningTips.map((tip, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {data.resources && data.resources.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
            <BookOpen size={12} />
            Resources
          </h5>
          <div className="grid gap-2">
            {data.resources.slice(0, 3).map((resource, index) => {
              const Icon = resourceIcons[resource.type] || BookOpen;
              return (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50"
                >
                  <Icon size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{resource.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{resource.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {data.commonMistakes && data.commonMistakes.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Avoid These Mistakes
          </h5>
          <ul className="space-y-1.5">
            {data.commonMistakes.map((mistake, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">!</span>
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Time Estimates */}
      {data.estimatedTimeToLevel && (
        <div>
          <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
            <Clock size={12} />
            Time to Level Up
          </h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.estimatedTimeToLevel).map(([level, time]) => (
              <Badge key={level} variant="info" size="sm">
                Level {level}: {time}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
