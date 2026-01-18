import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Briefcase,
  Repeat,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Search,
  Layers,
  Zap,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Card, ProgressBar } from '@/components/common';
import { cn } from '@/utils/cn';
import {
  domains,
  getDomainCategories,
  getSkillsByDomains,
  getJobsByDomains,
  type Domain,
} from '@/data/careerData';
import { UserStage, SkillLevel, OnboardingData } from '@/types';
import { useUserStore } from '@/store/userStore';

const stages = [
  { id: 'beginner' as const, label: 'Beginner', icon: User, description: 'New to the field, exploring options', color: 'from-green-400 to-green-500' },
  { id: 'student' as const, label: 'Student', icon: GraduationCap, description: 'Currently studying or in training', color: 'from-blue-400 to-blue-500' },
  { id: 'professional' as const, label: 'Professional', icon: Briefcase, description: 'Already working in the industry', color: 'from-purple-400 to-purple-500' },
  { id: 'switcher' as const, label: 'Career Switcher', icon: Repeat, description: 'Transitioning from another field', color: 'from-orange-400 to-orange-500' },
];

const STEPS = ['stage', 'domains', 'skills', 'goals', 'complete'] as const;
type Step = typeof STEPS[number];

interface OnboardingState extends OnboardingData {
  selectedDomains: string[];
}

export function OnboardingFlow() {
  const { completeOnboarding } = useUserStore();
  const [currentStep, setCurrentStep] = useState<Step>('stage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingState>({
    stage: 'beginner',
    selectedDomains: [],
    skills: [],
    courses: [],
    projects: [],
    achievements: [],
    shortTermGoal: '',
    longTermGoal: '',
  });

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const nextStep = () => {
    const nextIndex = Math.min(stepIndex + 1, STEPS.length - 1);
    setCurrentStep(STEPS[nextIndex]);
  };

  const prevStep = () => {
    const prevIndex = Math.max(stepIndex - 1, 0);
    setCurrentStep(STEPS[prevIndex]);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        stage: data.stage,
        skills: data.skills,
        courses: data.courses,
        projects: data.projects,
        achievements: data.achievements,
        shortTermGoal: data.shortTermGoal,
        longTermGoal: data.longTermGoal,
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      setIsSubmitting(false);
    }
  };

  const stepIcons = {
    stage: User,
    domains: Layers,
    skills: Zap,
    goals: Target,
    complete: Trophy,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30"
          >
            <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white mb-2 font-game"
          >
            Welcome to CareerCraft
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400"
          >
            Let's build your personalized skill journey
          </motion.p>
        </div>

        {/* Progress */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((step, i) => {
              const Icon = stepIcons[step];
              return (
                <div
                  key={step}
                  className={cn(
                    'flex flex-col items-center gap-1',
                    i <= stepIndex ? 'text-orange-400' : 'text-gray-600'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all',
                      i < stepIndex
                        ? 'bg-orange-500 text-white'
                        : i === stepIndex
                        ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                        : 'bg-slate-700 text-gray-500'
                    )}
                  >
                    {i < stepIndex ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span className="text-xs capitalize hidden md:block font-game">{step}</span>
                </div>
              );
            })}
          </div>
          <ProgressBar value={progress} size="sm" />
        </div>

        {/* Step Content */}
        <Card className="p-6 md:p-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {currentStep === 'stage' && (
              <StageStep
                key="stage"
                value={data.stage}
                onChange={(stage) => setData({ ...data, stage })}
                onNext={nextStep}
              />
            )}
            {currentStep === 'domains' && (
              <DomainsStep
                key="domains"
                value={data.selectedDomains}
                onChange={(selectedDomains) => setData({ ...data, selectedDomains })}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 'skills' && (
              <SkillsStep
                key="skills"
                value={data.skills}
                selectedDomains={data.selectedDomains}
                onChange={(skills) => setData({ ...data, skills })}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 'goals' && (
              <GoalsStep
                key="goals"
                shortTermGoal={data.shortTermGoal}
                longTermGoal={data.longTermGoal}
                selectedDomains={data.selectedDomains}
                onChange={(goals) => setData({ ...data, ...goals })}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 'complete' && (
              <CompleteStep
                key="complete"
                data={data}
                onBack={prevStep}
                onComplete={handleComplete}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

// Stage Step Component
interface StageStepProps {
  value: UserStage;
  onChange: (stage: UserStage) => void;
  onNext: () => void;
}

function StageStep({ value, onChange, onNext }: StageStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-semibold text-white mb-2 font-game">
        Where are you in your career journey?
      </h2>
      <p className="text-gray-400 mb-6">This helps us personalize your experience</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {stages.map((stage) => (
          <motion.button
            key={stage.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(stage.id)}
            className={cn(
              'p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden',
              value === stage.id
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
            )}
          >
            {value === stage.id && (
              <motion.div
                layoutId="stage-glow"
                className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/10"
              />
            )}
            <div className="relative">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br',
                  stage.color
                )}
              >
                <stage.icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{stage.label}</h3>
              <p className="text-sm text-gray-400">{stage.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        Continue <ArrowRight size={18} className="ml-2" />
      </Button>
    </motion.div>
  );
}

// Domains Step Component
interface DomainsStepProps {
  value: string[];
  onChange: (domains: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

function DomainsStep({ value, onChange, onNext, onBack }: DomainsStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const categories = useMemo(() => getDomainCategories(), []);

  const filteredDomains = useMemo(() => {
    if (!searchQuery) return domains;
    const query = searchQuery.toLowerCase();
    return domains.filter(
      (d) =>
        d.domain.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleDomain = (domainName: string) => {
    if (value.includes(domainName)) {
      onChange(value.filter((d) => d !== domainName));
    } else {
      onChange([...value, domainName]);
    }
  };

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const domainsGroupedByCategory = useMemo(() => {
    const grouped: Record<string, Domain[]> = {};
    filteredDomains.forEach((domain) => {
      if (!grouped[domain.category]) {
        grouped[domain.category] = [];
      }
      grouped[domain.category].push(domain);
    });
    return grouped;
  }, [filteredDomains]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-semibold text-white mb-2 font-game">
        What career domains interest you?
      </h2>
      <p className="text-gray-400 mb-4">Select 1-5 domains you want to explore</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search domains..."
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Selected Count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-400">Selected:</span>
        <span
          className={cn(
            'text-sm font-semibold px-2 py-0.5 rounded',
            value.length > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-gray-500'
          )}
        >
          {value.length}/5
        </span>
      </div>

      {/* Domains List */}
      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 mb-6">
        {categories.map((category) => {
          const categoryDomains = domainsGroupedByCategory[category] || [];
          if (categoryDomains.length === 0) return null;

          const isExpanded = expandedCategories.includes(category) || searchQuery.length > 0;
          const selectedInCategory = categoryDomains.filter((d) => value.includes(d.domain)).length;

          return (
            <div key={category} className="border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{category}</span>
                  <span className="text-xs text-gray-500">({categoryDomains.length})</span>
                  {selectedInCategory > 0 && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                      {selectedInCategory} selected
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
              </button>
              {isExpanded && (
                <div className="p-2 grid grid-cols-2 gap-2">
                  {categoryDomains.map((domain) => (
                    <button
                      key={domain.id}
                      onClick={() => toggleDomain(domain.domain)}
                      disabled={!value.includes(domain.domain) && value.length >= 5}
                      className={cn(
                        'p-3 rounded-lg text-left text-sm transition-all',
                        value.includes(domain.domain)
                          ? 'bg-orange-500/20 border border-orange-500 text-white'
                          : 'bg-slate-700/50 border border-transparent text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {domain.domain}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={value.length === 0} size="lg">
          Continue <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Skills Step Component
interface SkillsStepProps {
  value: { skillId: string; level: SkillLevel }[];
  selectedDomains: string[];
  onChange: (skills: { skillId: string; level: SkillLevel }[]) => void;
  onNext: () => void;
  onBack: () => void;
}

function SkillsStep({ value, selectedDomains, onChange, onNext, onBack }: SkillsStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const relevantSkills = useMemo(() => {
    let skills = getSkillsByDomains(selectedDomains);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.skillName.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }
    // Limit to first 100 for performance
    return skills.slice(0, 100);
  }, [selectedDomains, searchQuery]);

  const toggleSkill = (skillId: string, level: SkillLevel) => {
    const existing = value.find((s) => s.skillId === skillId);
    if (existing) {
      if (existing.level === level) {
        onChange(value.filter((s) => s.skillId !== skillId));
      } else {
        onChange(value.map((s) => (s.skillId === skillId ? { ...s, level } : s)));
      }
    } else {
      onChange([...value, { skillId, level }]);
    }
  };

  const getSkillLevel = (skillId: string): SkillLevel => {
    return value.find((s) => s.skillId === skillId)?.level ?? 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-semibold text-white mb-2 font-game">
        What skills do you already have?
      </h2>
      <p className="text-gray-400 mb-4">Rate your current proficiency (optional)</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills..."
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Selected Count */}
      <div className="mb-4">
        <span className="text-sm text-gray-400">
          {value.length} skill{value.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Skills List */}
      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 mb-6">
        {relevantSkills.map((skill) => {
          const currentLevel = getSkillLevel(skill.id);
          return (
            <div
              key={skill.id}
              className={cn(
                'p-4 rounded-lg border transition-all',
                currentLevel > 0
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-slate-700 bg-slate-800/30'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-white">{skill.skillName}</span>
                  <span className="text-xs text-gray-500 ml-2">{skill.category}</span>
                </div>
                {currentLevel > 0 && (
                  <span className="text-xs text-orange-400">Level {currentLevel}</span>
                )}
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleSkill(skill.id, level as SkillLevel)}
                    className={cn(
                      'flex-1 py-2 rounded text-xs font-medium transition-all',
                      currentLevel >= level
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {relevantSkills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No skills found matching your search
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1" size="lg">
          Continue <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Goals Step Component
interface GoalsStepProps {
  shortTermGoal: string;
  longTermGoal: string;
  selectedDomains: string[];
  onChange: (goals: { shortTermGoal?: string; longTermGoal?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

function GoalsStep({ shortTermGoal, longTermGoal, selectedDomains, onChange, onNext, onBack }: GoalsStepProps) {
  const [searchShort, setSearchShort] = useState('');
  const [searchLong, setSearchLong] = useState('');

  const availableJobs = useMemo(() => getJobsByDomains(selectedDomains), [selectedDomains]);

  const filteredShortTermJobs = useMemo(() => {
    if (!searchShort) return availableJobs.slice(0, 20);
    const query = searchShort.toLowerCase();
    return availableJobs.filter((j) => j.toLowerCase().includes(query)).slice(0, 20);
  }, [availableJobs, searchShort]);

  const filteredLongTermJobs = useMemo(() => {
    if (!searchLong) return availableJobs.slice(0, 20);
    const query = searchLong.toLowerCase();
    return availableJobs.filter((j) => j.toLowerCase().includes(query)).slice(0, 20);
  }, [availableJobs, searchLong]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-semibold text-white mb-2 font-game">
        What are your career goals?
      </h2>
      <p className="text-gray-400 mb-6">Select your target roles</p>

      <div className="space-y-6 mb-8">
        {/* Short-term Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 font-game">
            Short-term goal (optional)
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={searchShort}
              onChange={(e) => setSearchShort(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="max-h-[120px] overflow-y-auto grid grid-cols-2 gap-2">
            {filteredShortTermJobs.map((job) => (
              <button
                key={job}
                onClick={() => onChange({ shortTermGoal: job })}
                className={cn(
                  'p-2 rounded-lg text-sm text-left transition-all',
                  shortTermGoal === job
                    ? 'bg-orange-500/20 border border-orange-500 text-white'
                    : 'bg-slate-700/50 border border-transparent text-gray-300 hover:bg-slate-700'
                )}
              >
                {job}
              </button>
            ))}
          </div>
        </div>

        {/* Long-term Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 font-game">
            Long-term goal (dream role) <span className="text-orange-400">*</span>
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={searchLong}
              onChange={(e) => setSearchLong(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="max-h-[150px] overflow-y-auto grid grid-cols-2 gap-2">
            {filteredLongTermJobs.map((job) => (
              <button
                key={job}
                onClick={() => onChange({ longTermGoal: job })}
                className={cn(
                  'p-2 rounded-lg text-sm text-left transition-all',
                  longTermGoal === job
                    ? 'bg-orange-500/20 border border-orange-500 text-white'
                    : 'bg-slate-700/50 border border-transparent text-gray-300 hover:bg-slate-700'
                )}
              >
                {job}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={!longTermGoal} size="lg">
          Continue <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Complete Step Component
interface CompleteStepProps {
  data: OnboardingState;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

function CompleteStep({ data, onBack, onComplete, isSubmitting }: CompleteStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2 font-game">You're all set!</h2>
      <p className="text-gray-400 mb-8">
        Your personalized skill journey to{' '}
        <span className="text-orange-400 font-medium">{data.longTermGoal}</span> is ready
      </p>

      <div className="bg-slate-800/50 rounded-lg p-5 mb-8 text-left border border-slate-700">
        <h3 className="text-sm font-medium text-gray-300 mb-4 font-game">Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Stage</span>
            <span className="text-white capitalize">{data.stage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Domains</span>
            <span className="text-white">{data.selectedDomains.length} selected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Skills</span>
            <span className="text-white">{data.skills.length} added</span>
          </div>
          {data.shortTermGoal && (
            <div className="flex justify-between">
              <span className="text-gray-500">Short-term goal</span>
              <span className="text-white">{data.shortTermGoal}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Dream role</span>
            <span className="text-orange-400 font-medium">{data.longTermGoal}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <Button onClick={onComplete} className="flex-1" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
              />
              Setting up...
            </>
          ) : (
            <>
              <Check size={16} className="mr-2" /> Start My Journey
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
