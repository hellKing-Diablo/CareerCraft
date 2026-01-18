/**
 * Cache Manager
 * In-memory + localStorage caching for LLM responses
 */

import type { CacheEntry, CacheConfig } from './types';

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG: CacheConfig = {
  extraction_ttl_ms: 7 * 24 * 60 * 60 * 1000, // 7 days
  explanation_ttl_ms: 24 * 60 * 60 * 1000, // 24 hours
  max_memory_entries: 100,
};

const STORAGE_KEY_PREFIX = 'cc_ai_cache_';

// ============================================
// HASH UTILITIES
// ============================================

/**
 * Generate a simple hash for cache keys
 * Using a fast, non-cryptographic hash for performance
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex and ensure positive
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Normalize text for consistent cache key generation
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

// ============================================
// CACHE MANAGER CLASS
// ============================================

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  // ============================================
  // KEY GENERATION
  // ============================================

  /**
   * Generate cache key for skill extraction
   */
  generateExtractionKey(text: string, ontologyVersion: string = 'v1'): string {
    const normalized = normalizeText(text);
    const hash = simpleHash(normalized);
    return `extract:${hash}:${ontologyVersion}`;
  }

  /**
   * Generate cache key for explanation
   */
  generateExplanationKey(
    analysisId: string,
    userStage: string,
    tone: string = 'encouraging'
  ): string {
    return `explain:${analysisId}:${userStage}:${tone}`;
  }

  /**
   * Generate cache key for node explanation
   */
  generateNodeExplanationKey(
    skillId: string,
    userId: string,
    roleId: string
  ): string {
    return `node:${skillId}:${userId}:${roleId}`;
  }

  // ============================================
  // CACHE OPERATIONS
  // ============================================

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      memEntry.hit_count++;
      memEntry.last_hit_at = new Date();
      return memEntry.data as T;
    }

    // Check localStorage
    const storageEntry = this.getFromStorage<T>(key);
    if (storageEntry && !this.isExpired(storageEntry)) {
      // Promote to memory cache
      this.memoryCache.set(key, storageEntry);
      storageEntry.hit_count++;
      storageEntry.last_hit_at = new Date();
      this.saveToStorage(key, storageEntry);
      return storageEntry.data as T;
    }

    // Cache miss - clean up expired entry if exists
    if (memEntry) {
      this.memoryCache.delete(key);
    }
    this.removeFromStorage(key);

    return null;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const now = new Date();
    const ttl = ttlMs ?? this.getTtlForKey(key);

    const entry: CacheEntry<T> = {
      key,
      data,
      created_at: now,
      expires_at: new Date(now.getTime() + ttl),
      hit_count: 0,
      last_hit_at: now,
    };

    // Ensure memory cache doesn't exceed limit
    if (this.memoryCache.size >= this.config.max_memory_entries) {
      this.evictOldest();
    }

    this.memoryCache.set(key, entry);
    this.saveToStorage(key, entry);
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.memoryCache.get(key) ?? this.getFromStorage(key);
    return entry !== null && !this.isExpired(entry);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromStorage(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    this.clearStorage();
  }

  /**
   * Clear entries matching a prefix
   */
  clearByPrefix(prefix: string): void {
    // Clear from memory
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from storage
    this.clearStorageByPrefix(prefix);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    storageEntries: number;
    totalHits: number;
  } {
    let totalHits = 0;
    for (const entry of this.memoryCache.values()) {
      totalHits += entry.hit_count;
    }

    return {
      memoryEntries: this.memoryCache.size,
      storageEntries: this.getStorageKeyCount(),
      totalHits,
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return new Date() > new Date(entry.expires_at);
  }

  private getTtlForKey(key: string): number {
    if (key.startsWith('extract:')) {
      return this.config.extraction_ttl_ms;
    }
    if (key.startsWith('explain:') || key.startsWith('node:')) {
      return this.config.explanation_ttl_ms;
    }
    return this.config.explanation_ttl_ms; // Default
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      const time = new Date(entry.last_hit_at).getTime();
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  // ============================================
  // LOCALSTORAGE OPERATIONS
  // ============================================

  private loadFromStorage(): void {
    try {
      const keys = this.getStorageKeys();
      for (const key of keys) {
        const entry = this.getFromStorage(key);
        if (entry && !this.isExpired(entry) && this.memoryCache.size < this.config.max_memory_entries) {
          this.memoryCache.set(key, entry);
        } else if (entry && this.isExpired(entry)) {
          this.removeFromStorage(key);
        }
      }
    } catch {
      // localStorage might not be available
      console.warn('Failed to load AI cache from localStorage');
    }
  }

  private getFromStorage<T>(key: string): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      if (!raw) return null;

      const entry = JSON.parse(raw) as CacheEntry<T>;
      // Convert date strings back to Date objects
      entry.created_at = new Date(entry.created_at);
      entry.expires_at = new Date(entry.expires_at);
      entry.last_hit_at = new Date(entry.last_hit_at);

      return entry;
    } catch {
      return null;
    }
  }

  private saveToStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Storage might be full - evict oldest storage entries
      this.evictOldestStorage();
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(entry));
      } catch {
        // Give up if still failing
      }
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + key);
    } catch {
      // Ignore errors
    }
  }

  private clearStorage(): void {
    try {
      const keys = this.getStorageKeys();
      for (const key of keys) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + key);
      }
    } catch {
      // Ignore errors
    }
  }

  private clearStorageByPrefix(prefix: string): void {
    try {
      const keys = this.getStorageKeys();
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(STORAGE_KEY_PREFIX + key);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  private getStorageKeys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          keys.push(key.slice(STORAGE_KEY_PREFIX.length));
        }
      }
    } catch {
      // Ignore errors
    }
    return keys;
  }

  private getStorageKeyCount(): number {
    return this.getStorageKeys().length;
  }

  private evictOldestStorage(): void {
    try {
      const keys = this.getStorageKeys();
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const key of keys) {
        const entry = this.getFromStorage(key);
        if (entry) {
          const time = new Date(entry.last_hit_at).getTime();
          if (time < oldestTime) {
            oldestTime = time;
            oldestKey = key;
          }
        }
      }

      if (oldestKey) {
        this.removeFromStorage(oldestKey);
      }
    } catch {
      // Ignore errors
    }
  }
}

// Singleton instance
let cacheInstance: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager();
  }
  return cacheInstance;
}

export function resetCacheManager(): void {
  if (cacheInstance) {
    cacheInstance.clear();
  }
  cacheInstance = null;
}
