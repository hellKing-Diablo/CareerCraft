import { useState } from 'react';
import { Target, ChevronDown } from 'lucide-react';
import { skillOntology } from '@/data/skillOntology';
import { roleBenchmarks } from '@/data/roleBenchmarks';
import { UserStage, SkillLevel, OnboardingData } from '@/types';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/utils/cn';

const stages: { id: UserStage; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'New to healthcare tech' },
  { id: 'student', label: 'Student', description: 'Currently studying' },
  { id: 'professional', label: 'Professional', description: 'Working in the field' },
  { id: 'switcher', label: 'Career Switcher', description: 'Transitioning careers' },
];

export function SimpleOnboarding() {
  const { completeOnboarding } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    stage: 'beginner',
    skills: [],
    courses: [],
    projects: [],
    achievements: [],
    shortTermGoal: '',
    longTermGoal: '',
  });

  const foundationalSkills = skillOntology.filter(s => s.tier === 1 || s.tier === 2);
  const entryRoles = roleBenchmarks.filter(r => r.seniorityLevel === 'entry' || r.seniorityLevel === 'mid');
  const advancedRoles = roleBenchmarks.filter(r => r.seniorityLevel === 'senior' || r.seniorityLevel === 'lead');

  const handleStageChange = (stage: UserStage) => {
    setData(prev => ({ ...prev, stage }));
  };

  const handleSkillToggle = (skillId: string, level: SkillLevel) => {
    setData(prev => {
      const existing = prev.skills.find(s => s.skillId === skillId);
      if (existing) {
        if (existing.level === level) {
          // Remove skill if clicking same level
          return { ...prev, skills: prev.skills.filter(s => s.skillId !== skillId) };
        } else {
          // Update level
          return { ...prev, skills: prev.skills.map(s => s.skillId === skillId ? { ...s, level } : s) };
        }
      } else {
        // Add new skill
        return { ...prev, skills: [...prev.skills, { skillId, level }] };
      }
    });
  };

  const getSkillLevel = (skillId: string): SkillLevel => {
    return data.skills.find(s => s.skillId === skillId)?.level ?? 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.longTermGoal) {
      setError('Please select a long-term career goal');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await completeOnboarding(data);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to CareerCraft</h1>
          <p className="text-gray-600">Let's set up your skill journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Section 1: Stage */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">What describes you best?</h2>
            <div className="grid grid-cols-2 gap-3">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleStageChange(stage.id)}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    data.stage === stage.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  )}
                >
                  <div className="font-medium text-gray-800">{stage.label}</div>
                  <div className="text-sm text-gray-500">{stage.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Skills */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">What skills do you have?</h2>
            <p className="text-sm text-gray-500 mb-4">Select your current skill levels (optional)</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {foundationalSkills.map((skill) => {
                const currentLevel = getSkillLevel(skill.id);
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      currentLevel > 0
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{skill.name}</span>
                      {currentLevel > 0 && (
                        <span className="text-xs text-orange-600">Level {currentLevel}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleSkillToggle(skill.id, level as SkillLevel)}
                          className={cn(
                            'flex-1 py-1.5 rounded text-xs font-medium transition-all',
                            currentLevel >= level
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">What are your career goals?</h2>

            {/* Short-term goal */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short-term goal (optional)
              </label>
              <div className="relative">
                <select
                  value={data.shortTermGoal}
                  onChange={(e) => setData(prev => ({ ...prev, shortTermGoal: e.target.value }))}
                  className="w-full p-3 pr-10 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a role...</option>
                  {entryRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName} ({role.seniorityLevel})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Long-term goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long-term goal (dream role) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={data.longTermGoal}
                  onChange={(e) => setData(prev => ({ ...prev, longTermGoal: e.target.value }))}
                  required
                  className="w-full p-3 pr-10 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a role...</option>
                  {advancedRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName} ({role.seniorityLevel})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Stage</span>
                <span className="text-gray-800 capitalize">{data.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Skills selected</span>
                <span className="text-gray-800">{data.skills.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Long-term goal</span>
                <span className="text-gray-800">
                  {data.longTermGoal
                    ? roleBenchmarks.find(r => r.id === data.longTermGoal)?.roleName || 'Selected'
                    : 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !data.longTermGoal}
            className={cn(
              'w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all',
              'bg-gradient-to-r from-orange-500 to-orange-600',
              'hover:from-orange-600 hover:to-orange-700',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-lg hover:shadow-xl'
            )}
          >
            {isSubmitting ? 'Setting up your journey...' : 'Start My Journey'}
          </button>
        </form>
      </div>
    </div>
  );
}
