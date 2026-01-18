import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  RefreshCw,
  AlertCircle,
  Settings,
  Rocket,
  Target,
  Clock,
  ArrowUp,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, Button, Badge } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { generateGapImprovementPlan, isAIConfigured } from '@/services/aiService';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import type { ImprovementAction, GapImprovementPlan as GapImprovementPlanType } from '@/types/ai';

const effortColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const impactColors = {
  low: 'from-gray-400 to-gray-500',
  medium: 'from-amber-400 to-orange-500',
  high: 'from-emerald-400 to-green-500',
};

interface GapImprovementPlanProps {
  compact?: boolean;
}

export function GapImprovementPlan({ compact = false }: GapImprovementPlanProps) {
  const { gapImprovementPlan, setGapImprovementPlanStatus } = useAIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'strategic' | 'long'>('quick');
  const isConfigured = isAIConfigured();

  // Wrapper component based on compact mode
  const Wrapper = compact ? 'div' : Card;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGapImprovementPlanStatus('loading');

    try {
      const plan = await generateGapImprovementPlan();
      setGapImprovementPlanStatus('success', plan);
    } catch (error) {
      const aiError = error as { code: string; message: string };
      setGapImprovementPlanStatus('error', null, {
        code: aiError.code as 'no_api_key' | 'invalid_key' | 'rate_limit' | 'network_error' | 'parse_error' | 'unknown',
        message: aiError.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Not configured state
  if (!isConfigured) {
    return (
      <Wrapper className={compact ? '' : 'relative overflow-hidden'}>
        {!compact && <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10" />}
        <div className={compact ? 'text-center py-4' : 'relative text-center py-6'}>
          <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} mx-auto rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center`}>
            <Zap className={compact ? 'w-6 h-6 text-orange-500' : 'w-8 h-8 text-orange-500 dark:text-orange-400'} />
          </div>
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-800 dark:text-cream-50 font-game mb-2`}>
            Gap Improvement Plan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
            Get strategic actions to close your skill gaps.
          </p>
          <Link to="/settings">
            <Button variant="primary" size={compact ? 'sm' : 'md'}>
              <Settings size={14} className="mr-2" />
              Configure API Key
            </Button>
          </Link>
        </div>
      </Wrapper>
    );
  }

  // Loading state
  if (gapImprovementPlan.status === 'loading' || isGenerating) {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="Gap Improvement Plan"
            subtitle="Analyzing your gaps..."
            icon={<Zap className="w-5 h-5" />}
          />
        )}
        <div className={`flex flex-col items-center justify-center ${compact ? 'py-6' : 'py-8'}`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={`${compact ? 'w-10 h-10 mb-3' : 'w-12 h-12 mb-4'} rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center`}
          >
            <Zap className={compact ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
          </motion.div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Creating your plan...</p>
        </div>
      </Wrapper>
    );
  }

  // Error state
  if (gapImprovementPlan.status === 'error') {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="Gap Improvement Plan"
            subtitle="Something went wrong"
            icon={<Zap className="w-5 h-5" />}
          />
        )}
        <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
          <div className={`${compact ? 'w-10 h-10 mb-2' : 'w-12 h-12 mb-3'} mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center`}>
            <AlertCircle className={compact ? 'w-5 h-5 text-red-500' : 'w-6 h-6 text-red-500'} />
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {gapImprovementPlan.error?.message || 'Failed to generate plan'}
          </p>
          <Button variant="secondary" size={compact ? 'sm' : 'md'} onClick={handleGenerate}>
            <RefreshCw size={14} className="mr-2" />
            Try Again
          </Button>
        </div>
      </Wrapper>
    );
  }

  // Has data
  if (gapImprovementPlan.data) {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="Gap Improvement Plan"
            subtitle="Strategic actions to close gaps"
            icon={<Zap className="w-5 h-5" />}
            action={
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                <RefreshCw size={14} className={cn(isGenerating && 'animate-spin')} />
              </Button>
            }
          />
        )}
        {compact && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Strategic actions
            </span>
            <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw size={12} className={cn(isGenerating && 'animate-spin')} />
            </Button>
          </div>
        )}
        <PlanContent
          data={gapImprovementPlan.data}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          compact={compact}
        />
      </Wrapper>
    );
  }

  // Idle state - ready to generate
  return (
    <Wrapper>
      {!compact && (
        <CardHeader
          title="Gap Improvement Plan"
          subtitle="Strategic actions to close gaps"
          icon={<Zap className="w-5 h-5" />}
        />
      )}
      <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
        <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} mx-auto rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center`}>
          <Zap className={compact ? 'w-6 h-6 text-orange-500' : 'w-8 h-8 text-orange-500 dark:text-orange-400'} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generate a strategic plan with quick wins.
        </p>
        <Button variant="primary" size={compact ? 'sm' : 'md'} onClick={handleGenerate}>
          <Zap size={14} className="mr-2" />
          Generate Plan
        </Button>
      </div>
    </Wrapper>
  );
}

// Keep backward compatible export
export { GapImprovementPlan as GapImprovementPlanCard };

function PlanContent({
  data,
  activeTab,
  setActiveTab,
  compact = false
}: {
  data: GapImprovementPlanType;
  activeTab: 'quick' | 'strategic' | 'long';
  setActiveTab: (tab: 'quick' | 'strategic' | 'long') => void;
  compact?: boolean;
}) {
  const tabs = [
    { id: 'quick' as const, label: 'Quick', icon: Rocket, count: data.quickWins.length },
    { id: 'strategic' as const, label: 'Strategic', icon: Target, count: data.strategicActions.length },
    { id: 'long' as const, label: 'Long-term', icon: ArrowUp, count: data.longTermGoals.length },
  ];

  const currentActions =
    activeTab === 'quick'
      ? data.quickWins
      : activeTab === 'strategic'
      ? data.strategicActions
      : data.longTermGoals;

  const actionsToShow = compact ? currentActions.slice(0, 3) : currentActions;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Summary */}
      {data.summary && (
        <div className={`${compact ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800/30`}>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-200`}>{data.summary}</p>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex gap-1 p-1 bg-cream-100 dark:bg-slate-800/50 rounded-xl`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 rounded-lg transition-all',
                compact ? 'py-1.5 px-2 text-xs' : 'py-2 px-3 text-sm',
                'font-medium',
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-800 dark:text-cream-50'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Icon size={compact ? 10 : 14} />
              <span>{tab.label}</span>
              {!compact && tab.count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                    : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-gray-300'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions List */}
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <AnimatePresence mode="wait">
          {actionsToShow.length > 0 ? (
            actionsToShow.map((action, index) => (
              <ActionCard key={`${activeTab}-${index}`} action={action} index={index} compact={compact} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center ${compact ? 'py-4' : 'py-6'} text-gray-500 dark:text-gray-400 text-sm`}
            >
              No actions
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weekly Plan - hide in compact mode */}
      {!compact && data.weeklyPlan && data.weeklyPlan.length > 0 && (
        <div className="pt-4 border-t border-warm-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-game flex items-center gap-2">
            <Calendar size={14} />
            Weekly Focus
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {data.weeklyPlan.slice(0, 4).map((week, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-cream-50 dark:bg-slate-800/50 border border-warm-100 dark:border-slate-700"
              >
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                  Week {index + 1}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{week}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action, index, compact = false }: { action: ImprovementAction; index: number; compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-start gap-2 ${compact ? 'p-2' : 'p-3'} rounded-xl bg-cream-50 dark:bg-slate-800/50 border border-warm-100 dark:border-slate-700`}
    >
      {/* Impact indicator */}
      <div className={cn(`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0`, impactColors[action.impact])}>
        <ArrowUp size={compact ? 12 : 16} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-800 dark:text-cream-50 font-game`}>
            {action.skillName}
          </h4>
          {!compact && (
            <Badge className={cn('text-xs', effortColors[action.effort])} size="sm">
              {action.effort}
            </Badge>
          )}
        </div>
        <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-600 dark:text-gray-400 ${compact ? 'mb-1 line-clamp-1' : 'mb-2'}`}>{action.action}</p>
        <div className={`flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
          <Clock size={compact ? 10 : 12} />
          {action.timeframe}
          {!compact && (
            <>
              <ArrowRight size={12} className="mx-0.5" />
              <span className={cn(
                'font-medium',
                action.impact === 'high' ? 'text-emerald-600 dark:text-emerald-400' :
                action.impact === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600'
              )}>
                {action.impact} impact
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
