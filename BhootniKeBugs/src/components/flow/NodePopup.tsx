import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Modal, Button, ProgressBar, StatusBadge, PriorityBadge } from '@/components/common';
import { SkillGuidance, NodeAIExplanation } from '@/components/ai';
import { SkillNode, SkillLevel } from '@/types';
import { getSkillById } from '@/data/careerData';
import { useUserStore } from '@/store/userStore';
import { useGraphStore } from '@/store/graphStore';
import { cn } from '@/utils/cn';

interface NodePopupProps {
  node: SkillNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NodePopup({ node, isOpen, onClose }: NodePopupProps) {
  const { userSkills, updateSkillLevel } = useUserStore();
  const { gapAnalysis, updateGraph, currentGraph } = useGraphStore();

  if (!node) return null;

  const skill = getSkillById(node.skillId);
  if (!skill) return null;

  const userSkill = userSkills.find(s => s.skillId === skill.id);
  const currentLevel = userSkill?.level ?? 0;

  // Find this skill in gap analysis
  const gapInfo = gapAnalysis?.gaps.find(g => g.skillId === skill.id);
  const requiredLevel = gapInfo?.requiredLevel || skill.skillLevel || 3;

  const handleLevelChange = (newLevel: number) => {
    updateSkillLevel(skill.id, newLevel as SkillLevel);
    // Update the graph after skill change
    setTimeout(() => updateGraph(), 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center',
              node.state === 'completed'
                ? 'bg-green-500/20'
                : node.state === 'in_progress'
                ? 'bg-yellow-500/20'
                : node.state === 'unlocked'
                ? 'bg-orange-500/20'
                : 'bg-slate-700'
            )}
          >
            <Icons.Zap
              size={28}
              className={cn(
                node.state === 'completed'
                  ? 'text-green-400'
                  : node.state === 'in_progress'
                  ? 'text-yellow-400'
                  : node.state === 'unlocked'
                  ? 'text-orange-400'
                  : 'text-slate-400'
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{skill.skillName}</h2>
              <StatusBadge status={node.state} />
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {skill.category} • Level {skill.skillLevel}
            </p>
          </div>
          {gapInfo && <PriorityBadge priority={gapInfo.priority} />}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">About this skill</h3>
          <div className="text-sm text-gray-500 dark:text-slate-400 space-y-2">
            <p>
              <strong>Domains:</strong> {skill.domain.join(', ')}
            </p>
            <p>
              <strong>Related Jobs:</strong> {skill.jobs.slice(0, 3).join(', ')}
              {skill.jobs.length > 3 && ` +${skill.jobs.length - 3} more`}
            </p>
          </div>
        </div>

        {/* Progress & Requirements */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Level */}
          <div className="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Your Level</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">{currentLevel}</span>
              <span className="text-gray-500 dark:text-slate-500">/5</span>
            </div>
            <ProgressBar
              value={currentLevel}
              max={5}
              size="sm"
              color={currentLevel >= 3 ? 'success' : currentLevel >= 1 ? 'warning' : 'danger'}
              animate
            />
          </div>

          {/* Required Level */}
          <div className="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Target Level</h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-500">{requiredLevel}</span>
              <span className="text-gray-500 dark:text-slate-500">/5</span>
            </div>
            <div className="text-sm mt-2">
              {currentLevel >= requiredLevel ? (
                <span className="text-green-500">Target achieved!</span>
              ) : currentLevel > 0 ? (
                <span className="text-yellow-500">Gap: {requiredLevel - currentLevel} levels</span>
              ) : (
                <span className="text-red-500">Not started yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Skill Level Adjustment */}
        {node.state !== 'locked' && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Update Your Level</h3>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(level => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLevelChange(level)}
                  className={cn(
                    'flex-1 py-3 rounded-lg font-medium transition-all',
                    currentLevel === level
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                  )}
                >
                  {level}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-500 mt-2 px-1">
              <span>None</span>
              <span>Beginner</span>
              <span>Basic</span>
              <span>Proficient</span>
              <span>Advanced</span>
              <span>Expert</span>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
            <Icons.Clock size={16} />
            <span className="text-sm">Estimated learning time</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white">{skill.time}</span>
        </div>

        {/* AI Node Explanation - Quick insights */}
        {currentGraph && (
          <NodeAIExplanation
            skillId={skill.id}
            skillName={skill.skillName}
            currentLevel={currentLevel}
            requiredLevel={requiredLevel}
            state={node.state.toUpperCase() as 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED'}
            blockedBy={[]}
            unlocks={[]}
            targetRoleId={currentGraph.targetRoleId}
          />
        )}

        {/* AI Guidance - Detailed learning resources */}
        <SkillGuidance skillId={skill.id} skillName={skill.skillName} />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
          {node.state === 'unlocked' && currentLevel === 0 && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                handleLevelChange(1);
                onClose();
              }}
            >
              Start Learning
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
