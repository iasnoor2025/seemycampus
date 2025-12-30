"use client"

/**
 * Client-side utility to check feature flags
 * This is used in client components where we can't use server-side feature flag checks
 */

// Map paths to feature flag keys (same as middleware-feature-flags.ts)
const pathToFeatureKey: Record<string, string> = {
  // Public pages
  "/colleges": "public_colleges",
  "/scholarships": "public_scholarships",
  "/events": "public_events",
  "/blog": "public_blog",
  "/entrance-exams": "public_entrance_exams",
  "/compare": "public_compare",
  "/fee-calculator": "public_fee_calculator",
  "/quiz": "public_quiz",
  "/recommendations": "public_recommendations",
  "/about": "public_about",
  "/contact": "public_contact",
  "/career-counseling": "public_career_counseling",
  "/admission-predictor": "public_admission_predictor",
  "/academic-alliance": "public_academic_alliance",
  "/essay-assistant": "public_essay_assistant",
  "/career-path": "public_career_path",
  "/chat": "feature_chat",
}

/**
 * Get feature key for a path
 */
export function getFeatureKeyForPath(pathname: string): string | null {
  // Check exact match first
  if (pathToFeatureKey[pathname]) {
    return pathToFeatureKey[pathname]
  }
  
  // Check if path starts with any key (for nested routes)
  for (const [path, key] of Object.entries(pathToFeatureKey)) {
    if (pathname.startsWith(path + "/") || pathname === path) {
      return key
    }
  }
  
  return null
}

/**
 * Check if a path is enabled via feature flags (client-side)
 * Returns true if no feature flag is associated with the path
 */
export async function isPathEnabledClient(pathname: string): Promise<boolean> {
  const featureKey = getFeatureKeyForPath(pathname)
  
  // If no feature key, path is always enabled
  if (!featureKey) {
    return true
  }
  
  try {
    // Add timestamp to prevent any caching
    const timestamp = Date.now()
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    try {
      const response = await fetch(`/api/feature-flags/${featureKey}?t=${timestamp}`, {
        signal: controller.signal,
        cache: 'no-store', // Always fetch fresh data
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        // Explicitly check if isEnabled is true
        return data.isEnabled === true
      }
      
      // On error, default to enabled (fail open for better UX)
      // Only log if it's not a network error
      if (response.status !== 0) {
        console.warn(`Failed to check feature flag for ${pathname}:`, response.status)
      }
      return true // Fail open - show links by default if API fails
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // If it's an abort error (timeout), fail open
      if (fetchError.name === 'AbortError') {
        console.warn(`Feature flag check timeout for ${pathname}, defaulting to enabled`)
        return true // Fail open on timeout
      }
      
      // For other errors, also fail open for better UX
      // Only log non-network errors
      if (fetchError.name !== 'TypeError' || !fetchError.message.includes('fetch')) {
        console.error(`Error checking feature flag for ${pathname}:`, fetchError)
      }
      return true // Fail open - show links by default if API fails
    }
  } catch (error: any) {
    // On any other error, fail open for better UX
    if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
      console.error(`Error checking feature flag for ${pathname}:`, error)
    }
    return true // Fail open - show links by default if API fails
  }
}

