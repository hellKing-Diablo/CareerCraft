// ============================================
// AI CONFIGURATION TYPES
// ============================================
// Model mapping: 'haiku' -> Gemini 2.0 Flash, 'sonnet' -> Gemini 1.5 Flash
export type AIModel = 'haiku' | 'sonnet';

export interface AIConfig {
  apiKey: string;
  model: AIModel;
  isConfigured: boolean;
}

// ============================================
// AI STATUS TYPES
// ============================================
export type AIStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIError {
  code: 'no_api_key' | 'invalid_key' | 'rate_limit' | 'network_error' | 'parse_error' | 'unknown';
  message: string;
}

export interface AIFeatureState<T> {
  status: AIStatus;
  data: T | null;
  error: AIError | null;
  lastFetched: Date | null;
}

// ============================================
// AI REQUEST/RESPONSE TYPES
// ============================================
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model: string;
  max_tokens: number;
  messages: AIMessage[];
}

export interface AIResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ============================================
// DASHBOARD INSIGHTS TYPES
// ============================================
export interface CareerInsight {
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardInsights {
  summary: string;
  insights: CareerInsight[];
  encouragement: string;
  nextSteps: string[];
}

// ============================================
// LEARNING PATH TYPES
// ============================================
export interface LearningStep {
  order: number;
  skillId: string;
  skillName: string;
  description: string;
  estimatedWeeks: number;
  resources: string[];
  milestones: string[];
}

export interface LearningPath {
  title: string;
  overview: string;
  totalWeeks: number;
  steps: LearningStep[];
  tips: string[];
}

// ============================================
// SKILL GUIDANCE TYPES
// ============================================
export interface LearningResource {
  type: 'course' | 'book' | 'tutorial' | 'practice' | 'project';
  title: string;
  description: string;
}

export interface SkillGuidance {
  skillId: string;
  overview: string;
  whyImportant: string;
  learningTips: string[];
  resources: LearningResource[];
  practiceIdeas: string[];
  commonMistakes: string[];
  estimatedTimeToLevel: Record<number, string>;
}

// ============================================
// GAP IMPROVEMENT PLAN TYPES
// ============================================
export interface ImprovementAction {
  skillId: string;
  skillName: string;
  action: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
}

export interface GapImprovementPlan {
  summary: string;
  quickWins: ImprovementAction[];
  strategicActions: ImprovementAction[];
  longTermGoals: ImprovementAction[];
  weeklyPlan: string[];
}

// ============================================
// AI CONTEXT TYPES
// ============================================
export interface AIContext {
  userName: string;
  userStage: string;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    category: string;
  }>;
  careerGoals: {
    shortTerm: string | null;
    longTerm: string | null;
  };
  gapAnalysis: {
    readinessScore: number;
    gaps: Array<{
      skillName: string;
      currentLevel: number;
      requiredLevel: number;
      priority: string;
    }>;
    strengths: Array<{
      skillName: string;
      currentLevel: number;
      requiredLevel: number;
    }>;
  } | null;
  targetRole: {
    name: string;
    description: string;
  } | null;
}
