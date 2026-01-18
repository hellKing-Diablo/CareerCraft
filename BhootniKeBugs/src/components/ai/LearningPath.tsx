import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  RefreshCw,
  AlertCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  CheckCircle,
  Circle,
  Lightbulb,
  Flag,
} from 'lucide-react';
import { Card, CardHeader, Button, Badge } from '@/components/common';
import { useAIStore } from '@/store/aiStore';
import { generateLearningPath, isAIConfigured } from '@/services/aiService';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import type { LearningStep, LearningPath as LearningPathType } from '@/types/ai';

interface LearningPathProps {
  compact?: boolean;
}

export function LearningPath({ compact = false }: LearningPathProps) {
  const { learningPath, setLearningPathStatus } = useAIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const isConfigured = isAIConfigured();

  // Wrapper component based on compact mode
  const Wrapper = compact ? 'div' : Card;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLearningPathStatus('loading');

    try {
      const path = await generateLearningPath();
      setLearningPathStatus('success', path);
    } catch (error) {
      const aiError = error as { code: string; message: string };
      setLearningPathStatus('error', null, {
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
        {!compact && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />}
        <div className={compact ? 'text-center py-4' : 'relative text-center py-6'}>
          <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center`}>
            <Map className={compact ? 'w-6 h-6 text-emerald-500' : 'w-8 h-8 text-emerald-500 dark:text-emerald-400'} />
          </div>
          <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-800 dark:text-cream-50 font-game mb-2`}>
            Learning Path
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
            Get a personalized roadmap to your career goals.
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
  if (learningPath.status === 'loading' || isGenerating) {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="Learning Path"
            subtitle="Creating your roadmap..."
            icon={<Map className="w-5 h-5" />}
          />
        )}
        <div className={`flex flex-col items-center justify-center ${compact ? 'py-6' : 'py-8'}`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={`${compact ? 'w-10 h-10 mb-3' : 'w-12 h-12 mb-4'} rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center`}
          >
            <Map className={compact ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
          </motion.div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Building your path...</p>
        </div>
      </Wrapper>
    );
  }

  // Error state
  if (learningPath.status === 'error') {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title="Learning Path"
            subtitle="Something went wrong"
            icon={<Map className="w-5 h-5" />}
          />
        )}
        <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
          <div className={`${compact ? 'w-10 h-10 mb-2' : 'w-12 h-12 mb-3'} mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center`}>
            <AlertCircle className={compact ? 'w-5 h-5 text-red-500' : 'w-6 h-6 text-red-500'} />
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {learningPath.error?.message || 'Failed to generate path'}
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
  if (learningPath.data) {
    return (
      <Wrapper>
        {!compact && (
          <CardHeader
            title={learningPath.data.title || 'Learning Path'}
            subtitle={`${learningPath.data.totalWeeks} weeks total`}
            icon={<Map className="w-5 h-5" />}
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
              {learningPath.data.totalWeeks} weeks
            </span>
            <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
              <RefreshCw size={12} className={cn(isGenerating && 'animate-spin')} />
            </Button>
          </div>
        )}
        <PathContent
          data={learningPath.data}
          expandedStep={expandedStep}
          setExpandedStep={setExpandedStep}
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
          title="Learning Path"
          subtitle="Your personalized roadmap"
          icon={<Map className="w-5 h-5" />}
        />
      )}
      <div className={`text-center ${compact ? 'py-4' : 'py-6'}`}>
        <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center`}>
          <Map className={compact ? 'w-6 h-6 text-emerald-500' : 'w-8 h-8 text-emerald-500 dark:text-emerald-400'} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Generate a step-by-step learning plan.
        </p>
        <Button variant="primary" size={compact ? 'sm' : 'md'} onClick={handleGenerate}>
          <Map size={14} className="mr-2" />
          Generate Path
        </Button>
      </div>
    </Wrapper>
  );
}

// Keep backward compatible export
export { LearningPath as LearningPathCard };

function PathContent({
  data,
  expandedStep,
  setExpandedStep,
  compact = false
}: {
  data: LearningPathType;
  expandedStep: number | null;
  setExpandedStep: (step: number | null) => void;
  compact?: boolean;
}) {
  const stepsToShow = compact ? data.steps.slice(0, 4) : data.steps;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Overview */}
      {data.overview && (
        <div className={`${compact ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30`}>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-200`}>{data.overview}</p>
        </div>
      )}

      {/* Steps Timeline */}
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <AnimatePresence>
          {stepsToShow.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              isLast={index === stepsToShow.length - 1}
              isExpanded={!compact && expandedStep === index}
              onToggle={() => !compact && setExpandedStep(expandedStep === index ? null : index)}
              compact={compact}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Tips - hide in compact mode */}
      {!compact && data.tips && data.tips.length > 0 && (
        <div className="pt-4 border-t border-warm-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-game flex items-center gap-2">
            <Lightbulb size={14} />
            Learning Tips
          </h4>
          <ul className="space-y-2">
            {data.tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="text-emerald-500">•</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StepCard({
  step,
  index,
  isLast,
  isExpanded,
  onToggle,
  compact = false
}: {
  step: LearningStep;
  index: number;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline connector */}
      {!isLast && !compact && (
        <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 to-emerald-100 dark:from-emerald-700 dark:to-emerald-900" />
      )}

      <div
        className={cn(
          'relative flex gap-2 cursor-pointer',
          compact ? 'p-2' : 'p-3',
          'rounded-xl transition-all',
          isExpanded
            ? 'bg-cream-50 dark:bg-slate-800/70 border border-emerald-200 dark:border-emerald-800/30'
            : 'hover:bg-cream-50 dark:hover:bg-slate-800/50'
        )}
        onClick={onToggle}
      >
        {/* Step number */}
        <div className={`relative z-10 ${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-white`}>{step.order || index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-800 dark:text-cream-50 font-game`}>
                {step.skillName}
              </h4>
              <Badge variant="info" size="sm">
                <Clock size={compact ? 8 : 10} className="mr-0.5" />
                {step.estimatedWeeks}w
              </Badge>
            </div>
            {!compact && (
              isExpanded ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )
            )}
          </div>
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1`}>
            {step.description}
          </p>

          {/* Expanded content - not shown in compact mode */}
          {!compact && (
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  {/* Resources */}
                  {step.resources && step.resources.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <BookOpen size={12} />
                        Resources
                      </h5>
                      <ul className="space-y-1">
                        {step.resources.map((resource, i) => (
                          <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Circle size={6} className="text-emerald-400" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Milestones */}
                  {step.milestones && step.milestones.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <Flag size={12} />
                        Milestones
                      </h5>
                      <ul className="space-y-1">
                        {step.milestones.map((milestone, i) => (
                          <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <CheckCircle size={12} className="text-emerald-400" />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
