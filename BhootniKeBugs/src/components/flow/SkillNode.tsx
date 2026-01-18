import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';
import { NodeState, SkillTier } from '@/types';
import { getSkillById } from '@/data/skillOntology';

type IconComponent = React.ComponentType<{ size?: number | string; className?: string }>;

interface SkillNodeData {
  skillId: string;
  state: NodeState;
  completionPercent: number;
  tier: SkillTier;
}

const stateStyles: Record<NodeState, string> = {
  locked: 'bg-slate-800/50 border-slate-700/50 opacity-50 grayscale',
  unlocked: 'bg-slate-800 border-healthcare-500/30 hover:border-healthcare-500/60',
  in_progress: 'bg-slate-800 border-yellow-500/50 hover:border-yellow-500/80',
  completed: 'bg-gradient-to-br from-healthcare-600/20 to-healthcare-500/10 border-healthcare-500',
};

const stateGlow: Record<NodeState, string> = {
  locked: '',
  unlocked: 'hover:shadow-healthcare-500/20 hover:shadow-lg',
  in_progress: 'shadow-yellow-500/20 shadow-lg animate-pulse-slow',
  completed: 'shadow-healthcare-500/30 shadow-lg',
};

function SkillNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as SkillNodeData;
  const skill = getSkillById(nodeData.skillId);

  if (!skill) return null;

  // Get the icon component
  const IconComp = ((Icons as unknown) as Record<string, IconComponent>)[skill.icon || 'Circle'] || Icons.Circle;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          'w-3 h-3 border-2',
          nodeData.state === 'locked' ? 'bg-slate-600 border-slate-500' : 'bg-healthcare-500 border-healthcare-400'
        )}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={nodeData.state !== 'locked' ? { scale: 1.05 } : {}}
        className={cn(
          'px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all duration-200 cursor-pointer',
          stateStyles[nodeData.state],
          stateGlow[nodeData.state],
          selected && 'ring-2 ring-healthcare-400 ring-offset-2 ring-offset-slate-950'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              nodeData.state === 'completed'
                ? 'bg-healthcare-500/20'
                : nodeData.state === 'in_progress'
                ? 'bg-yellow-500/20'
                : 'bg-slate-700/50'
            )}
          >
            <IconComp
              size={20}
              className={cn(
                nodeData.state === 'completed'
                  ? 'text-healthcare-400'
                  : nodeData.state === 'in_progress'
                  ? 'text-yellow-400'
                  : 'text-slate-400'
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'text-sm font-medium truncate',
                nodeData.state === 'locked' ? 'text-slate-500' : 'text-white'
              )}
            >
              {skill.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tier {nodeData.tier}</p>

            {/* Progress bar */}
            {nodeData.state !== 'locked' && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      nodeData.state === 'completed'
                        ? 'bg-healthcare-500'
                        : 'bg-yellow-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${nodeData.completionPercent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* State indicator */}
          {nodeData.state === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-healthcare-500 flex items-center justify-center"
            >
              <Icons.Check size={12} className="text-white" />
            </motion.div>
          )}
          {nodeData.state === 'locked' && (
            <Icons.Lock size={14} className="text-slate-600" />
          )}
        </div>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          'w-3 h-3 border-2',
          nodeData.state === 'locked' ? 'bg-slate-600 border-slate-500' : 'bg-healthcare-500 border-healthcare-400'
        )}
      />
    </>
  );
}

export const SkillNodeComponent_Memoized = memo(SkillNodeComponent);
