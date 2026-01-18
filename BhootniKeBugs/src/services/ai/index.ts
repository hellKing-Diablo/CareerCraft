/**
 * AI Service Module
 *
 * Provides Devstral 2 integration for:
 * - Skill extraction from unstructured text
 * - Gap analysis explanation generation
 * - Node-level guidance
 *
 * The LLM is used ONLY for NLP tasks - all business logic
 * and calculations are handled by the backend.
 */

// Main service
export { AIService, getAIService, resetAIService } from './AIService';

// Client
export { DevstralClient, getDevstralClient, resetDevstralClient } from './DevstralClient';

// Cache
export { CacheManager, getCacheManager, resetCacheManager } from './CacheManager';

// Parsers
export {
  parseSkillExtractionResponse,
  parseExplanationResponse,
  parseNodeExplanationResponse,
  filterByConfidence,
  toValidatedSkills,
} from './ResponseParser';

export type { NodeExplanation } from './ResponseParser';

// Prompts
export {
  SKILL_EXTRACTION_SYSTEM_PROMPT,
  EXPLANATION_SYSTEM_PROMPT,
  NODE_EXPLANATION_SYSTEM_PROMPT,
  buildSkillExtractionUserPrompt,
  buildExplanationUserPrompt,
  buildNodeExplanationUserPrompt,
} from './prompts';

// Types
export type {
  // Skill extraction
  ExtractedSkill,
  ValidatedSkill,
  SkillExtractionResult,
  ExtractionRequest,
  ExtractionResponse,

  // Gap analysis
  SkillGap,
  GapAnalysisResult,
  GapAnalysisRequest,

  // Explanations
  GapExplanation,
  ExplanationContent,
  ExplanationRequest,
  ExplanationResponse,

  // API types
  DevstralMessage,
  DevstralRequest,
  DevstralResponse,

  // Cache
  CacheEntry,
  CacheConfig,

  // Circuit breaker
  CircuitState,
  CircuitBreakerConfig,

  // Errors
  AIServiceError,
} from './types';
