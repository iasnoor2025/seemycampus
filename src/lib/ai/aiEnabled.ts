/**
 * AI Feature Flag Check
 * Central utility to check if AI features are enabled
 */

import { isFeatureEnabled } from "@/lib/featureFlags"

let cachedEnabled: boolean | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 1 minute cache

/**
 * Check if AI features are enabled
 * Uses caching to avoid repeated database queries
 */
export async function isAIEnabled(): Promise<boolean> {
  const now = Date.now()
  
  // Return cached value if still valid
  if (cachedEnabled !== null && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedEnabled
  }
  
  try {
    const enabled = await isFeatureEnabled("ai_enabled")
    cachedEnabled = enabled
    cacheTimestamp = now
    return enabled
  } catch (error) {
    console.error("Error checking AI feature flag:", error)
    // Default to enabled if check fails (fail open)
    return true
  }
}

/**
 * Clear the AI enabled cache
 * Useful when the feature flag is updated
 */
export function clearAICache(): void {
  cachedEnabled = null
  cacheTimestamp = 0
}

/**
 * Check if AI is enabled (synchronous version for client-side)
 * Returns null if not cached, requiring async check
 */
export function isAIEnabledSync(): boolean | null {
  if (cachedEnabled === null) {
    return null
  }
  return cachedEnabled
}
