/**
 * Response Parser
 * Validates and parses Devstral 2 responses
 */

import type {
  SkillExtractionResult,
  ExtractedSkill,
  ExplanationContent,
  GapExplanation,
  AIServiceError,
} from './types';

// ============================================
// VALIDATION HELPERS
// ============================================

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================
// SKILL EXTRACTION PARSER
// ============================================

export function parseSkillExtractionResponse(
  rawContent: string,
  allowedSkillIds: Set<string>
): SkillExtractionResult {
  // Try to parse JSON
  let parsed: unknown;
  try {
    // Clean up common issues
    const cleaned = cleanJsonString(rawContent);
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw createParseError(`Invalid JSON response: ${(error as Error).message}`);
  }

  if (!isObject(parsed)) {
    throw createParseError('Response is not an object');
  }

  // Extract skills array
  const rawSkills = parsed.extracted_skills;
  if (!isArray(rawSkills)) {
    // Return empty result if no skills array
    return {
      extracted_skills: [],
      extraction_notes: isString(parsed.extraction_notes)
        ? parsed.extraction_notes
        : 'No skills extracted',
    };
  }

  // Parse and validate each skill
  const extractedSkills: ExtractedSkill[] = [];

  for (const rawSkill of rawSkills) {
    if (!isObject(rawSkill)) continue;

    const skill = parseExtractedSkill(rawSkill, allowedSkillIds);
    if (skill) {
      extractedSkills.push(skill);
    }
  }

  return {
    extracted_skills: extractedSkills,
    extraction_notes: isString(parsed.extraction_notes)
      ? parsed.extraction_notes
      : `Extracted ${extractedSkills.length} skills`,
  };
}

function parseExtractedSkill(
  raw: Record<string, unknown>,
  allowedSkillIds: Set<string>
): ExtractedSkill | null {
  // Required fields
  const mentionedText = isString(raw.mentioned_text) ? raw.mentioned_text : '';
  const matchedId = isString(raw.matched_id) ? raw.matched_id : null;
  const matchedName = isString(raw.matched_name) ? raw.matched_name : null;

  // Validate matched_id against allowed list
  const validatedMatchedId = matchedId && allowedSkillIds.has(matchedId) ? matchedId : null;

  // Parse level (1-5)
  let inferredLevel = isNumber(raw.inferred_level) ? raw.inferred_level : 2;
  inferredLevel = Math.round(clamp(inferredLevel, 1, 5)) as 1 | 2 | 3 | 4 | 5;

  // Parse confidence (0-1)
  let confidence = isNumber(raw.confidence) ? raw.confidence : 0.5;
  confidence = clamp(confidence, 0, 1);

  // Evidence
  const evidence = isString(raw.evidence) ? raw.evidence : '';

  return {
    mentioned_text: mentionedText,
    matched_id: validatedMatchedId,
    matched_name: validatedMatchedId ? matchedName : null,
    inferred_level: inferredLevel as 1 | 2 | 3 | 4 | 5,
    confidence,
    evidence,
  };
}

// ============================================
// EXPLANATION PARSER
// ============================================

export function parseExplanationResponse(
  rawContent: string,
  expectedSkillIds: Set<string>
): ExplanationContent {
  // Try to parse JSON
  let parsed: unknown;
  try {
    const cleaned = cleanJsonString(rawContent);
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw createParseError(`Invalid JSON response: ${(error as Error).message}`);
  }

  if (!isObject(parsed)) {
    throw createParseError('Response is not an object');
  }

  // Parse summary
  const summary = isString(parsed.summary)
    ? truncate(parsed.summary, 200)
    : 'Analysis complete.';

  // Parse gap explanations
  const rawGapExplanations = parsed.gap_explanations;
  const gapExplanations: GapExplanation[] = [];

  if (isArray(rawGapExplanations)) {
    for (const rawGap of rawGapExplanations) {
      if (!isObject(rawGap)) continue;

      const gapExplanation = parseGapExplanation(rawGap, expectedSkillIds);
      if (gapExplanation) {
        gapExplanations.push(gapExplanation);
      }
    }
  }

  // Parse recommendation
  const recommendation = isString(parsed.recommendation)
    ? truncate(parsed.recommendation, 400)
    : 'Continue learning to progress toward your goal.';

  // Parse motivation
  const motivation = isString(parsed.motivation)
    ? truncate(parsed.motivation, 150)
    : null;

  // Parse warnings
  const warnings: string[] = [];
  if (isArray(parsed.warnings)) {
    for (const warning of parsed.warnings) {
      if (isString(warning)) {
        warnings.push(truncate(warning, 200));
      }
    }
  }

  return {
    summary,
    gap_explanations: gapExplanations,
    recommendation,
    motivation,
    warnings,
  };
}

function parseGapExplanation(
  raw: Record<string, unknown>,
  expectedSkillIds: Set<string>
): GapExplanation | null {
  const skillId = isString(raw.skill_id) ? raw.skill_id : '';
  const skillName = isString(raw.skill_name) ? raw.skill_name : '';

  // Validate skill_id against expected list
  if (!expectedSkillIds.has(skillId)) {
    // Skip explanations for skills not in the original analysis
    return null;
  }

  const explanation = isString(raw.explanation)
    ? truncate(raw.explanation, 300)
    : 'Focus on improving this skill.';

  const actionHint = isString(raw.action_hint)
    ? truncate(raw.action_hint, 200)
    : 'Practice regularly.';

  return {
    skill_id: skillId,
    skill_name: skillName,
    explanation,
    action_hint: actionHint,
  };
}

// ============================================
// NODE EXPLANATION PARSER
// ============================================

export interface NodeExplanation {
  why_important: string;
  current_state: string;
  next_action: string;
  estimated_effort: string;
}

export function parseNodeExplanationResponse(rawContent: string): NodeExplanation {
  let parsed: unknown;
  try {
    const cleaned = cleanJsonString(rawContent);
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw createParseError(`Invalid JSON response: ${(error as Error).message}`);
  }

  if (!isObject(parsed)) {
    throw createParseError('Response is not an object');
  }

  return {
    why_important: isString(parsed.why_important)
      ? truncate(parsed.why_important, 200)
      : 'This skill is important for your career goal.',
    current_state: isString(parsed.current_state)
      ? truncate(parsed.current_state, 200)
      : 'Continue working on this skill.',
    next_action: isString(parsed.next_action)
      ? truncate(parsed.next_action, 200)
      : 'Practice and apply this skill.',
    estimated_effort: isString(parsed.estimated_effort)
      ? truncate(parsed.estimated_effort, 100)
      : 'Varies based on dedication.',
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clean up common JSON issues from LLM responses
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  // Remove common prefixes
  const prefixes = ['Here is', 'Here\'s', 'The JSON', 'Response:'];
  for (const prefix of prefixes) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleaned = cleaned.slice(prefix.length).trim();
    }
  }

  // Find the first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

/**
 * Truncate string to max length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Create a parse error
 */
function createParseError(message: string): AIServiceError {
  return {
    code: 'PARSE_ERROR',
    message,
    retryable: true, // Can retry with lower temperature
  };
}

// ============================================
// VALIDATION FOR FRONTEND USE
// ============================================

/**
 * Validate extracted skills meet minimum confidence threshold
 */
export function filterByConfidence(
  skills: ExtractedSkill[],
  threshold: number = 0.6
): ExtractedSkill[] {
  return skills.filter(s => s.confidence >= threshold && s.matched_id !== null);
}

/**
 * Convert extracted skills to validated skills for storage
 */
export function toValidatedSkills(
  skills: ExtractedSkill[]
): Array<{ skill_id: string; skill_name: string; level: number; confidence: number }> {
  return skills
    .filter(s => s.matched_id !== null)
    .map(s => ({
      skill_id: s.matched_id!,
      skill_name: s.matched_name ?? s.mentioned_text,
      level: s.inferred_level,
      confidence: s.confidence,
    }));
}
