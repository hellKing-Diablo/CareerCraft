/**
 * AI Service - Mistral Devstral 2 Integration
 *
 * This service wraps the Devstral 2 AI client and provides high-level
 * functions for generating insights, learning paths, and skill guidance.
 */
import type {
  AIContext,
  AIError,
  DashboardInsights,
  LearningPath,
  SkillGuidance,
  GapImprovementPlan,
} from '../types/ai';
import { useUserStore } from '../store/userStore';
import { useGraphStore } from '../store/graphStore';
import { useAIStore } from '../store/aiStore';
import { getSkillById } from '../data/careerData';

// Get API key from environment variable
const ENV_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;

/**
 * Get the API key - either from env or from store
 */
export function getApiKey(): string | null {
  // First check environment variable
  if (ENV_API_KEY && ENV_API_KEY !== 'your_api_key_here') {
    return ENV_API_KEY;
  }
  // Fall back to store
  return useAIStore.getState().apiKey || null;
}

/**
 * Check if AI is configured (has API key)
 */
export function isAIConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Build context from user and graph stores
 */
export function buildAIContext(): AIContext {
  const userState = useUserStore.getState();
  const graphState = useGraphStore.getState();

  const skills = userState.userSkills.map(us => {
    const skill = getSkillById(us.skillId);
    return {
      id: us.skillId,
      name: skill?.skillName || us.skillId,
      level: us.level,
      category: skill?.category || 'unknown',
    };
  });

  const shortTermGoal = userState.careerGoals.find(g => g.timeframe === 'short');
  const longTermGoal = userState.careerGoals.find(g => g.timeframe === 'long');

  let gapAnalysis = null;
  if (graphState.gapAnalysis) {
    gapAnalysis = {
      readinessScore: graphState.gapAnalysis.readinessScore,
      gaps: graphState.gapAnalysis.gaps.map(g => ({
        skillName: g.skillName,
        currentLevel: g.currentLevel,
        requiredLevel: g.requiredLevel,
        priority: g.priority,
      })),
      strengths: graphState.gapAnalysis.strengths.map(s => ({
        skillName: s.skillName,
        currentLevel: s.currentLevel,
        requiredLevel: s.requiredLevel,
      })),
    };
  }

  let targetRole = null;
  if (graphState.gapAnalysis?.targetRole) {
    targetRole = {
      name: graphState.gapAnalysis.targetRole.roleName,
      description: graphState.gapAnalysis.targetRole.description,
    };
  }

  return {
    userName: userState.user?.name || 'Learner',
    userStage: userState.user?.stage || 'beginner',
    skills,
    careerGoals: {
      shortTerm: shortTermGoal?.targetRoleId || null,
      longTerm: longTermGoal?.targetRoleId || null,
    },
    gapAnalysis,
    targetRole,
  };
}

/**
 * Create an AI error object
 */
function createAIError(code: AIError['code'], message: string): AIError {
  return { code, message };
}

/**
 * Validate API key by making a test request to Mistral API
 */
export async function validateAPIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Call Mistral API with Devstral 2 model
 */
async function callMistralAPI(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const aiStore = useAIStore.getState();

  // Check rate limiting
  if (!aiStore.canMakeRequest()) {
    throw createAIError('rate_limit', 'Please wait a moment before making another request.');
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'devstral-small-2505',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    // Record the request
    aiStore.recordRequest();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw createAIError('invalid_key', 'Invalid API key. Please check your API key in Settings.');
      }

      if (response.status === 429) {
        throw createAIError('rate_limit', 'Rate limit exceeded. Please wait a moment and try again.');
      }

      throw createAIError('network_error', errorData.message || 'Failed to connect to AI service.');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw createAIError('parse_error', 'Empty response from AI service.');
    }

    return text;
  } catch (error: unknown) {
    // Record the request even on error
    aiStore.recordRequest();

    // Re-throw if it's already an AIError
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      throw error;
    }

    const err = error as Error;
    throw createAIError('network_error', err.message || 'Failed to connect to AI service.');
  }
}

/**
 * Parse JSON from AI response
 */
function parseJSONResponse<T>(text: string, fallback: T): T {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;

  try {
    return JSON.parse(jsonText.trim());
  } catch {
    console.warn('Failed to parse AI response as JSON, using fallback');
    return fallback;
  }
}

// ============================================
// DASHBOARD INSIGHTS
// ============================================
const DASHBOARD_INSIGHTS_SYSTEM = `You are a career advisor AI for healthcare technology professionals. You provide personalized, actionable career guidance based on user data.

Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "summary": "A 1-2 sentence personalized summary of their career status",
  "insights": [
    {
      "title": "Short insight title",
      "description": "Detailed explanation of the insight",
      "actionable": true,
      "priority": "high"
    }
  ],
  "encouragement": "A motivational message",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}
\`\`\`

Guidelines:
- Provide 3-4 insights
- Make insights specific to healthcare tech careers
- Keep the tone encouraging but professional
- Priority can be "high", "medium", or "low"
- Next steps should be concrete and actionable`;

export async function generateDashboardInsights(): Promise<DashboardInsights> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw createAIError('no_api_key', 'Configure your API key in Settings to use AI features.');
  }

  const context = buildAIContext();

  const userMessage = `Based on my career profile, provide personalized insights:

Name: ${context.userName}
Stage: ${context.userStage}
Target Role: ${context.targetRole?.name || 'Not set'}
Readiness Score: ${context.gapAnalysis?.readinessScore || 0}%

Current Skills (${context.skills.length} total):
${context.skills.map(s => `- ${s.name}: Level ${s.level}/5`).join('\n')}

Skill Gaps (${context.gapAnalysis?.gaps.length || 0}):
${context.gapAnalysis?.gaps.slice(0, 5).map(g => `- ${g.skillName}: ${g.currentLevel}→${g.requiredLevel} (${g.priority})`).join('\n') || 'None'}

Strengths (${context.gapAnalysis?.strengths.length || 0}):
${context.gapAnalysis?.strengths.slice(0, 3).map(s => `- ${s.skillName}: ${s.currentLevel}/${s.requiredLevel}`).join('\n') || 'None'}`;

  const response = await callMistralAPI(
    apiKey,
    DASHBOARD_INSIGHTS_SYSTEM,
    userMessage
  );

  const fallback: DashboardInsights = {
    summary: 'Keep building your skills to reach your career goals.',
    insights: [
      {
        title: 'Continue Learning',
        description: 'Focus on your priority skill gaps to improve your readiness.',
        actionable: true,
        priority: 'high',
      },
    ],
    encouragement: 'Every skill you learn brings you closer to your goals!',
    nextSteps: ['Review your skill gaps', 'Start with the highest priority skills', 'Track your progress'],
  };

  return parseJSONResponse<DashboardInsights>(response, fallback);
}

// ============================================
// LEARNING PATH
// ============================================
const LEARNING_PATH_SYSTEM = `You are a career advisor AI that creates personalized learning paths for healthcare technology professionals.

Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "title": "Your Learning Path to [Role]",
  "overview": "Brief overview of the path",
  "totalWeeks": 24,
  "steps": [
    {
      "order": 1,
      "skillId": "skill_id_here",
      "skillName": "Skill Name",
      "description": "Why this skill matters and what you'll learn",
      "estimatedWeeks": 4,
      "resources": ["Resource type 1", "Resource type 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ],
  "tips": ["Learning tip 1", "Learning tip 2"]
}
\`\`\`

Guidelines:
- Order skills by prerequisites (foundational first)
- Include 4-6 skills in the path
- Be realistic about time estimates
- Resources should be types not specific courses (e.g., "Online course", "Practice project")
- Include 2-3 milestones per skill`;

export async function generateLearningPath(): Promise<LearningPath> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw createAIError('no_api_key', 'Configure your API key in Settings to use AI features.');
  }

  const context = buildAIContext();

  const userMessage = `Create a personalized learning path for me:

Target Role: ${context.targetRole?.name || 'Healthcare Data Analyst'}
Role Description: ${context.targetRole?.description || 'Working with healthcare data'}
Current Stage: ${context.userStage}

Current Skills:
${context.skills.map(s => `- ${s.name}: Level ${s.level}/5`).join('\n') || 'None yet'}

Skills I Need to Learn (Priority Order):
${context.gapAnalysis?.gaps.slice(0, 6).map((g, i) => `${i + 1}. ${g.skillName} (Current: ${g.currentLevel}, Need: ${g.requiredLevel}, Priority: ${g.priority})`).join('\n') || 'General healthcare tech skills'}

Create a step-by-step learning path focusing on the most important gaps first.`;

  const response = await callMistralAPI(
    apiKey,
    LEARNING_PATH_SYSTEM,
    userMessage
  );

  const fallback: LearningPath = {
    title: 'Your Healthcare Tech Learning Path',
    overview: 'A structured path to build your healthcare technology skills.',
    totalWeeks: 24,
    steps: [],
    tips: ['Set aside dedicated learning time each week', 'Practice with real datasets when possible'],
  };

  return parseJSONResponse<LearningPath>(response, fallback);
}

// ============================================
// SKILL GUIDANCE
// ============================================
const SKILL_GUIDANCE_SYSTEM = `You are a career advisor AI that provides detailed guidance on specific skills for healthcare technology professionals.

Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "skillId": "skill_id",
  "overview": "What this skill is and why it matters in healthcare tech",
  "whyImportant": "Specific reasons this skill is valuable for healthcare careers",
  "learningTips": ["Tip 1", "Tip 2", "Tip 3"],
  "resources": [
    {
      "type": "course",
      "title": "Resource title",
      "description": "Brief description"
    }
  ],
  "practiceIdeas": ["Project idea 1", "Project idea 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "estimatedTimeToLevel": {
    "1": "1-2 weeks",
    "2": "2-4 weeks",
    "3": "1-2 months",
    "4": "3-4 months",
    "5": "6+ months"
  }
}
\`\`\`

Guidelines:
- Be specific to healthcare technology applications
- Include 3-4 learning tips
- Include 3-4 resources of different types (course, book, tutorial, practice, project)
- Include 2-3 practice ideas
- Include 2-3 common mistakes to avoid`;

export async function generateSkillGuidance(skillId: string): Promise<SkillGuidance> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw createAIError('no_api_key', 'Configure your API key in Settings to use AI features.');
  }

  const skill = getSkillById(skillId);
  const context = buildAIContext();
  const userSkill = context.skills.find(s => s.id === skillId);
  const gapInfo = context.gapAnalysis?.gaps.find(g => g.skillName === skill?.skillName);

  const userMessage = `Provide detailed guidance for learning this skill:

Skill: ${skill?.skillName || skillId}
Category: ${skill?.category || 'technical'}
Description: A skill in ${skill?.domain?.join(', ') || 'technology'}
Estimated Hours: ${skill?.time || '40 hours'}

My Current Level: ${userSkill?.level || 0}/5
Required Level: ${gapInfo?.requiredLevel || 3}/5
Priority: ${gapInfo?.priority || 'important'}

My Target Role: ${context.targetRole?.name || 'Healthcare Tech Professional'}
My Stage: ${context.userStage}

Provide specific, actionable guidance for improving this skill in the healthcare technology context.`;

  const response = await callMistralAPI(
    apiKey,
    SKILL_GUIDANCE_SYSTEM,
    userMessage
  );

  const fallback: SkillGuidance = {
    skillId,
    overview: `A skill in ${skill?.domain?.join(', ') || 'technology'} that will help advance your career.`,
    whyImportant: 'This skill is valuable for technology roles.',
    learningTips: ['Start with the fundamentals', 'Practice regularly', 'Apply to healthcare scenarios'],
    resources: [
      { type: 'course', title: 'Online courses', description: 'Start with beginner courses' },
      { type: 'practice', title: 'Hands-on practice', description: 'Work on small projects' },
    ],
    practiceIdeas: ['Build a small project', 'Contribute to open source'],
    commonMistakes: ['Skipping fundamentals', 'Not practicing enough'],
    estimatedTimeToLevel: {
      1: '1-2 weeks',
      2: '2-4 weeks',
      3: '1-2 months',
      4: '3-4 months',
      5: '6+ months',
    },
  };

  return parseJSONResponse<SkillGuidance>(response, fallback);
}

// ============================================
// GAP IMPROVEMENT PLAN
// ============================================
const GAP_IMPROVEMENT_SYSTEM = `You are a career advisor AI that creates strategic improvement plans for healthcare technology professionals.

Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "summary": "Brief overview of the improvement strategy",
  "quickWins": [
    {
      "skillId": "skill_id",
      "skillName": "Skill Name",
      "action": "Specific action to take",
      "effort": "low",
      "impact": "high",
      "timeframe": "1-2 weeks"
    }
  ],
  "strategicActions": [
    {
      "skillId": "skill_id",
      "skillName": "Skill Name",
      "action": "Specific action to take",
      "effort": "medium",
      "impact": "high",
      "timeframe": "1-2 months"
    }
  ],
  "longTermGoals": [
    {
      "skillId": "skill_id",
      "skillName": "Skill Name",
      "action": "Specific action to take",
      "effort": "high",
      "impact": "high",
      "timeframe": "3-6 months"
    }
  ],
  "weeklyPlan": ["Week 1 focus", "Week 2 focus", "Week 3 focus", "Week 4 focus"]
}
\`\`\`

Guidelines:
- Quick wins: 2-3 low-effort, high-impact actions
- Strategic actions: 2-3 medium-effort actions for core gaps
- Long-term goals: 1-2 high-effort items for advanced skills
- Be specific about actions, not vague
- Effort can be "low", "medium", or "high"
- Impact can be "low", "medium", or "high"`;

export async function generateGapImprovementPlan(): Promise<GapImprovementPlan> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw createAIError('no_api_key', 'Configure your API key in Settings to use AI features.');
  }

  const context = buildAIContext();

  const userMessage = `Create a strategic improvement plan for my skill gaps:

Target Role: ${context.targetRole?.name || 'Healthcare Tech Professional'}
Current Readiness: ${context.gapAnalysis?.readinessScore || 0}%

Skill Gaps (in priority order):
${context.gapAnalysis?.gaps.map((g, i) => `${i + 1}. ${g.skillName}
   - Current: ${g.currentLevel}/5, Need: ${g.requiredLevel}/5
   - Gap Size: ${g.requiredLevel - g.currentLevel} levels
   - Priority: ${g.priority}`).join('\n\n') || 'No gaps identified'}

My Strengths:
${context.gapAnalysis?.strengths.map(s => `- ${s.skillName}: ${s.currentLevel}/${s.requiredLevel}`).join('\n') || 'None identified'}

My Stage: ${context.userStage}

Create a strategic plan with quick wins, medium-term goals, and long-term objectives to close these gaps efficiently.`;

  const response = await callMistralAPI(
    apiKey,
    GAP_IMPROVEMENT_SYSTEM,
    userMessage
  );

  const fallback: GapImprovementPlan = {
    summary: 'Focus on closing your highest priority skill gaps first.',
    quickWins: [],
    strategicActions: [],
    longTermGoals: [],
    weeklyPlan: [
      'Assess current skills and identify priorities',
      'Start with quick wins',
      'Begin working on core gaps',
      'Review progress and adjust plan',
    ],
  };

  return parseJSONResponse<GapImprovementPlan>(response, fallback);
}
