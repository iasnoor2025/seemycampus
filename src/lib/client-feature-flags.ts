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
    const response = await fetch(`/api/feature-flags/${featureKey}?t=${timestamp}`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })
    if (response.ok) {
      const data = await response.json()
      // Explicitly check if isEnabled is true
      return data.isEnabled === true
    }
    // On error, default to disabled (fail closed)
    console.warn(`Failed to check feature flag for ${pathname}:`, response.status)
    return false
  } catch (error) {
    // On error, default to disabled (fail closed)
    console.error(`Error checking feature flag for ${pathname}:`, error)
    return false
  }
}

