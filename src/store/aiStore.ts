import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AIModel,
  AIStatus,
  AIError,
  AIFeatureState,
  DashboardInsights,
  LearningPath,
  SkillGuidance,
  GapImprovementPlan,
} from '../types/ai';
import { getAIService } from '@/services/ai';
import type {
  GapAnalysisResult,
  ExplanationContent,
  ValidatedSkill,
  AIServiceError,
} from '@/services/ai/types';
import type { NodeExplanation } from '@/services/ai/ResponseParser';

// ============================================
// ERROR CONVERSION HELPER
// ============================================

/**
 * Convert AIServiceError to AIError for store state
 */
function toAIError(error: AIServiceError | null | undefined): AIError | null {
  if (!error) return null;

  const codeMap: Record<string, AIError['code']> = {
    VALIDATION_ERROR: 'invalid_key',
    LLM_ERROR: 'unknown',
    RATE_LIMIT: 'rate_limit',
    TIMEOUT: 'network_error',
    PARSE_ERROR: 'parse_error',
    NETWORK_ERROR: 'network_error',
  };

  return {
    code: codeMap[error.code] ?? 'unknown',
    message: error.message,
  };
}

// ============================================
// DEVSTRAL 2 INTEGRATION TYPES
// ============================================

interface ExtractionState {
  status: AIStatus;
  skills: ValidatedSkill[];
  notes: string | null;
  error: AIError | null;
}

interface AnalysisState {
  status: AIStatus;
  result: GapAnalysisResult | null;
  explanation: ExplanationContent | null;
  error: AIError | null;
  lastAnalyzed: Date | null;
}

interface NodeExplanationState {
  status: AIStatus;
  data: NodeExplanation | null;
  error: AIError | null;
}

interface AIState {
  // Configuration
  apiKey: string;
  model: AIModel;
  isConfigured: boolean;
  isValidating: boolean;

  // Feature states (existing)
  dashboardInsights: AIFeatureState<DashboardInsights>;
  learningPath: AIFeatureState<LearningPath>;
  gapImprovementPlan: AIFeatureState<GapImprovementPlan>;
  skillGuidance: Record<string, AIFeatureState<SkillGuidance>>;

  // Devstral 2 states (new)
  extraction: ExtractionState;
  analysis: AnalysisState;
  nodeExplanations: Record<string, NodeExplanationState>;

  // Rate limiting
  lastRequestTime: number | null;
  requestCount: number;

  // Actions
  setApiKey: (key: string) => void;
  setModel: (model: AIModel) => void;
  clearApiKey: () => void;
  setValidating: (validating: boolean) => void;
  setConfigured: (configured: boolean) => void;

  // Feature state actions (existing)
  setDashboardInsightsStatus: (status: AIStatus, data?: DashboardInsights | null, error?: AIError | null) => void;
  setLearningPathStatus: (status: AIStatus, data?: LearningPath | null, error?: AIError | null) => void;
  setGapImprovementPlanStatus: (status: AIStatus, data?: GapImprovementPlan | null, error?: AIError | null) => void;
  setSkillGuidanceStatus: (skillId: string, status: AIStatus, data?: SkillGuidance | null, error?: AIError | null) => void;

  // Devstral 2 actions (new)
  extractSkills: (text: string, targetRoleId?: string) => Promise<ValidatedSkill[]>;
  analyzeGaps: (skills: Array<{ skill_id: string; level: number }>, targetRoleId: string) => GapAnalysisResult;
  generateExplanation: (userStage: string) => Promise<void>;
  getNodeExplanation: (skillId: string, userId: string, roleId: string, nodeData: {
    skill_name: string;
    current_level: number;
    required_level: number;
    state: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
    blocked_by: string[];
    unlocks: string[];
  }) => Promise<NodeExplanation | null>;
  clearAnalysis: () => void;

  // Rate limiting
  recordRequest: () => void;
  canMakeRequest: () => boolean;

  // Reset
  resetFeatureStates: () => void;
  resetAll: () => void;
}

const initialFeatureState = <T>(): AIFeatureState<T> => ({
  status: 'idle',
  data: null,
  error: null,
  lastFetched: null,
});

const initialExtractionState: ExtractionState = {
  status: 'idle',
  skills: [],
  notes: null,
  error: null,
};

const initialAnalysisState: AnalysisState = {
  status: 'idle',
  result: null,
  explanation: null,
  error: null,
  lastAnalyzed: null,
};

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Increased for Devstral 2
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests

// Check for environment variable
const ENV_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MISTRAL_API_KEY) as string | undefined;
const hasEnvKey = ENV_API_KEY && ENV_API_KEY !== 'your_api_key_here';

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial configuration - use env key if available
      apiKey: hasEnvKey ? ENV_API_KEY! : '',
      model: 'haiku',
      isConfigured: hasEnvKey || false,
      isValidating: false,

      // Initial feature states (existing)
      dashboardInsights: initialFeatureState<DashboardInsights>(),
      learningPath: initialFeatureState<LearningPath>(),
      gapImprovementPlan: initialFeatureState<GapImprovementPlan>(),
      skillGuidance: {},

      // Initial Devstral 2 states (new)
      extraction: initialExtractionState,
      analysis: initialAnalysisState,
      nodeExplanations: {},

      // Rate limiting
      lastRequestTime: null,
      requestCount: 0,

      // Configuration actions
      setApiKey: (key) => {
        const aiService = getAIService();
        aiService.setApiKey(key);
        set({
          apiKey: key,
          isConfigured: key.length > 0,
        });
      },

      setModel: (model) => {
        set({ model });
      },

      clearApiKey: () => {
        set({
          apiKey: '',
          isConfigured: false,
        });
        get().resetFeatureStates();
      },

      setValidating: (validating) => {
        set({ isValidating: validating });
      },

      setConfigured: (configured) => {
        set({ isConfigured: configured });
      },

      // Feature state actions
      setDashboardInsightsStatus: (status, data = null, error = null) => {
        set({
          dashboardInsights: {
            status,
            data: data ?? get().dashboardInsights.data,
            error,
            lastFetched: status === 'success' ? new Date() : get().dashboardInsights.lastFetched,
          },
        });
      },

      setLearningPathStatus: (status, data = null, error = null) => {
        set({
          learningPath: {
            status,
            data: data ?? get().learningPath.data,
            error,
            lastFetched: status === 'success' ? new Date() : get().learningPath.lastFetched,
          },
        });
      },

      setGapImprovementPlanStatus: (status, data = null, error = null) => {
        set({
          gapImprovementPlan: {
            status,
            data: data ?? get().gapImprovementPlan.data,
            error,
            lastFetched: status === 'success' ? new Date() : get().gapImprovementPlan.lastFetched,
          },
        });
      },

      setSkillGuidanceStatus: (skillId, status, data = null, error = null) => {
        const current = get().skillGuidance[skillId] || initialFeatureState<SkillGuidance>();
        set({
          skillGuidance: {
            ...get().skillGuidance,
            [skillId]: {
              status,
              data: data ?? current.data,
              error,
              lastFetched: status === 'success' ? new Date() : current.lastFetched,
            },
          },
        });
      },

      // Rate limiting
      recordRequest: () => {
        const now = Date.now();
        const { lastRequestTime, requestCount } = get();

        if (!lastRequestTime || now - lastRequestTime > RATE_LIMIT_WINDOW) {
          set({ lastRequestTime: now, requestCount: 1 });
        } else {
          set({ requestCount: requestCount + 1 });
        }
      },

      canMakeRequest: () => {
        const { lastRequestTime, requestCount } = get();
        const now = Date.now();

        // Enforce minimum interval between requests
        if (lastRequestTime && now - lastRequestTime < MIN_REQUEST_INTERVAL) {
          return false;
        }

        if (!lastRequestTime || now - lastRequestTime > RATE_LIMIT_WINDOW) {
          return true;
        }

        return requestCount < MAX_REQUESTS_PER_WINDOW;
      },

      // ============================================
      // DEVSTRAL 2 ACTIONS
      // ============================================

      extractSkills: async (text, targetRoleId) => {
        const aiService = getAIService();

        set({
          extraction: {
            status: 'loading',
            skills: [],
            notes: null,
            error: null,
          },
        });

        try {
          get().recordRequest();

          const response = await aiService.extractSkills({
            user_id: 'current_user', // Will be replaced with actual user ID
            text,
            context: { target_role_id: targetRoleId },
          });

          if (response.success && response.data) {
            set({
              extraction: {
                status: 'success',
                skills: response.data.valid_skills,
                notes: response.data.extraction_notes,
                error: null,
              },
            });
            return response.data.valid_skills;
          } else {
            set({
              extraction: {
                status: 'error',
                skills: [],
                notes: null,
                error: toAIError(response.error) ?? { code: 'unknown', message: 'Extraction failed' },
              },
            });
            return [];
          }
        } catch (error) {
          const err = error as Error;
          set({
            extraction: {
              status: 'error',
              skills: [],
              notes: null,
              error: { code: 'unknown', message: err.message },
            },
          });
          return [];
        }
      },

      analyzeGaps: (skills, targetRoleId) => {
        const aiService = getAIService();

        const result = aiService.analyzeGaps({
          user_id: 'current_user',
          skills: skills.map(s => ({ skill_id: s.skill_id, level: s.level as 1 | 2 | 3 | 4 | 5 })),
          target_role_id: targetRoleId,
        });

        set({
          analysis: {
            status: 'success',
            result,
            explanation: get().analysis.explanation,
            error: null,
            lastAnalyzed: new Date(),
          },
        });

        return result;
      },

      generateExplanation: async (userStage) => {
        const { analysis } = get();
        if (!analysis.result) {
          console.warn('No analysis result to generate explanation for');
          return;
        }

        const aiService = getAIService();

        set({
          analysis: {
            ...analysis,
            status: 'loading',
          },
        });

        try {
          get().recordRequest();

          const response = await aiService.generateExplanation({
            user_id: 'current_user',
            analysis_id: analysis.result.analysis_id,
            analysis_data: analysis.result,
            context: {
              user_stage: userStage as 'beginner' | 'student' | 'professional' | 'career_switcher',
            },
          });

          if (response.success && response.data) {
            set({
              analysis: {
                status: 'success',
                result: analysis.result,
                explanation: response.data.content,
                error: null,
                lastAnalyzed: analysis.lastAnalyzed,
              },
            });
          } else {
            set({
              analysis: {
                ...analysis,
                status: 'error',
                error: toAIError(response.error) ?? { code: 'unknown', message: 'Explanation generation failed' },
              },
            });
          }
        } catch (error) {
          const err = error as Error;
          set({
            analysis: {
              ...analysis,
              status: 'error',
              error: { code: 'unknown', message: err.message },
            },
          });
        }
      },

      getNodeExplanation: async (skillId, userId, roleId, nodeData) => {
        const { nodeExplanations } = get();

        // Check if already loaded
        const existing = nodeExplanations[skillId];
        if (existing?.status === 'success' && existing.data) {
          return existing.data;
        }

        // Set loading state
        set({
          nodeExplanations: {
            ...nodeExplanations,
            [skillId]: {
              status: 'loading',
              data: null,
              error: null,
            },
          },
        });

        try {
          const aiService = getAIService();

          const result = await aiService.generateNodeExplanation(
            {
              skill_id: skillId,
              skill_name: nodeData.skill_name,
              current_level: nodeData.current_level,
              required_level: nodeData.required_level,
              target_role: roleId,
              state: nodeData.state,
              blocked_by: nodeData.blocked_by,
              unlocks: nodeData.unlocks,
            },
            userId
          );

          set({
            nodeExplanations: {
              ...get().nodeExplanations,
              [skillId]: {
                status: 'success',
                data: result,
                error: null,
              },
            },
          });

          return result;
        } catch (error) {
          const err = error as Error;
          set({
            nodeExplanations: {
              ...get().nodeExplanations,
              [skillId]: {
                status: 'error',
                data: null,
                error: { code: 'unknown', message: err.message },
              },
            },
          });
          return null;
        }
      },

      clearAnalysis: () => {
        const aiService = getAIService();
        aiService.invalidateExplanations();

        set({
          analysis: initialAnalysisState,
          nodeExplanations: {},
        });
      },

      // Reset actions
      resetFeatureStates: () => {
        set({
          dashboardInsights: initialFeatureState<DashboardInsights>(),
          learningPath: initialFeatureState<LearningPath>(),
          gapImprovementPlan: initialFeatureState<GapImprovementPlan>(),
          skillGuidance: {},
          extraction: initialExtractionState,
          analysis: initialAnalysisState,
          nodeExplanations: {},
        });
      },

      resetAll: () => {
        const aiService = getAIService();
        aiService.clearAllCache();

        set({
          apiKey: '',
          model: 'haiku',
          isConfigured: false,
          isValidating: false,
          dashboardInsights: initialFeatureState<DashboardInsights>(),
          learningPath: initialFeatureState<LearningPath>(),
          gapImprovementPlan: initialFeatureState<GapImprovementPlan>(),
          skillGuidance: {},
          extraction: initialExtractionState,
          analysis: initialAnalysisState,
          nodeExplanations: {},
          lastRequestTime: null,
          requestCount: 0,
        });
      },
    }),
    {
      name: 'careercraft-ai',
      partialize: (state) => ({
        apiKey: state.apiKey,
        model: state.model,
        isConfigured: state.isConfigured,
        // Cache insights and learning path but not skill guidance (too much data)
        dashboardInsights: state.dashboardInsights,
        learningPath: state.learningPath,
        gapImprovementPlan: state.gapImprovementPlan,
      }),
    }
  )
);
