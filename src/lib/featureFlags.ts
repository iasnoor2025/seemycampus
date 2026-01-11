import { db } from "@/db"
import { featureFlags } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export type FeatureFlagCategory = "dashboard" | "public_page" | "feature"

export interface FeatureFlag {
  id: number
  key: string
  name: string
  description: string | null
  category: FeatureFlagCategory
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const flags = await db.select().from(featureFlags).orderBy(asc(featureFlags.category), asc(featureFlags.name))
  return flags.map(flag => ({
    ...flag,
    category: flag.category as FeatureFlagCategory,
    createdAt: new Date(flag.createdAt),
    updatedAt: new Date(flag.updatedAt),
  }))
}

/**
 * Get feature flag by key
 */
export async function getFeatureFlag(key: string): Promise<FeatureFlag | null> {
  const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1)
  if (!flag) return null
  
  return {
    ...flag,
    category: flag.category as FeatureFlagCategory,
    createdAt: new Date(flag.createdAt),
    updatedAt: new Date(flag.updatedAt),
  }
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flag = await getFeatureFlag(key)
  // If flag doesn't exist, default to enabled (backward compatibility)
  return flag?.isEnabled ?? true
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(key: string, isEnabled: boolean): Promise<FeatureFlag> {
  const [updated] = await db
    .update(featureFlags)
    .set({ 
      isEnabled,
      updatedAt: new Date(),
    })
    .where(eq(featureFlags.key, key))
    .returning()
  
  if (!updated) {
    throw new Error(`Feature flag with key "${key}" not found`)
  }
  
  return {
    ...updated,
    category: updated.category as FeatureFlagCategory,
    createdAt: new Date(updated.createdAt),
    updatedAt: new Date(updated.updatedAt),
  }
}

/**
 * Get feature flags by category
 */
export async function getFeatureFlagsByCategory(category: FeatureFlagCategory): Promise<FeatureFlag[]> {
  const flags = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.category, category))
    .orderBy(asc(featureFlags.name))
  
  return flags.map(flag => ({
    ...flag,
    category: flag.category as FeatureFlagCategory,
    createdAt: new Date(flag.createdAt),
    updatedAt: new Date(flag.updatedAt),
  }))
}

/**
 * Initialize default feature flags (run once on setup)
 */
export async function initializeDefaultFeatureFlags() {
  const defaultFlags = [
    // Dashboard pages
    { key: "dashboard_leads", name: "Leads", category: "dashboard" as FeatureFlagCategory, description: "Lead management page" },
    { key: "dashboard_colleges", name: "Colleges", category: "dashboard" as FeatureFlagCategory, description: "College management page" },
    { key: "dashboard_cutoffs", name: "Cutoffs", category: "dashboard" as FeatureFlagCategory, description: "Cutoff management page" },
    { key: "dashboard_placements", name: "Placements", category: "dashboard" as FeatureFlagCategory, description: "Placement management page" },
    { key: "dashboard_application_guides", name: "Application Guides", category: "dashboard" as FeatureFlagCategory, description: "Application guide management" },
    { key: "dashboard_inquiries", name: "Inquiries", category: "dashboard" as FeatureFlagCategory, description: "Inquiry management page" },
    { key: "dashboard_news", name: "News", category: "dashboard" as FeatureFlagCategory, description: "News management page" },
    { key: "dashboard_courses", name: "Courses", category: "dashboard" as FeatureFlagCategory, description: "Course management page" },
    { key: "dashboard_menu", name: "Menu", category: "dashboard" as FeatureFlagCategory, description: "Menu management page" },
    { key: "dashboard_hero_slides", name: "Hero Slides", category: "dashboard" as FeatureFlagCategory, description: "Hero slide management" },
    { key: "dashboard_hero_rotating_texts", name: "Hero Rotating Texts", category: "dashboard" as FeatureFlagCategory, description: "Hero rotating texts management" },
    { key: "dashboard_testimonials", name: "Testimonials", category: "dashboard" as FeatureFlagCategory, description: "Testimonial management" },
    { key: "dashboard_study_goals", name: "Study Goals", category: "dashboard" as FeatureFlagCategory, description: "Study goal management" },
    { key: "dashboard_scholarships", name: "Scholarships", category: "dashboard" as FeatureFlagCategory, description: "Scholarship management" },
    { key: "dashboard_events", name: "Events", category: "dashboard" as FeatureFlagCategory, description: "Event management page" },
    { key: "dashboard_blog", name: "Blog", category: "dashboard" as FeatureFlagCategory, description: "Blog management page" },
    { key: "dashboard_counseling", name: "Counseling", category: "dashboard" as FeatureFlagCategory, description: "Counseling management" },
    { key: "dashboard_students", name: "Students", category: "dashboard" as FeatureFlagCategory, description: "Student management page" },
    { key: "dashboard_users", name: "Users", category: "dashboard" as FeatureFlagCategory, description: "User management page" },
    { key: "dashboard_analytics", name: "Analytics", category: "dashboard" as FeatureFlagCategory, description: "Analytics page" },
    
    // Public pages
    { key: "public_colleges", name: "Colleges Page", category: "public_page" as FeatureFlagCategory, description: "Public colleges listing page" },
    { key: "public_scholarships", name: "Scholarships Page", category: "public_page" as FeatureFlagCategory, description: "Public scholarships page" },
    { key: "public_events", name: "Events Page", category: "public_page" as FeatureFlagCategory, description: "Public events page" },
    { key: "public_blog", name: "Blog Page", category: "public_page" as FeatureFlagCategory, description: "Public blog page" },
    { key: "public_entrance_exams", name: "Entrance Exams Page", category: "public_page" as FeatureFlagCategory, description: "Public entrance exams page" },
    { key: "public_compare", name: "Compare Colleges", category: "public_page" as FeatureFlagCategory, description: "College comparison page" },
    { key: "public_fee_calculator", name: "Fee Calculator", category: "public_page" as FeatureFlagCategory, description: "Fee calculator page" },
    { key: "public_quiz", name: "Quiz", category: "public_page" as FeatureFlagCategory, description: "Student quiz page" },
    { key: "public_recommendations", name: "Recommendations", category: "public_page" as FeatureFlagCategory, description: "College recommendations page" },
    { key: "public_about", name: "About Us", category: "public_page" as FeatureFlagCategory, description: "About us page" },
    { key: "public_contact", name: "Contact", category: "public_page" as FeatureFlagCategory, description: "Contact page" },
    { key: "public_career_counseling", name: "Career Counseling", category: "public_page" as FeatureFlagCategory, description: "Career counseling page" },
    { key: "public_admission_predictor", name: "Admission Predictor", category: "public_page" as FeatureFlagCategory, description: "Admission predictor page" },
    { key: "public_academic_alliance", name: "Academic Alliance", category: "public_page" as FeatureFlagCategory, description: "Academic alliance page" },
    { key: "public_essay_assistant", name: "Essay Assistant", category: "public_page" as FeatureFlagCategory, description: "Essay assistant page" },
    { key: "public_career_path", name: "Career Path", category: "public_page" as FeatureFlagCategory, description: "Career path simulator page" },
    
    // Features/Functions
    { key: "feature_chat", name: "Chat Feature", category: "feature" as FeatureFlagCategory, description: "AI chatbot feature" },
    { key: "feature_college_search", name: "College Search", category: "feature" as FeatureFlagCategory, description: "College search functionality" },
    { key: "feature_save_colleges", name: "Save Colleges", category: "feature" as FeatureFlagCategory, description: "Save favorite colleges feature" },
    { key: "feature_reviews", name: "College Reviews", category: "feature" as FeatureFlagCategory, description: "College review system" },
    { key: "feature_student_dashboard", name: "Student Dashboard", category: "feature" as FeatureFlagCategory, description: "Student dashboard feature" },
    { key: "feature_otp", name: "OTP Verification", category: "feature" as FeatureFlagCategory, description: "Phone OTP verification system" },
    { key: "ai_enabled", name: "AI Features", category: "feature" as FeatureFlagCategory, description: "Enable/disable all AI-powered features (SEO, recommendations, reviews, blog, search, content generation)" },
  ]

  for (const flag of defaultFlags) {
    const existing = await getFeatureFlag(flag.key)
    if (!existing) {
      await db.insert(featureFlags).values({
        key: flag.key,
        name: flag.name,
        description: flag.description,
        category: flag.category,
        isEnabled: true,
      })
    } else {
      // Update existing flag if name or description changed
      await db
        .update(featureFlags)
        .set({
          name: flag.name,
          description: flag.description,
          category: flag.category,
          updatedAt: new Date(),
        })
        .where(eq(featureFlags.key, flag.key))
    }
  }
}

