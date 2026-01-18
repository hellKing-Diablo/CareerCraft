import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Settings,
  ChevronRight,
  Lightbulb,
  Target,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Card, CardHeader, Button, Badge } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { generateDashboardInsights, isAIConfigured } from '@/services/aiService';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import type { CareerInsight, DashboardInsights as DashboardInsightsType } from '@/types/ai';

const priorityIcons = {
  high: TrendingUp,
  medium: Target,
  low: Lightbulb,
};

const priorityColors = {
  high: 'from-red-400 to-rose-500',
  medium: 'from-amber-400 to-orange-500',
  low: 'from-green-400 to-emerald-500',
};

interface DashboardInsightsProps {
  compact?: boolean;
}

export function DashboardInsights({ compact = false }: DashboardInsightsProps) {
  const { dashboardInsights, setDashboardInsightsStatus } = useAIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const isConfigured = isAIConfigured();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDashboardInsightsStatus('loading');

    try {
      const insights = await generateDashboardInsights();
      setDashboardInsightsStatus('success', insights);
    } catch (error) {
      const aiError = error as { code: string; message: string };
      setDashboardInsightsStatus('error', null, {
        code: aiError.code as 'no_api_key' | 'invalid_key' | 'rate_limit' | 'network_error' | 'parse_error' | 'unknown',
        message: aiError.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Wrapper component based on compact mode
  const Wrapper = compact ? 'div' : Card;

  // Not configured state
  if (!isConfigured) {
    return (
      <Wrapper className={compact ? '' : 'relative overflow-hidden'}>
        {!compact && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10" />}
        <div className={compact ? 'text-center py-4' : 'relative text-center py-6'}>
          <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center`}>
            <Sparkles className={compact ? 'w-6 h-6 text-purple-500' : 'w-8 h-8 text-purple-500 dark:text-purple-400'} />
          </div>
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-800 dark:text-cream-50 font-game mb-2`}>
            AI Career Insights
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
            Get personalized career recommendations.
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
  if (dashboardInsights.status === 'loading' || isGenerating) {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="AI Career Insights"
            subtitle="Analyzing your profile..."
            icon={<Sparkles className="w-5 h-5" />}
          />
        )}
        <div className={`flex flex-col items-center justify-center ${compact ? 'py-6' : 'py-8'}`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={`${compact ? 'w-10 h-10 mb-3' : 'w-12 h-12 mb-4'} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center`}
          >
            <Sparkles className={compact ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
          </motion.div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generating insights...</p>
        </div>
      </Wrapper>
    );
  }

  // Error state
  if (dashboardInsights.status === 'error') {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="AI Career Insights"
            subtitle="Something went wrong"
            icon={<Sparkles className="w-5 h-5" />}
          />
        )}
        <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
          <div className={`${compact ? 'w-10 h-10 mb-2' : 'w-12 h-12 mb-3'} mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center`}>
            <AlertCircle className={compact ? 'w-5 h-5 text-red-500' : 'w-6 h-6 text-red-500'} />
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {dashboardInsights.error?.message || 'Failed to generate insights'}
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
  if (dashboardInsights.data) {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="AI Career Insights"
            subtitle={dashboardInsights.lastFetched ? `Updated ${formatTimeAgo(dashboardInsights.lastFetched)}` : undefined}
            icon={<Sparkles className="w-5 h-5" />}
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
              {dashboardInsights.lastFetched ? `Updated ${formatTimeAgo(dashboardInsights.lastFetched)}` : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw size={12} className={cn(isGenerating && 'animate-spin')} />
            </Button>
          </div>
        )}
        <InsightsContent data={dashboardInsights.data} compact={compact} />
      </Wrapper>
    );
  }

  // Idle state - ready to generate
  return (
    <Wrapper>
      {!compact && (
        <CardHeader
          title="AI Career Insights"
          subtitle="Get personalized recommendations"
          icon={<Sparkles className="w-5 h-5" />}
        />
      )}
      <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
        <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center`}>
          <Sparkles className={compact ? 'w-6 h-6 text-purple-500' : 'w-8 h-8 text-purple-500 dark:text-purple-400'} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generate AI-powered insights based on your skills and goals.
        </p>
        <Button variant="primary" size={compact ? 'sm' : 'md'} onClick={handleGenerate}>
          <Sparkles size={14} className="mr-2" />
          Generate Insights
        </Button>
      </div>
    </Wrapper>
  );
}

function InsightsContent({ data, compact = false }: { data: DashboardInsightsType; compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Summary */}
      <div className={`${compact ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30`}>
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-200`}>{data.summary}</p>
      </div>

      {/* Insights */}
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <AnimatePresence>
          {(compact ? data.insights.slice(0, 3) : data.insights).map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} compact={compact} />
          ))}
        </AnimatePresence>
      </div>

      {/* Next Steps */}
      {data.nextSteps.length > 0 && (
        <div className={`${compact ? 'pt-3' : 'pt-4'} border-t border-warm-100 dark:border-slate-700`}>
          <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-700 dark:text-gray-300 mb-2 font-game flex items-center gap-2`}>
            <Target size={compact ? 12 : 14} />
            Next Steps
          </h4>
          <ul className="space-y-1.5">
            {(compact ? data.nextSteps.slice(0, 2) : data.nextSteps).map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}
              >
                <ChevronRight size={compact ? 12 : 14} className="text-warm-500 mt-0.5 flex-shrink-0" />
                {step}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Encouragement - hide in compact mode */}
      {!compact && data.encouragement && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-800/30">
          <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{data.encouragement}</p>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight, index, compact = false }: { insight: CareerInsight; index: number; compact?: boolean }) {
  const Icon = priorityIcons[insight.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-start gap-2 ${compact ? 'p-2' : 'p-3'} rounded-xl bg-cream-50 dark:bg-slate-800/50 border border-warm-100 dark:border-slate-700`}
    >
      <div className={cn(`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0`, priorityColors[insight.priority])}>
        <Icon size={compact ? 12 : 16} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-800 dark:text-cream-50 font-game truncate`}>
            {insight.title}
          </h4>
          {!compact && (
            <Badge variant={insight.priority === 'high' ? 'danger' : insight.priority === 'medium' ? 'warning' : 'info'} size="sm">
              {insight.priority}
            </Badge>
          )}
        </div>
        <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-600 dark:text-gray-400 line-clamp-2`}>{insight.description}</p>
      </div>
    </motion.div>
  );
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
