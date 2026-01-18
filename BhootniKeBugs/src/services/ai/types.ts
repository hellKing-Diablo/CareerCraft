/**
 * AI Service Types
 * Type definitions for Devstral 2 integration
 */

import { SkillLevel } from '@/types';

// ============================================
// SKILL EXTRACTION TYPES
// ============================================

export interface ExtractedSkill {
  mentioned_text: string;
  matched_id: string | null;
  matched_name: string | null;
  inferred_level: SkillLevel;
  confidence: number;
  evidence: string;
}

export interface SkillExtractionResult {
  extracted_skills: ExtractedSkill[];
  extraction_notes: string;
}

export interface ValidatedSkill {
  skill_id: string;
  skill_name: string;
  level: SkillLevel;
  confidence: number;
  source: 'extracted';
}

export interface ExtractionRequest {
  user_id: string;
  text: string;
  context?: {
    target_role_id?: string;
    extraction_mode?: 'resume' | 'description' | 'project';
  };
  options?: {
    confidence_threshold?: number;
    max_skills?: number;
    use_cache?: boolean;
  };
}

export interface ExtractionResponse {
  success: boolean;
  request_id: string;
  timestamp: string;
  data?: {
    extracted_skills: ExtractedSkill[];
    valid_skills: ValidatedSkill[];
    discarded_count: number;
    extraction_notes: string;
  };
  error?: AIServiceError;
  meta: {
    llm_called: boolean;
    cache_hit: boolean;
    processing_time_ms: number;
    cache_key: string | null;
  };
}

// ============================================
// GAP ANALYSIS TYPES (No LLM)
// ============================================

export interface GapAnalysisRequest {
  user_id: string;
  skills: Array<{ skill_id: string; level: SkillLevel }>;
  target_role_id: string;
}

export interface SkillGap {
  skill_id: string;
  skill_name: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  is_blocking: boolean;
  blocked_by: string[];
}

export interface PathStep {
  skill_id: string;
  skill_name: string;
  order: number;
  reason: string;
}

export interface SkillStrength {
  skill_id: string;
  skill_name: string;
  level: number;
  exceeds_by: number;
}

export interface GapAnalysisResult {
  analysis_id: string;
  target_role: {
    id: string;
    name: string;
  };
  readiness: {
    percentage: number;
    is_ready: boolean;
    skills_met: number;
    skills_required: number;
  };
  gaps: SkillGap[];
  recommended_path: PathStep[];
  strengths: SkillStrength[];
}

// ============================================
// EXPLANATION TYPES
// ============================================

export interface ExplanationRequest {
  user_id: string;
  analysis_id: string;
  analysis_data: GapAnalysisResult;
  context: {
    user_stage: 'beginner' | 'student' | 'professional' | 'career_switcher';
    tone?: 'encouraging' | 'direct' | 'detailed';
  };
  options?: {
    include_motivation?: boolean;
    max_gap_explanations?: number;
    use_cache?: boolean;
  };
}

export interface GapExplanation {
  skill_id: string;
  skill_name: string;
  explanation: string;
  action_hint: string;
}

export interface ExplanationContent {
  summary: string;
  gap_explanations: GapExplanation[];
  recommendation: string;
  motivation: string | null;
  warnings: string[];
}

export interface ExplanationResult {
  explanation_id: string;
  analysis_id: string;
  content: ExplanationContent;
}

export interface ExplanationResponse {
  success: boolean;
  request_id: string;
  timestamp: string;
  data?: ExplanationResult;
  error?: AIServiceError;
  meta: {
    llm_called: boolean;
    cache_hit: boolean;
    processing_time_ms: number;
    tokens_used: number | null;
  };
}

// ============================================
// ERROR TYPES
// ============================================

export type AIErrorCode =
  | 'VALIDATION_ERROR'
  | 'LLM_ERROR'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'CACHE_ERROR'
  | 'NETWORK_ERROR';

export interface AIServiceError {
  code: AIErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ============================================
// DEVSTRAL API TYPES
// ============================================

export interface DevstralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DevstralRequest {
  model: string;
  messages: DevstralMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

export interface DevstralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// CACHE TYPES
// ============================================

export interface CacheEntry<T> {
  key: string;
  data: T;
  created_at: Date;
  expires_at: Date;
  hit_count: number;
  last_hit_at: Date;
}

export interface CacheConfig {
  extraction_ttl_ms: number;
  explanation_ttl_ms: number;
  max_memory_entries: number;
}

// ============================================
// CIRCUIT BREAKER TYPES
// ============================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failure_threshold: number;
  reset_timeout_ms: number;
  half_open_max_calls: number;
}
