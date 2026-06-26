// shared/utils/cache.manager.ts

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<any>>();

  private constructor() {
    // Periodically clean expired entries every 60 seconds
    setInterval(() => this.cleanExpired(), 60000).unref();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Set a value in the cache with a TTL in seconds
   */
  public set<T>(key: string, value: T, ttlSeconds = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache. Returns null if not found or expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Delete a specific key from the cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Remove all expired entries manually
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = CacheManager.getInstance();
