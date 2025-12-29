import { isFeatureEnabled } from "./featureFlags"

// Map paths to feature flag keys
const pathToFeatureKey: Record<string, string> = {
  // Dashboard pages
  "/dashboard/leads": "dashboard_leads",
  "/dashboard/colleges": "dashboard_colleges",
  "/dashboard/cutoffs": "dashboard_cutoffs",
  "/dashboard/placements": "dashboard_placements",
  "/dashboard/application-guides": "dashboard_application_guides",
  "/dashboard/inquiries": "dashboard_inquiries",
  "/dashboard/news": "dashboard_news",
  "/dashboard/courses": "dashboard_courses",
  "/dashboard/menu": "dashboard_menu",
  "/dashboard/hero-slides": "dashboard_hero_slides",
  "/dashboard/hero-rotating-texts": "dashboard_hero_rotating_texts",
  "/dashboard/testimonials": "dashboard_testimonials",
  "/dashboard/study-goals": "dashboard_study_goals",
  "/dashboard/scholarships": "dashboard_scholarships",
  "/dashboard/events": "dashboard_events",
  "/dashboard/blog": "dashboard_blog",
  "/dashboard/counseling": "dashboard_counseling",
  "/dashboard/students": "dashboard_students",
  "/dashboard/users": "dashboard_users",
  "/dashboard/analytics": "dashboard_analytics",
  
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
 * Check if a path is enabled via feature flags
 * Returns true if no feature flag is associated with the path
 */
export async function isPathEnabled(pathname: string): Promise<boolean> {
  const featureKey = getFeatureKeyForPath(pathname)
  
  // If no feature key, path is always enabled
  if (!featureKey) {
    return true
  }
  
  return await isFeatureEnabled(featureKey)
}

