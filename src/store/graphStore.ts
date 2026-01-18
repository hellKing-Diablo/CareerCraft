import { create } from 'zustand';
import { UserSkillGraph, SkillNode, SkillLevel } from '@/types';
import {
  generateCareerGraph,
  updateCareerGraphStates,
  getCareerGraphStats,
  analyzeCareerGaps,
  generateRoleBenchmark,
  type DynamicRoleBenchmark,
} from '@/engine/careerGraphGenerator';
import { getSkillById } from '@/data/careerData';
import { useUserStore } from './userStore';

interface GapAnalysisResult {
  readinessScore: number;
  gaps: Array<{
    skillId: string;
    skillName: string;
    currentLevel: SkillLevel;
    requiredLevel: SkillLevel;
    priority: 'critical' | 'important' | 'nice_to_have';
    category: string;
  }>;
  strengths: Array<{
    skillId: string;
    skillName: string;
    currentLevel: SkillLevel;
    requiredLevel: SkillLevel;
    category: string;
  }>;
  targetRole: {
    roleName: string;
    description: string;
  } | null;
}

interface GraphState {
  // Graph data
  currentGraph: UserSkillGraph | null;
  gapAnalysis: GapAnalysisResult | null;
  currentRoleBenchmark: DynamicRoleBenchmark | null;

  // UI state
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isNodePopupOpen: boolean;

  // Graph statistics
  stats: {
    totalNodes: number;
    completedNodes: number;
    inProgressNodes: number;
    unlockedNodes: number;
    lockedNodes: number;
    completionPercent: number;
  } | null;

  // Actions
  generateGraph: (targetJobOrRoleId: string) => void;
  updateGraph: () => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  openNodePopup: (nodeId: string) => void;
  closeNodePopup: () => void;
  getSelectedNode: () => SkillNode | null;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  currentGraph: null,
  gapAnalysis: null,
  currentRoleBenchmark: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  isNodePopupOpen: false,
  stats: null,

  generateGraph: (targetJobOrRoleId) => {
    const { userSkills, careerGoals } = useUserStore.getState();

    // Find the target job title
    let targetJobTitle = targetJobOrRoleId;

    // Check if it's a roleId from career goals
    const goal = careerGoals.find(g => g.targetRoleId === targetJobOrRoleId);
    if (goal) {
      targetJobTitle = goal.targetRoleId; // In new system, targetRoleId IS the job title
    }

    // Get user's domains from their skills
    const userDomains: string[] = [];
    userSkills.forEach(us => {
      const skill = getSkillById(us.skillId);
      if (skill) {
        skill.domain.forEach(d => {
          if (!userDomains.includes(d)) {
            userDomains.push(d);
          }
        });
      }
    });

    // Generate the graph using the new career-based generator
    const graph = generateCareerGraph(targetJobTitle, userSkills, userDomains);

    if (!graph) {
      console.warn('[GraphStore] Could not generate graph for:', targetJobTitle);
      set({
        currentGraph: null,
        gapAnalysis: null,
        currentRoleBenchmark: null,
        stats: null,
      });
      return;
    }

    // Perform gap analysis
    const rawAnalysis = analyzeCareerGaps(userSkills, targetJobTitle, userDomains);

    // Get role benchmark for display
    const roleBenchmark = generateRoleBenchmark(targetJobTitle, userDomains);

    // Transform analysis to match expected interface
    const analysis: GapAnalysisResult = {
      readinessScore: rawAnalysis.readinessScore,
      gaps: rawAnalysis.gaps,
      // Transform strengths to include currentLevel and requiredLevel
      strengths: rawAnalysis.strengths.map(s => ({
        skillId: s.skillId,
        skillName: s.skillName,
        currentLevel: s.level,
        requiredLevel: s.level, // They've met or exceeded the requirement
        category: s.category,
      })),
      targetRole: roleBenchmark ? {
        roleName: roleBenchmark.roleName,
        description: roleBenchmark.description,
      } : null,
    };

    // Calculate stats
    const stats = getCareerGraphStats(graph);

    console.log('[GraphStore] Generated graph for:', targetJobTitle, {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      readinessScore: analysis.readinessScore,
    });

    set({
      currentGraph: graph,
      gapAnalysis: analysis,
      currentRoleBenchmark: roleBenchmark,
      stats,
    });
  },

  updateGraph: () => {
    const { currentGraph, currentRoleBenchmark } = get();
    if (!currentGraph) return;

    const { userSkills } = useUserStore.getState();

    // Update node states based on current user skills
    const updatedGraph = updateCareerGraphStates(currentGraph, userSkills);

    // Recalculate gap analysis
    let analysis: GapAnalysisResult | null = null;
    if (currentRoleBenchmark) {
      const rawAnalysis = analyzeCareerGaps(userSkills, currentRoleBenchmark.roleName, []);
      analysis = {
        readinessScore: rawAnalysis.readinessScore,
        gaps: rawAnalysis.gaps,
        strengths: rawAnalysis.strengths.map(s => ({
          skillId: s.skillId,
          skillName: s.skillName,
          currentLevel: s.level,
          requiredLevel: s.level,
          category: s.category,
        })),
        targetRole: {
          roleName: currentRoleBenchmark.roleName,
          description: currentRoleBenchmark.description,
        },
      };
    }

    // Recalculate stats
    const stats = getCareerGraphStats(updatedGraph);

    console.log('[GraphStore] Updated graph:', {
      nodes: updatedGraph.nodes.length,
      completionPercent: stats.completionPercent,
    });

    set({
      currentGraph: updatedGraph,
      gapAnalysis: analysis,
      stats,
    });
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  hoverNode: (nodeId) => {
    set({ hoveredNodeId: nodeId });
  },

  openNodePopup: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      isNodePopupOpen: true,
    });
  },

  closeNodePopup: () => {
    set({
      isNodePopupOpen: false,
    });
  },

  getSelectedNode: () => {
    const { currentGraph, selectedNodeId } = get();
    if (!currentGraph || !selectedNodeId) return null;
    return currentGraph.nodes.find(n => n.id === selectedNodeId) || null;
  },
}));
