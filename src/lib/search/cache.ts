/**
 * Simple in-memory cache for search results
 * In production, consider using Redis or similar
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class SearchCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_SIZE = 1000 // Maximum cache entries

  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictOldest()
    }

    const now = Date.now()
    const expiresAt = now + (ttl || this.DEFAULT_TTL)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private evictOldest(): void {
    // Remove 10% of oldest entries
    const entriesToRemove = Math.floor(this.MAX_SIZE * 0.1)
    const sortedEntries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    )

    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(sortedEntries[i][0])
    }
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const searchCache = new SearchCache()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    searchCache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Generate cache key from search parameters
 */
export function generateCacheKey(params: Record<string, any>): string {
  // Sort keys to ensure consistent cache keys
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|")
  return `search:${sortedParams}`
}

