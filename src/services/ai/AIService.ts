/**
 * AI Service
 * Main orchestrator for Devstral 2 integration
 * Handles skill extraction, gap analysis, and explanation generation
 */

import { skills as careerSkills } from '@/data/careerData';
import { generateRoleBenchmark } from '@/engine/careerGraphGenerator';
import type { SkillLevel } from '@/types';
import { getDevstralClient } from './DevstralClient';
import { getCacheManager } from './CacheManager';
import {
  SKILL_EXTRACTION_SYSTEM_PROMPT,
  buildSkillExtractionUserPrompt,
  EXPLANATION_SYSTEM_PROMPT,
  buildExplanationUserPrompt,
  NODE_EXPLANATION_SYSTEM_PROMPT,
  buildNodeExplanationUserPrompt,
  type ExplanationPromptData,
  type NodeExplanationPromptData,
} from './prompts';
import {
  parseSkillExtractionResponse,
  parseExplanationResponse,
  parseNodeExplanationResponse,
  filterByConfidence,
  toValidatedSkills,
  type NodeExplanation,
} from './ResponseParser';
import type {
  ExtractionRequest,
  ExtractionResponse,
  GapAnalysisRequest,
  GapAnalysisResult,
  SkillGap,
  PathStep,
  SkillStrength,
  ExplanationRequest,
  ExplanationResponse,
  ExplanationContent,
  ValidatedSkill,
  AIServiceError,
} from './types';

// ============================================
// AI SERVICE CLASS
// ============================================

export class AIService {
  private client = getDevstralClient();
  private cache = getCacheManager();
  private ontologyVersion = 'v1'; // Increment when ontology changes

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Configure the API key
   */
  setApiKey(apiKey: string): void {
    this.client.setApiKey(apiKey);
  }

  /**
   * Check if service is ready
   */
  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  // ============================================
  // SKILL EXTRACTION
  // ============================================

  /**
   * Extract skills from unstructured text
   */
  async extractSkills(request: ExtractionRequest): Promise<ExtractionResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Validate input
      if (!request.text || request.text.trim().length === 0) {
        return this.createErrorResponse(requestId, startTime, {
          code: 'VALIDATION_ERROR',
          message: 'Text is required',
          retryable: false,
        });
      }

      // Sanitize and limit text
      const sanitizedText = this.sanitizeText(request.text, 5000);

      // Get relevant skills from ontology
      const relevantSkills = this.getRelevantSkills(request.context?.target_role_id);
      const allowedSkillIds = new Set(relevantSkills.map(s => s.id));

      // Check cache
      const cacheKey = this.cache.generateExtractionKey(sanitizedText, this.ontologyVersion);
      const useCache = request.options?.use_cache !== false;

      if (useCache) {
        const cached = this.cache.get<ExtractionResponse['data']>(cacheKey);
        if (cached) {
          return {
            success: true,
            request_id: requestId,
            timestamp: new Date().toISOString(),
            data: cached,
            meta: {
              llm_called: false,
              cache_hit: true,
              processing_time_ms: Date.now() - startTime,
              cache_key: cacheKey,
            },
          };
        }
      }

      // Check if API is configured
      if (!this.isConfigured()) {
        // Return fallback with keyword matching
        const fallbackResult = this.keywordFallbackExtraction(sanitizedText, relevantSkills);
        return {
          success: true,
          request_id: requestId,
          timestamp: new Date().toISOString(),
          data: fallbackResult,
          meta: {
            llm_called: false,
            cache_hit: false,
            processing_time_ms: Date.now() - startTime,
            cache_key: null,
          },
        };
      }

      // Build prompt
      const skillList = relevantSkills.map(s => ({ id: s.id, name: s.skillName }));
      const userPrompt = buildSkillExtractionUserPrompt(sanitizedText, skillList);

      // Call Devstral 2
      const { content } = await this.client.chat(
        [
          { role: 'system', content: SKILL_EXTRACTION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        { temperature: 0.1, maxTokens: 800, jsonMode: true }
      );

      // Parse response
      const parsed = parseSkillExtractionResponse(content, allowedSkillIds);

      // Filter by confidence threshold
      const confidenceThreshold = request.options?.confidence_threshold ?? 0.6;
      const filteredSkills = filterByConfidence(parsed.extracted_skills, confidenceThreshold);

      // Limit max skills
      const maxSkills = request.options?.max_skills ?? 20;
      const limitedSkills = filteredSkills.slice(0, maxSkills);

      // Convert to validated skills
      const validSkills = toValidatedSkills(limitedSkills);

      const result: ExtractionResponse['data'] = {
        extracted_skills: limitedSkills,
        valid_skills: validSkills as ValidatedSkill[],
        discarded_count: parsed.extracted_skills.length - limitedSkills.length,
        extraction_notes: parsed.extraction_notes,
      };

      // Cache result
      if (useCache) {
        this.cache.set(cacheKey, result);
      }

      return {
        success: true,
        request_id: requestId,
        timestamp: new Date().toISOString(),
        data: result,
        meta: {
          llm_called: true,
          cache_hit: false,
          processing_time_ms: Date.now() - startTime,
          cache_key: cacheKey,
        },
      };
    } catch (error) {
      const aiError = error as AIServiceError;
      return this.createErrorResponse(requestId, startTime, aiError);
    }
  }

  // ============================================
  // GAP ANALYSIS (No LLM)
  // ============================================

  /**
   * Analyze skill gaps against a target role
   * This is DETERMINISTIC - no LLM involved
   */
  analyzeGaps(request: GapAnalysisRequest): GapAnalysisResult {
    const analysisId = `gap_${this.generateRequestId()}`;

    // Generate role benchmark dynamically from role ID (which is now a job title)
    // The role ID format is "role_job_title" so we extract the job title
    const jobTitle = request.target_role_id.replace(/^role_/, '').replace(/_/g, ' ');
    const roleBenchmark = generateRoleBenchmark(jobTitle);

    if (!roleBenchmark || roleBenchmark.requiredSkills.length === 0) {
      // Return empty result if no skills found for this role
      return {
        analysis_id: analysisId,
        target_role: {
          id: request.target_role_id,
          name: jobTitle,
        },
        readiness: {
          percentage: 0,
          is_ready: false,
          skills_met: 0,
          skills_required: 0,
        },
        gaps: [],
        recommended_path: [],
        strengths: [],
      };
    }

    // Build user skill map
    const userSkillMap = new Map<string, number>();
    for (const skill of request.skills) {
      userSkillMap.set(skill.skill_id, skill.level);
    }

    // Calculate gaps
    const gaps: SkillGap[] = [];
    const strengths: SkillStrength[] = [];
    let skillsMet = 0;

    for (const required of roleBenchmark.requiredSkills) {
      const currentLevel = userSkillMap.get(required.skillId) ?? 0;
      const requiredLevel = required.minimumLevel;
      const gap = requiredLevel - currentLevel;

      if (gap <= 0) {
        // Skill meets or exceeds requirement
        skillsMet++;
        if (currentLevel > requiredLevel) {
          strengths.push({
            skill_id: required.skillId,
            skill_name: required.skillName,
            level: currentLevel,
            exceeds_by: currentLevel - requiredLevel,
          });
        }
      } else {
        // Skill gap exists
        const priority = this.calculatePriority(gap, required.priority);

        gaps.push({
          skill_id: required.skillId,
          skill_name: required.skillName,
          current_level: currentLevel,
          required_level: requiredLevel,
          gap,
          priority,
          is_blocking: false,
          blocked_by: [],
        });
      }
    }

    // Sort gaps by priority
    gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Generate recommended path
    const recommendedPath = this.generateLearningPath(gaps, userSkillMap);

    // Calculate readiness
    const skillsRequired = roleBenchmark.requiredSkills.length;
    const percentage = skillsRequired > 0 ? Math.round((skillsMet / skillsRequired) * 100) : 0;

    return {
      analysis_id: analysisId,
      target_role: {
        id: roleBenchmark.id,
        name: roleBenchmark.roleName,
      },
      readiness: {
        percentage,
        is_ready: skillsMet === skillsRequired,
        skills_met: skillsMet,
        skills_required: skillsRequired,
      },
      gaps,
      recommended_path: recommendedPath,
      strengths,
    };
  }

  // ============================================
  // EXPLANATION GENERATION
  // ============================================

  /**
   * Generate natural language explanations for gap analysis
   */
  async generateExplanation(request: ExplanationRequest): Promise<ExplanationResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      const tone = request.context.tone ?? 'encouraging';
      const useCache = request.options?.use_cache !== false;

      // Check cache
      const cacheKey = this.cache.generateExplanationKey(
        request.analysis_id,
        request.context.user_stage,
        tone
      );

      if (useCache) {
        const cached = this.cache.get<ExplanationContent>(cacheKey);
        if (cached) {
          return {
            success: true,
            request_id: requestId,
            timestamp: new Date().toISOString(),
            data: {
              explanation_id: `expl_${requestId}`,
              analysis_id: request.analysis_id,
              content: cached,
            },
            meta: {
              llm_called: false,
              cache_hit: true,
              processing_time_ms: Date.now() - startTime,
              tokens_used: null,
            },
          };
        }
      }

      // Check if API is configured
      if (!this.isConfigured()) {
        // Return template-based fallback
        const fallbackContent = this.templateFallbackExplanation(request.analysis_data);
        return {
          success: true,
          request_id: requestId,
          timestamp: new Date().toISOString(),
          data: {
            explanation_id: `expl_${requestId}`,
            analysis_id: request.analysis_id,
            content: fallbackContent,
          },
          meta: {
            llm_called: false,
            cache_hit: false,
            processing_time_ms: Date.now() - startTime,
            tokens_used: null,
          },
        };
      }

      // Build prompt data
      const maxGaps = request.options?.max_gap_explanations ?? 5;
      const promptData: ExplanationPromptData = {
        user_stage: request.context.user_stage,
        target_role_name: request.analysis_data.target_role.name,
        readiness_percent: request.analysis_data.readiness.percentage,
        skills_met: request.analysis_data.readiness.skills_met,
        skills_total: request.analysis_data.readiness.skills_required,
        gaps: request.analysis_data.gaps.slice(0, maxGaps),
        path: request.analysis_data.recommended_path.slice(0, 5).map(p => ({
          skill_name: p.skill_name,
          reason: p.reason,
        })),
        strengths: request.analysis_data.strengths.map(s => ({
          skill_name: s.skill_name,
          level: s.level,
        })),
      };

      const userPrompt = buildExplanationUserPrompt(promptData);

      // Call Devstral 2
      const { content, tokensUsed } = await this.client.chat(
        [
          { role: 'system', content: EXPLANATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        { temperature: 0.5, maxTokens: 1000, jsonMode: true }
      );

      // Parse response
      const expectedSkillIds = new Set(request.analysis_data.gaps.map(g => g.skill_id));
      const parsed = parseExplanationResponse(content, expectedSkillIds);

      // Remove motivation if not requested
      if (!request.options?.include_motivation) {
        parsed.motivation = null;
      }

      // Cache result
      if (useCache) {
        this.cache.set(cacheKey, parsed);
      }

      return {
        success: true,
        request_id: requestId,
        timestamp: new Date().toISOString(),
        data: {
          explanation_id: `expl_${requestId}`,
          analysis_id: request.analysis_id,
          content: parsed,
        },
        meta: {
          llm_called: true,
          cache_hit: false,
          processing_time_ms: Date.now() - startTime,
          tokens_used: tokensUsed,
        },
      };
    } catch (error) {
      const aiError = error as AIServiceError;

      // Return fallback on error
      const fallbackContent = this.templateFallbackExplanation(request.analysis_data);
      return {
        success: true, // Still "success" because we have fallback
        request_id: requestId,
        timestamp: new Date().toISOString(),
        data: {
          explanation_id: `expl_${requestId}`,
          analysis_id: request.analysis_id,
          content: fallbackContent,
        },
        error: aiError,
        meta: {
          llm_called: true,
          cache_hit: false,
          processing_time_ms: Date.now() - startTime,
          tokens_used: null,
        },
      };
    }
  }

  /**
   * Generate explanation for a single skill node
   */
  async generateNodeExplanation(
    data: NodeExplanationPromptData,
    userId: string
  ): Promise<NodeExplanation> {
    // Check cache
    const cacheKey = this.cache.generateNodeExplanationKey(
      data.skill_id,
      userId,
      data.target_role
    );

    const cached = this.cache.get<NodeExplanation>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fallback if not configured
    if (!this.isConfigured()) {
      return this.templateNodeExplanation(data);
    }

    try {
      const userPrompt = buildNodeExplanationUserPrompt(data);

      const { content } = await this.client.chat(
        [
          { role: 'system', content: NODE_EXPLANATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        { temperature: 0.3, maxTokens: 400, jsonMode: true }
      );

      const parsed = parseNodeExplanationResponse(content);

      // Cache result
      this.cache.set(cacheKey, parsed);

      return parsed;
    } catch {
      // Return template fallback
      return this.templateNodeExplanation(data);
    }
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /**
   * Invalidate cache for specific patterns
   */
  invalidateExplanations(analysisId?: string): void {
    if (analysisId) {
      this.cache.clearByPrefix(`explain:${analysisId}`);
    } else {
      this.cache.clearByPrefix('explain:');
    }
  }

  /**
   * Invalidate node explanations for a user
   */
  invalidateNodeExplanations(userId: string, skillId?: string): void {
    if (skillId) {
      this.cache.clearByPrefix(`node:${skillId}:${userId}`);
    } else {
      // Clear all node explanations for user
      // This is a bit crude but works for the use case
      this.cache.clearByPrefix('node:');
    }
  }

  /**
   * Clear all caches
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { memoryEntries: number; storageEntries: number; totalHits: number } {
    return this.cache.getStats();
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private generateRequestId(): string {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private sanitizeText(text: string, maxLength: number): string {
    let sanitized = text
      // Remove potential PII patterns
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();

    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength) + '...';
    }

    return sanitized;
  }

  private getRelevantSkills(targetRoleId?: string): typeof careerSkills {
    if (!targetRoleId) {
      // Return foundational skills (level 1-2)
      return careerSkills.filter(s => s.skillLevel <= 2);
    }

    // Generate role benchmark dynamically
    const jobTitle = targetRoleId.replace(/^role_/, '').replace(/_/g, ' ');
    const roleBenchmark = generateRoleBenchmark(jobTitle);

    if (!roleBenchmark) {
      return careerSkills.filter(s => s.skillLevel <= 2);
    }

    // Get skills required for role
    const relevantIds = new Set<string>(roleBenchmark.requiredSkills.map(r => r.skillId));

    return careerSkills.filter(s => relevantIds.has(s.id) || s.skillLevel <= 2);
  }

  private calculatePriority(gap: number, importance: string): SkillGap['priority'] {
    if (importance === 'core' && gap >= 3) return 'critical';
    if (importance === 'core' || gap >= 3) return 'high';
    if (gap >= 2) return 'medium';
    return 'low';
  }

  private generateLearningPath(gaps: SkillGap[], _userSkillMap: Map<string, number>): PathStep[] {
    const path: PathStep[] = [];
    const added = new Set<string>();

    // Add gap skills in priority order (no prerequisites in new data)
    for (const gap of gaps) {
      if (!added.has(gap.skill_id)) {
        path.push({
          skill_id: gap.skill_id,
          skill_name: gap.skill_name,
          order: path.length + 1,
          reason: `${gap.priority} priority gap`,
        });
        added.add(gap.skill_id);
      }
    }

    return path;
  }

  // ============================================
  // FALLBACK IMPLEMENTATIONS
  // ============================================

  private keywordFallbackExtraction(
    text: string,
    skills: typeof careerSkills
  ): ExtractionResponse['data'] {
    const lowerText = text.toLowerCase();
    const extracted: ValidatedSkill[] = [];

    for (const skill of skills) {
      const nameLower = skill.skillName.toLowerCase();
      if (lowerText.includes(nameLower)) {
        extracted.push({
          skill_id: skill.id,
          skill_name: skill.skillName,
          level: 2 as SkillLevel, // Default level
          confidence: 0.5, // Low confidence for keyword match
          source: 'extracted',
        });
      }
    }

    return {
      extracted_skills: extracted.map(s => ({
        mentioned_text: s.skill_name,
        matched_id: s.skill_id,
        matched_name: s.skill_name,
        inferred_level: s.level,
        confidence: s.confidence,
        evidence: 'Keyword match (AI not configured)',
      })),
      valid_skills: extracted,
      discarded_count: 0,
      extraction_notes: 'Keyword-based extraction (configure API key for AI extraction)',
    };
  }

  private templateFallbackExplanation(analysis: GapAnalysisResult): ExplanationContent {
    const topGaps = analysis.gaps.slice(0, 3);
    const gapNames = topGaps.map(g => g.skill_name).join(', ');

    return {
      summary: `You're ${analysis.readiness.percentage}% ready for ${analysis.target_role.name}. ${analysis.readiness.skills_met} of ${analysis.readiness.skills_required} skills meet the requirements.`,
      gap_explanations: topGaps.map(gap => ({
        skill_id: gap.skill_id,
        skill_name: gap.skill_name,
        explanation: `You need to improve ${gap.skill_name} from level ${gap.current_level} to level ${gap.required_level}.`,
        action_hint: gap.is_blocking
          ? `First complete: ${gap.blocked_by.join(', ')}`
          : 'Practice and build projects with this skill.',
      })),
      recommendation: `Focus on: ${gapNames}. Follow the recommended learning path for best results.`,
      motivation: 'Keep learning and you will reach your goal!',
      warnings: [],
    };
  }

  private templateNodeExplanation(data: NodeExplanationPromptData): NodeExplanation {
    const stateMessages: Record<string, string> = {
      LOCKED: `This skill is locked. Complete ${data.blocked_by.join(', ') || 'prerequisites'} first.`,
      UNLOCKED: 'This skill is ready to learn. Start building your knowledge.',
      IN_PROGRESS: `You're at level ${data.current_level}. Keep practicing to reach level ${data.required_level}.`,
      COMPLETED: 'Great job! You\'ve mastered this skill.',
    };

    return {
      why_important: `${data.skill_name} is required for ${data.target_role} at level ${data.required_level}.`,
      current_state: stateMessages[data.state] || 'Continue working on this skill.',
      next_action: data.state === 'LOCKED'
        ? `Complete ${data.blocked_by[0] || 'prerequisites'} to unlock.`
        : 'Practice through projects and exercises.',
      estimated_effort: data.required_level > data.current_level
        ? `~${(data.required_level - data.current_level) * 20} hours to reach target`
        : 'Skill requirement met',
    };
  }

  private createErrorResponse(
    requestId: string,
    startTime: number,
    error: AIServiceError
  ): ExtractionResponse {
    return {
      success: false,
      request_id: requestId,
      timestamp: new Date().toISOString(),
      error,
      meta: {
        llm_called: false,
        cache_hit: false,
        processing_time_ms: Date.now() - startTime,
        cache_key: null,
      },
    };
  }
}

// Singleton instance
let serviceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!serviceInstance) {
    serviceInstance = new AIService();
  }
  return serviceInstance;
}

export function resetAIService(): void {
  serviceInstance = null;
}
