/**
 * Devstral 2 API Client
 * Handles API calls with retry logic and circuit breaker pattern
 */

import type {
  DevstralRequest,
  DevstralResponse,
  DevstralMessage,
  CircuitState,
  CircuitBreakerConfig,
  AIServiceError,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG = {
  baseUrl: 'https://api.mistral.ai/v1',
  model: 'devstral-small-2505',
  timeout: 30000,
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000], // exponential backoff
};

const CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failure_threshold: 5,
  reset_timeout_ms: 30000,
  half_open_max_calls: 1,
};

// ============================================
// CIRCUIT BREAKER
// ============================================

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private halfOpenCalls = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig = CIRCUIT_BREAKER_CONFIG) {
    this.config = config;
  }

  canExecute(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      // Check if reset timeout has passed
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime >= this.config.reset_timeout_ms
      ) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN state
    if (this.halfOpenCalls < this.config.half_open_max_calls) {
      this.halfOpenCalls++;
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.halfOpenCalls = 0;
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      return;
    }

    if (this.failureCount >= this.config.failure_threshold) {
      this.state = 'OPEN';
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }
}

// ============================================
// DEVSTRAL CLIENT
// ============================================

export class DevstralClient {
  private apiKey: string | null = null;
  private baseUrl: string;
  private model: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelays: number[];
  private circuitBreaker: CircuitBreaker;

  constructor(config?: Partial<typeof DEFAULT_CONFIG>) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_CONFIG.baseUrl;
    this.model = config?.model ?? DEFAULT_CONFIG.model;
    this.timeout = config?.timeout ?? DEFAULT_CONFIG.timeout;
    this.maxRetries = config?.maxRetries ?? DEFAULT_CONFIG.maxRetries;
    this.retryDelays = config?.retryDelays ?? DEFAULT_CONFIG.retryDelays;
    this.circuitBreaker = new CircuitBreaker();
  }

  /**
   * Set the API key (called from aiStore when user configures it)
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if client is configured with API key
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  /**
   * Get circuit breaker state for monitoring
   */
  getCircuitState(): CircuitState {
    return this.circuitBreaker.getState();
  }

  /**
   * Reset circuit breaker (for admin/testing)
   */
  resetCircuit(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Main method to call Devstral 2 API
   */
  async chat(
    messages: DevstralMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    }
  ): Promise<{ content: string; tokensUsed: number }> {
    if (!this.isConfigured()) {
      throw this.createError('VALIDATION_ERROR', 'API key not configured', false);
    }

    if (!this.circuitBreaker.canExecute()) {
      throw this.createError(
        'LLM_ERROR',
        'Service temporarily unavailable (circuit breaker open)',
        true
      );
    }

    const request: DevstralRequest = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 1000,
    };

    if (options?.jsonMode) {
      request.response_format = { type: 'json_object' };
    }

    let lastError: AIServiceError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.executeRequest(request);
        this.circuitBreaker.recordSuccess();

        const content = response.choices[0]?.message?.content ?? '';
        const tokensUsed = response.usage?.total_tokens ?? 0;

        return { content, tokensUsed };
      } catch (error) {
        lastError = error as AIServiceError;

        // Don't retry non-retryable errors
        if (!lastError.retryable) {
          this.circuitBreaker.recordFailure();
          throw lastError;
        }

        // Wait before retry (if not last attempt)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelays[attempt] ?? this.retryDelays[this.retryDelays.length - 1];
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    this.circuitBreaker.recordFailure();
    throw lastError ?? this.createError('LLM_ERROR', 'All retries exhausted', true);
  }

  /**
   * Execute a single API request
   */
  private async executeRequest(request: DevstralRequest): Promise<DevstralResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = (await response.json()) as DevstralResponse;
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createError('TIMEOUT', 'Request timed out', true);
        }
        // Check if it's already an AIServiceError
        const maybeAIError = error as unknown as AIServiceError;
        if (maybeAIError.code && maybeAIError.retryable !== undefined) {
          throw maybeAIError;
        }
        throw this.createError('NETWORK_ERROR', error.message, true);
      }

      throw this.createError('LLM_ERROR', 'Unknown error occurred', true);
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleErrorResponse(response: Response): Promise<AIServiceError> {
    const status = response.status;
    let message = `HTTP ${status}`;

    try {
      const body = await response.json();
      message = body.error?.message ?? body.message ?? message;
    } catch {
      // Ignore JSON parse errors
    }

    switch (status) {
      case 401:
      case 403:
        return this.createError('LLM_ERROR', `Authentication failed: ${message}`, false);

      case 429:
        // Rate limit - check for retry-after header
        const retryAfter = response.headers.get('retry-after');
        return this.createError(
          'RATE_LIMIT',
          `Rate limited. ${retryAfter ? `Retry after ${retryAfter}s` : 'Please wait.'}`,
          true,
          { retry_after: retryAfter }
        );

      case 500:
      case 502:
      case 503:
        return this.createError('LLM_ERROR', `Server error: ${message}`, true);

      case 504:
        return this.createError('TIMEOUT', 'Gateway timeout', true);

      default:
        return this.createError('LLM_ERROR', message, status >= 500);
    }
  }

  /**
   * Create a standardized error object
   */
  private createError(
    code: AIServiceError['code'],
    message: string,
    retryable: boolean,
    details?: Record<string, unknown>
  ): AIServiceError {
    return { code, message, retryable, details };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let clientInstance: DevstralClient | null = null;

export function getDevstralClient(): DevstralClient {
  if (!clientInstance) {
    clientInstance = new DevstralClient();
  }
  return clientInstance;
}

export function resetDevstralClient(): void {
  clientInstance = null;
}
