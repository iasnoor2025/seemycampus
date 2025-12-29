/**
 * Simple in-memory rate limiting utility
 * Tracks requests by IP address with configurable limits
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store: IP -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000

setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(ip)
    }
  }
}, CLEANUP_INTERVAL)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Check if a request should be rate limited
 * @param ip - IP address of the requester
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  // No entry or expired window - create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(ip, newEntry)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Entry exists and is within window
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(ip, entry)

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP from request
 * Handles various proxy headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP (handles proxies, load balancers, etc.)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP.trim()
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip") // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }

  // Fallback to a default (shouldn't happen in production)
  return "unknown"
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // 10 requests per minute
  PER_MINUTE: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  // 50 requests per hour
  PER_HOUR: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000,
  },
} as const

