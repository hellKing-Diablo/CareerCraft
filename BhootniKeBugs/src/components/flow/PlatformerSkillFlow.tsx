import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Home } from 'lucide-react';

import { useGraphStore } from '@/store/graphStore';
import { useUserStore } from '@/store/userStore';
import { PixelCharacter, LevelNode, Platform } from '@/components/game';
import { NodePopup } from './NodePopup';
import { skillOntology } from '@/data/skillOntology';

interface PlatformNode {
  id: string;
  skillId: string;
  name: string;
  state: 'locked' | 'available' | 'current' | 'completed' | 'mastered';
  stars: number;
  tier: number;
  x: number;
  y: number;
}

export function PlatformerSkillFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterState, setCharacterState] = useState<'idle' | 'walking' | 'celebrating'>('idle');

  const { currentGraph, isNodePopupOpen, openNodePopup, closeNodePopup, getSelectedNode } = useGraphStore();
  const { careerGoals, userSkills } = useUserStore();
  const { generateGraph } = useGraphStore();

  // Generate initial graph based on career goal
  useEffect(() => {
    if (careerGoals.length > 0 && !currentGraph) {
      const primaryGoal = careerGoals.find(g => g.timeframe === 'long') || careerGoals[0];
      generateGraph(primaryGoal.targetRoleId);
    }
  }, [careerGoals, currentGraph, generateGraph]);

  // Convert graph nodes to platform positions
  const platformNodes: PlatformNode[] = useMemo(() => {
    if (!currentGraph) return [];

    // Group nodes by tier
    const tierGroups = new Map<number, typeof currentGraph.nodes>();
    currentGraph.nodes.forEach(node => {
      const group = tierGroups.get(node.tier) || [];
      group.push(node);
      tierGroups.set(node.tier, group);
    });

    const platforms: PlatformNode[] = [];
    const baseY = 400;
    const platformSpacingX = 220;
    let currentX = 100;

    // Sort tiers and create platforms
    const sortedTiers = Array.from(tierGroups.keys()).sort((a, b) => a - b);

    sortedTiers.forEach((tier) => {
      const nodes = tierGroups.get(tier) || [];

      nodes.forEach((node, nodeIndex) => {
        const skill = skillOntology.find(s => s.id === node.skillId);
        const userSkill = userSkills.find(us => us.skillId === node.skillId);

        // Calculate Y position with wave pattern for visual interest
        const waveOffset = Math.sin(currentX / 200) * 50;
        const tierOffset = -tier * 30; // Higher tiers are slightly higher
        const nodeOffset = nodeIndex % 2 === 0 ? -20 : 20; // Alternate heights

        // Determine state and stars
        let state: PlatformNode['state'] = 'locked';
        let stars = 0;

        if (node.state === 'completed') {
          const level = userSkill?.level || 0;
          if (level >= 4) {
            state = 'mastered';
            stars = 3;
          } else {
            state = 'completed';
            stars = level >= 3 ? 2 : 1;
          }
        } else if (node.state === 'in_progress') {
          state = 'current';
          stars = 0;
        } else if (node.state === 'unlocked') {
          state = 'available';
          stars = 0;
        }

        platforms.push({
          id: node.id,
          skillId: node.skillId,
          name: skill?.name || 'Unknown Skill',
          state,
          stars,
          tier,
          x: currentX,
          y: baseY + waveOffset + tierOffset + nodeOffset,
        });

        currentX += platformSpacingX;
      });
    });

    return platforms;
  }, [currentGraph, userSkills]);

  // Find current platform (where character should be)
  const currentPlatform = useMemo(() => {
    return platformNodes.find(p => p.state === 'current') ||
           platformNodes.find(p => p.state === 'available') ||
           platformNodes[0];
  }, [platformNodes]);

  // Update character position when current platform changes
  useEffect(() => {
    if (currentPlatform) {
      setCharacterState('walking');
      setTimeout(() => {
        setCharacterPosition({ x: currentPlatform.x + 40, y: currentPlatform.y - 60 });
        setTimeout(() => setCharacterState('idle'), 500);
      }, 300);
    }
  }, [currentPlatform]);

  // Scroll to character
  const scrollToCharacter = useCallback(() => {
    if (scrollRef.current && currentPlatform) {
      const scrollLeft = (currentPlatform.x * zoom) - (scrollRef.current.clientWidth / 2);
      scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentPlatform, zoom]);

  // Scroll to character on initial load
  useEffect(() => {
    scrollToCharacter();
  }, [platformNodes, scrollToCharacter]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const platform = platformNodes.find(p => p.id === nodeId);
    if (platform && platform.state !== 'locked') {
      // Animate character walking to the clicked node
      setCharacterState('walking');
      setCharacterPosition({ x: platform.x + 40, y: platform.y - 60 });
      setTimeout(() => {
        setCharacterState('idle');
        openNodePopup(nodeId);
      }, 500);
    }
  }, [platformNodes, openNodePopup]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(1.5, prev + delta)));
  };

  const selectedNode = getSelectedNode();
  const totalWidth = Math.max(...platformNodes.map(p => p.x), 1000) + 300;

  if (!currentGraph) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-b from-sky-200 to-cream-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-warm-200 dark:border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-warm-600 dark:text-warm-400 mb-2 font-game text-lg">No Adventure Started</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set a career goal to begin your skill journey!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] rounded-xl border border-warm-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Sky background */}
      <div className="absolute inset-0 game-sky" />

      {/* Animated clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute cloud"
            style={{
              width: 60 + i * 20,
              height: 30 + i * 5,
              top: 50 + i * 60,
            }}
            animate={{
              x: [-200, totalWidth * zoom + 200],
            }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 5,
            }}
          />
        ))}
      </div>

      {/* Scrollable game area */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden scrollbar-thin"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div
          className="relative h-full"
          style={{
            width: totalWidth * zoom,
            minWidth: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Ground */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 ground-tile"
            style={{ width: totalWidth }}
          />

          {/* Grass layer on top of ground */}
          <div
            className="absolute bottom-24 left-0 right-0 h-8 grass-tile"
            style={{ width: totalWidth }}
          />

          {/* Path connectors between platforms */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: totalWidth, height: '100%' }}
          >
            {platformNodes.map((platform, index) => {
              if (index === 0) return null;
              const prevPlatform = platformNodes[index - 1];
              const isCompleted = platform.state === 'completed' || platform.state === 'mastered';

              return (
                <motion.path
                  key={`path-${platform.id}`}
                  d={`M ${prevPlatform.x + 60} ${prevPlatform.y} Q ${(prevPlatform.x + platform.x) / 2 + 60} ${Math.min(prevPlatform.y, platform.y) - 50} ${platform.x + 60} ${platform.y}`}
                  fill="none"
                  stroke={isCompleted ? '#22c55e' : '#d97706'}
                  strokeWidth={4}
                  strokeDasharray={isCompleted ? '0' : '10 5'}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              );
            })}
          </svg>

          {/* Platforms and Level Nodes */}
          {platformNodes.map((platform, index) => (
            <div
              key={platform.id}
              className="absolute"
              style={{
                left: platform.x,
                top: platform.y,
              }}
            >
              <Platform
                width={120}
                variant={
                  platform.state === 'mastered' ? 'gold' :
                  platform.state === 'completed' ? 'grass' :
                  platform.state === 'current' ? 'checkpoint' :
                  'stone'
                }
              >
                <LevelNode
                  level={index + 1}
                  name={platform.name}
                  state={platform.state}
                  stars={platform.stars}
                  onClick={() => handleNodeClick(platform.id)}
                />
              </Platform>
            </div>
          ))}

          {/* Character */}
          <AnimatePresence>
            <motion.div
              className="absolute z-20"
              animate={{
                x: characterPosition.x,
                y: characterPosition.y,
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            >
              <PixelCharacter
                state={characterState}
                direction="right"
                size="lg"
              />
            </motion.div>
          </AnimatePresence>

          {/* Start flag */}
          <div className="absolute left-8 bottom-32">
            <div className="flag-pole h-20">
              <motion.div
                className="flag absolute top-0 left-1"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="block text-xs font-pixel text-amber-700 dark:text-amber-400 mt-2">START</span>
          </div>

          {/* Goal castle at the end */}
          {platformNodes.length > 0 && (
            <div
              className="absolute bottom-32"
              style={{ left: totalWidth - 150 }}
            >
              <div className="castle w-20 h-24">
                {/* Castle door */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 bg-amber-800 rounded-t-lg" />
                {/* Castle window */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-sm" />
              </div>
              <span className="block text-xs font-pixel text-amber-700 dark:text-amber-400 mt-2 text-center">GOAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <motion.button
          className="warm-btn p-2 rounded-lg"
          onClick={() => handleZoom(-0.1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          className="warm-btn p-2 rounded-lg"
          onClick={() => handleZoom(0.1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          className="warm-btn p-2 rounded-lg"
          onClick={scrollToCharacter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Scroll arrows */}
      <motion.button
        className="absolute left-4 top-1/2 -translate-y-1/2 warm-btn p-2 rounded-full opacity-70 hover:opacity-100"
        onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>
      <motion.button
        className="absolute right-4 top-1/2 -translate-y-1/2 warm-btn p-2 rounded-full opacity-70 hover:opacity-100"
        onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-warm-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-sm font-game font-semibold text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <div className="w-32 h-3 warm-progress rounded-full">
            <motion.div
              className="warm-progress-bar"
              initial={{ width: 0 }}
              animate={{
                width: `${(platformNodes.filter(p => p.state === 'completed' || p.state === 'mastered').length / platformNodes.length) * 100}%`
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {platformNodes.filter(p => p.state === 'completed' || p.state === 'mastered').length}/{platformNodes.length}
          </span>
        </div>
      </div>

      {/* Tier legend */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-warm-200 dark:border-slate-700">
        <div className="flex items-center gap-4 text-xs font-game">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warm-500 animate-pulse" />
            <span className="text-gray-600 dark:text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Locked</span>
          </div>
        </div>
      </div>

      <NodePopup
        node={selectedNode}
        isOpen={isNodePopupOpen}
        onClose={closeNodePopup}
      />
    </div>
  );
}
