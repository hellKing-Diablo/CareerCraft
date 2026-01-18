import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trophy,
  Sparkles,
  Target,
  Clock,
  AlertCircle,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Card, PriorityBadge, Badge, ProgressBar } from '@/components/common';
import { ForestMap } from '@/components/map';
import { AIChatbot, GapSummary } from '@/components/ai';
import { useGraphStore } from '@/store/graphStore';
import { useUserStore } from '@/store/userStore';
import { getSkillById } from '@/data/careerData';
import { cn } from '@/utils/cn';

export function Dashboard() {
  const { gapAnalysis, currentGraph, generateGraph } = useGraphStore();
  const { careerGoals } = useUserStore();
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showSkillPanel, setShowSkillPanel] = useState(true);
  const [showStatsPanel, setShowStatsPanel] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'gaps' | 'strengths' | null>('gaps');

  // Ensure graph is generated
  useEffect(() => {
    if (careerGoals.length > 0 && !currentGraph) {
      const primaryGoal = careerGoals.find(g => g.timeframe === 'long') || careerGoals[0];
      generateGraph(primaryGoal.targetRoleId);
    }
  }, [careerGoals, currentGraph, generateGraph]);

  const targetRole = gapAnalysis?.targetRole || null;
  // Estimate hours based on gaps (rough estimate: 20 hours per level gap)
  const estimatedHours = gapAnalysis?.gaps.reduce((total, gap) => {
    return total + (gap.requiredLevel - gap.currentLevel) * 20;
  }, 0) ?? 0;
  const readinessScore = gapAnalysis?.readinessScore ?? 0;

  // Determine readiness color
  const getReadinessColor = () => {
    if (readinessScore >= 80) return 'text-green-400';
    if (readinessScore >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (!isFullscreen) {
    // Fallback to compact view
    return <CompactDashboard />;
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-900">
      {/* Full-Screen Forest Map */}
      <div className="absolute inset-0">
        <ForestMap className="w-full h-full" />
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar - Quest Info */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {/* Left Side - Quest Info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
          >
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 max-w-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Target size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-game">Current Quest</p>
                  <h3 className="text-white font-semibold font-game truncate max-w-[200px]">
                    {targetRole?.roleName || 'Set a career goal'}
                  </h3>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Quest Progress</span>
                  <span className={cn('font-semibold', getReadinessColor())}>{readinessScore}%</span>
                </div>
                <ProgressBar value={readinessScore} size="sm" />
              </div>
            </div>
          </motion.div>

          {/* Right Side - Stats Overview */}
          <AnimatePresence>
            {showStatsPanel && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pointer-events-auto flex gap-3"
              >
                <StatBadge
                  icon={<AlertCircle size={16} />}
                  value={gapAnalysis?.gaps.length ?? 0}
                  label="Gaps"
                  color="orange"
                />
                <StatBadge
                  icon={<Trophy size={16} />}
                  value={gapAnalysis?.strengths.length ?? 0}
                  label="Strengths"
                  color="green"
                />
                <StatBadge
                  icon={<Clock size={16} />}
                  value={`${estimatedHours}h`}
                  label="Est. Time"
                  color="blue"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Controls */}
          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={() => setShowStatsPanel(!showStatsPanel)}
              className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-gray-400 hover:text-white transition-colors"
            >
              {showStatsPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Left - Skill Panel */}
        <AnimatePresence>
          {showSkillPanel && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-4 left-4 pointer-events-auto"
            >
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700/50 w-80 max-h-[60vh] overflow-hidden">
                {/* Panel Header */}
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-orange-400" />
                      <h3 className="text-white font-semibold font-game">Skill Focus</h3>
                    </div>
                    <button
                      onClick={() => setShowSkillPanel(false)}
                      className="p-1 rounded-lg hover:bg-slate-700/50 text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700/50">
                  <button
                    onClick={() => setExpandedSection('gaps')}
                    className={cn(
                      'flex-1 py-2 px-4 text-sm font-game transition-colors',
                      expandedSection === 'gaps'
                        ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-500/10'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Priority Gaps
                  </button>
                  <button
                    onClick={() => setExpandedSection('strengths')}
                    className={cn(
                      'flex-1 py-2 px-4 text-sm font-game transition-colors',
                      expandedSection === 'strengths'
                        ? 'text-green-400 border-b-2 border-green-400 bg-green-500/10'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Strengths
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[40vh] overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {expandedSection === 'gaps' && (
                      <motion.div
                        key="gaps"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                      >
                        {gapAnalysis?.gaps.slice(0, 8).map((gap, index) => {
                          const skill = getSkillById(gap.skillId);
                          return (
                            <motion.div
                              key={gap.skillId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors cursor-pointer group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-white truncate font-game">
                                    {skill?.skillName ?? gap.skillId}
                                  </span>
                                  <PriorityBadge priority={gap.priority} />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Lv.{gap.currentLevel} → Lv.{gap.requiredLevel}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight
                                size={16}
                                className="text-gray-500 group-hover:text-orange-400 transition-colors"
                              />
                            </motion.div>
                          );
                        })}

                        {(!gapAnalysis || gapAnalysis.gaps.length === 0) && (
                          <div className="text-center py-6">
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 font-game">No skill gaps!</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {expandedSection === 'strengths' && (
                      <motion.div
                        key="strengths"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                      >
                        {gapAnalysis?.strengths.slice(0, 8).map((strength, index) => {
                          const skill = getSkillById(strength.skillId);
                          return (
                            <motion.div
                              key={strength.skillId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-green-500/30 transition-colors"
                            >
                              <CheckCircle size={16} className="text-green-500 shrink-0" />
                              <span className="text-sm text-white truncate font-game flex-1">
                                {skill?.skillName ?? strength.skillId}
                              </span>
                              <Badge variant="success" size="sm">
                                +{strength.currentLevel - strength.requiredLevel}
                              </Badge>
                            </motion.div>
                          );
                        })}

                        {(!gapAnalysis || gapAnalysis.strengths.length === 0) && (
                          <p className="text-sm text-gray-400 text-center py-4 font-game">
                            Complete skills to see strengths
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Left Toggle (when panel is hidden) */}
        {!showSkillPanel && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowSkillPanel(true)}
            className="absolute bottom-4 left-4 pointer-events-auto p-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <Zap size={20} />
          </motion.button>
        )}

        {/* AI Gap Summary - Bottom Center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto max-w-lg w-full px-4">
          <GapSummary compact />
        </div>
      </div>

      {/* AI Chatbot - Bottom Right */}
      <AIChatbot />
    </div>
  );
}

// Stat Badge Component
interface StatBadgeProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: 'orange' | 'green' | 'blue';
}

function StatBadge({ icon, value, label, color }: StatBadgeProps) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  };

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-xl bg-gradient-to-br backdrop-blur-sm border flex items-center gap-2',
        colorClasses[color]
      )}
    >
      {icon}
      <div className="text-center">
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// Compact Dashboard (fallback)
function CompactDashboard() {
  const { gapAnalysis, currentGraph, generateGraph } = useGraphStore();
  const { careerGoals } = useUserStore();

  useEffect(() => {
    if (careerGoals.length > 0 && !currentGraph) {
      const primaryGoal = careerGoals.find(g => g.timeframe === 'long') || careerGoals[0];
      generateGraph(primaryGoal.targetRoleId);
    }
  }, [careerGoals, currentGraph, generateGraph]);

  const targetRole = gapAnalysis?.targetRole || null;
  const estimatedHours = gapAnalysis?.gaps.reduce((total, gap) => {
    return total + (gap.requiredLevel - gap.currentLevel) * 20;
  }, 0) ?? 0;

  const handleExpand = () => {
    window.location.reload(); // Simple way to switch to fullscreen mode
  };

  return (
    <>
      <AIChatbot />
      <div className="space-y-6">
        {/* Expand Button */}
        <motion.button
          onClick={handleExpand}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-white hover:border-orange-500/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Maximize2 size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold font-game">Enter Adventure Mode</p>
              <p className="text-sm text-gray-400">Full-screen game experience</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-orange-400" />
        </motion.button>

        {/* Main Forest Map */}
        <Card variant="warm">
          <div className="p-4 border-b border-warm-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold text-gray-800 dark:text-white font-game">Skill Adventure Map</h2>
            </div>
            {targetRole && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Quest: Become a {targetRole.roleName}
              </p>
            )}
          </div>
          <div className="h-[400px]">
            <ForestMap className="rounded-b-lg" />
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            label="Readiness"
            value={`${gapAnalysis?.readinessScore ?? 0}%`}
            color="warm"
            emoji="🎯"
          />
          <StatsCard
            label="Skill Gaps"
            value={`${gapAnalysis?.gaps.length ?? 0}`}
            color="yellow"
            emoji="⚡"
          />
          <StatsCard
            label="Est. Hours"
            value={`${estimatedHours}`}
            color="blue"
            emoji="⏱️"
          />
        </div>

        {/* AI Gap Summary */}
        <GapSummary />

        {/* Skills Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Priority Skills */}
          <Card>
            <div className="p-4 border-b border-warm-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white font-game">Priority Skills</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {gapAnalysis?.gaps.slice(0, 5).map((gap) => {
                const skill = getSkillById(gap.skillId);
                return (
                  <div
                    key={gap.skillId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white font-game">
                        {skill?.skillName ?? gap.skillId}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        Lv.{gap.currentLevel} → {gap.requiredLevel}
                      </span>
                    </div>
                    <PriorityBadge priority={gap.priority} />
                  </div>
                );
              })}
              {(!gapAnalysis || gapAnalysis.gaps.length === 0) && (
                <p className="text-center text-gray-500 py-4 font-game">No skill gaps!</p>
              )}
            </div>
          </Card>

          {/* Strengths */}
          <Card>
            <div className="p-4 border-b border-warm-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white font-game">Your Strengths</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {gapAnalysis?.strengths.slice(0, 5).map((strength) => {
                const skill = getSkillById(strength.skillId);
                return (
                  <div
                    key={strength.skillId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-game flex-1">
                      {skill?.skillName ?? strength.skillId}
                    </span>
                    <Badge variant="success" size="sm">
                      +{strength.currentLevel - strength.requiredLevel}
                    </Badge>
                  </div>
                );
              })}
              {(!gapAnalysis || gapAnalysis.strengths.length === 0) && (
                <p className="text-center text-gray-500 py-4 font-game">Complete skills to see strengths</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

interface StatsCardProps {
  label: string;
  value: string;
  color: 'warm' | 'green' | 'yellow' | 'blue';
  emoji: string;
}

function StatsCard({ label, value, color, emoji }: StatsCardProps) {
  const colorClasses = {
    warm: 'from-warm-100 to-warm-50 dark:from-warm-900/30 dark:to-warm-800/20 border-warm-200 dark:border-warm-800/30',
    green: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border-green-200 dark:border-green-800/30',
    yellow: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800/30',
    blue: 'from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-800/20 border-sky-200 dark:border-sky-800/30',
  };

  const iconColorClasses = {
    warm: 'bg-warm-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    blue: 'bg-sky-500 text-white',
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className={cn('bg-gradient-to-br border', colorClasses[color])}>
        <div className="flex items-center gap-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shadow-sm', iconColorClasses[color])}>
            <span className="text-xl">{emoji}</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-game">{label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-cream-50">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}