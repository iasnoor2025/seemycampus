import { config } from "dotenv"
import { resolve } from "path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../src/db/schema"
import { eq } from "drizzle-orm"

// Load env FIRST
config({ path: resolve(process.cwd(), ".env") })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

async function initializeFeatureFlags() {
  const { featureFlags } = schema
  
  const defaultFlags = [
    // Dashboard pages
    { key: "dashboard_leads", name: "Leads", category: "dashboard" as const, description: "Lead management page" },
    { key: "dashboard_colleges", name: "Colleges", category: "dashboard" as const, description: "College management page" },
    { key: "dashboard_cutoffs", name: "Cutoffs", category: "dashboard" as const, description: "Cutoff management page" },
    { key: "dashboard_placements", name: "Placements", category: "dashboard" as const, description: "Placement management page" },
    { key: "dashboard_application_guides", name: "Application Guides", category: "dashboard" as const, description: "Application guide management" },
    { key: "dashboard_inquiries", name: "Inquiries", category: "dashboard" as const, description: "Inquiry management page" },
    { key: "dashboard_news", name: "News", category: "dashboard" as const, description: "News management page" },
    { key: "dashboard_courses", name: "Courses", category: "dashboard" as const, description: "Course management page" },
    { key: "dashboard_menu", name: "Menu", category: "dashboard" as const, description: "Menu management page" },
    { key: "dashboard_hero_slides", name: "Hero Slides", category: "dashboard" as const, description: "Hero slide management" },
    { key: "dashboard_hero_rotating_texts", name: "Hero Rotating Texts", category: "dashboard" as const, description: "Hero rotating texts management" },
    { key: "dashboard_testimonials", name: "Testimonials", category: "dashboard" as const, description: "Testimonial management" },
    { key: "dashboard_study_goals", name: "Study Goals", category: "dashboard" as const, description: "Study goal management" },
    { key: "dashboard_scholarships", name: "Scholarships", category: "dashboard" as const, description: "Scholarship management" },
    { key: "dashboard_events", name: "Events", category: "dashboard" as const, description: "Event management page" },
    { key: "dashboard_blog", name: "Blog", category: "dashboard" as const, description: "Blog management page" },
    { key: "dashboard_counseling", name: "Counseling", category: "dashboard" as const, description: "Counseling management" },
    { key: "dashboard_students", name: "Students", category: "dashboard" as const, description: "Student management page" },
    { key: "dashboard_users", name: "Users", category: "dashboard" as const, description: "User management page" },
    { key: "dashboard_analytics", name: "Analytics", category: "dashboard" as const, description: "Analytics page" },
    
    // Public pages
    { key: "public_colleges", name: "Colleges Page", category: "public_page" as const, description: "Public colleges listing page" },
    { key: "public_scholarships", name: "Scholarships Page", category: "public_page" as const, description: "Public scholarships page" },
    { key: "public_events", name: "Events Page", category: "public_page" as const, description: "Public events page" },
    { key: "public_blog", name: "Blog Page", category: "public_page" as const, description: "Public blog page" },
    { key: "public_entrance_exams", name: "Entrance Exams Page", category: "public_page" as const, description: "Public entrance exams page" },
    { key: "public_compare", name: "Compare Colleges", category: "public_page" as const, description: "College comparison page" },
    { key: "public_fee_calculator", name: "Fee Calculator", category: "public_page" as const, description: "Fee calculator page" },
    { key: "public_quiz", name: "Quiz", category: "public_page" as const, description: "Student quiz page" },
    { key: "public_recommendations", name: "Recommendations", category: "public_page" as const, description: "College recommendations page" },
    { key: "public_about", name: "About Us", category: "public_page" as const, description: "About us page" },
    { key: "public_contact", name: "Contact", category: "public_page" as const, description: "Contact page" },
    { key: "public_career_counseling", name: "Career Counseling", category: "public_page" as const, description: "Career counseling page" },
    { key: "public_admission_predictor", name: "Admission Predictor", category: "public_page" as const, description: "Admission predictor page" },
    { key: "public_academic_alliance", name: "Academic Alliance", category: "public_page" as const, description: "Academic alliance page" },
    { key: "public_essay_assistant", name: "Essay Assistant", category: "public_page" as const, description: "Essay assistant page" },
    { key: "public_career_path", name: "Career Path", category: "public_page" as const, description: "Career path simulator page" },
    
    // Features/Functions
    { key: "feature_chat", name: "Chat Feature", category: "feature" as const, description: "AI chatbot feature" },
    { key: "feature_college_search", name: "College Search", category: "feature" as const, description: "College search functionality" },
    { key: "feature_save_colleges", name: "Save Colleges", category: "feature" as const, description: "Save favorite colleges feature" },
    { key: "feature_reviews", name: "College Reviews", category: "feature" as const, description: "College review system" },
    { key: "feature_student_dashboard", name: "Student Dashboard", category: "feature" as const, description: "Student dashboard feature" },
    { key: "feature_otp", name: "OTP Verification", category: "feature" as const, description: "Phone OTP verification system" },
  ]

  let created = 0
  let updated = 0

  for (const flag of defaultFlags) {
    const existing = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, flag.key))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(featureFlags).values({
        key: flag.key,
        name: flag.name,
        description: flag.description,
        category: flag.category,
        isEnabled: true,
      })
      created++
    } else {
      await db
        .update(featureFlags)
        .set({
          name: flag.name,
          description: flag.description,
          category: flag.category,
          updatedAt: new Date(),
        })
        .where(eq(featureFlags.key, flag.key))
      updated++
    }
  }

  return { created, updated }
}

async function seedAll() {
  console.log("🌱 Starting comprehensive database seeding...\n")
  
  try {
    // 1. Initialize Feature Flags (important for app functionality)
    console.log("1️⃣  Initializing feature flags...")
    try {
      const result = await initializeFeatureFlags()
      console.log(`   ✅ Feature flags: ${result.created} created, ${result.updated} updated\n`)
    } catch (error: any) {
      console.log(`   ⚠️  Feature flags error: ${error.message}\n`)
    }
    
    console.log("✅ All critical seeding completed!\n")
    console.log("📋 Summary of available seed scripts:")
    console.log("   - npm run db:seed (basic data - already done)")
    console.log("   - npm run db:seed:exams (entrance exams - already done)")
    console.log("   - npm run db:seed:hero-texts (hero texts - already done)")
    console.log("   - npm run db:seed:featured (featured colleges)")
    console.log("   - npm run db:seed:comprehensive (comprehensive college data)")
    console.log("   - npm run db:seed:comprehensive-courses (comprehensive courses)")
    console.log("   - npm run db:seed:logos (college logos)")
    console.log("   - npm run db:seed:leads (test leads)")
    console.log("   - npm run db:seed:counselor (test counselor)")
    
    await client.end()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error during seeding:", error)
    await client.end()
    process.exit(1)
  }
}

seedAll()

