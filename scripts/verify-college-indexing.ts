/**
 * Script to verify all colleges are properly indexed and have valid slugs
 * This helps identify 404 errors and missing slugs
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env file FIRST
config({ path: resolve(process.cwd(), ".env") })

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set")
  console.error("\nPlease set DATABASE_URL in your .env file")
  console.error("Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname")
  process.exit(1)
}

// Create database connection directly (like generate-missing-slugs.ts does)
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { colleges, courses } from "../src/db/schema"
import { eq, and, isNull, or, ne } from "drizzle-orm"

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema: { colleges, courses } })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

async function verifyCollegeIndexing() {
  console.log("🔍 Verifying college indexing...\n")
  
  try {
    // Get all enabled colleges
    const allColleges = await db
      .select()
      .from(colleges)
      .where(eq(colleges.isEnabled, true))
    
    console.log(`📊 Total enabled colleges: ${allColleges.length}\n`)
    
    // Check for missing slugs
    const collegesWithoutSlugs = allColleges.filter(
      c => !c.slug || c.slug.trim() === ""
    )
    
    if (collegesWithoutSlugs.length > 0) {
      console.log(`❌ Colleges without slugs: ${collegesWithoutSlugs.length}`)
      collegesWithoutSlugs.forEach(college => {
        console.log(`   - ID: ${college.id}, Name: ${college.name}`)
      })
      console.log()
    } else {
      console.log("✅ All colleges have slugs\n")
    }
    
    // Check for duplicate slugs
    const slugMap = new Map<string, number[]>()
    allColleges.forEach(college => {
      if (college.slug) {
        if (!slugMap.has(college.slug)) {
          slugMap.set(college.slug, [])
        }
        slugMap.get(college.slug)!.push(college.id)
      }
    })
    
    const duplicateSlugs = Array.from(slugMap.entries()).filter(
      ([_, ids]) => ids.length > 1
    )
    
    if (duplicateSlugs.length > 0) {
      console.log(`❌ Duplicate slugs found: ${duplicateSlugs.length}`)
      duplicateSlugs.forEach(([slug, ids]) => {
        console.log(`   - Slug: "${slug}" used by college IDs: ${ids.join(", ")}`)
      })
      console.log()
    } else {
      console.log("✅ No duplicate slugs found\n")
    }
    
    // Check for invalid characters in slugs
    const invalidSlugs = allColleges.filter(college => {
      if (!college.slug) return false
      // Slugs should only contain lowercase letters, numbers, and hyphens
      return !/^[a-z0-9-]+$/.test(college.slug)
    })
    
    if (invalidSlugs.length > 0) {
      console.log(`❌ Colleges with invalid slug format: ${invalidSlugs.length}`)
      invalidSlugs.forEach(college => {
        console.log(`   - ID: ${college.id}, Name: ${college.name}, Slug: "${college.slug}"`)
      })
      console.log()
    } else {
      console.log("✅ All slugs have valid format\n")
    }
    
    // Generate sitemap URLs for verification
    const sitemapUrls = allColleges
      .filter(c => c.slug && c.slug.trim() !== "")
      .map(college => `${baseUrl}/colleges/${college.slug}`)
    
    console.log(`📝 Generated ${sitemapUrls.length} college URLs for sitemap`)
    console.log(`   Sample URLs (first 5):`)
    sitemapUrls.slice(0, 5).forEach(url => {
      console.log(`   - ${url}`)
    })
    console.log()
    
    // Check for colleges with courses (better SEO)
    const collegesWithCoursesData = await db
      .select({
        collegeId: colleges.id,
        collegeName: colleges.name,
        collegeSlug: colleges.slug,
      })
      .from(colleges)
      .where(eq(colleges.isEnabled, true))
    
    // Get course counts for each college
    const collegesWithCourses = await Promise.all(
      collegesWithCoursesData.map(async (college) => {
        const courseList = await db
          .select()
          .from(courses)
          .where(eq(courses.collegeId, college.collegeId))
        
        return {
          ...college,
          courseCount: courseList.length,
        }
      })
    )
    
    const collegesWithoutCourses = collegesWithCourses.filter(
      c => !c.courseCount || c.courseCount === 0
    )
    
    if (collegesWithoutCourses.length > 0) {
      console.log(`⚠️  Colleges without courses: ${collegesWithoutCourses.length}`)
      console.log(`   (These may have lower SEO value)`)
      collegesWithoutCourses.slice(0, 10).forEach(college => {
        console.log(`   - ${college.collegeName} (ID: ${college.collegeId})`)
      })
      if (collegesWithoutCourses.length > 10) {
        console.log(`   ... and ${collegesWithoutCourses.length - 10} more`)
      }
      console.log()
    }
    
    // Summary
    console.log("📊 Summary:")
    console.log(`   ✅ Total enabled colleges: ${allColleges.length}`)
    console.log(`   ${collegesWithoutSlugs.length === 0 ? "✅" : "❌"} Colleges with slugs: ${allColleges.length - collegesWithoutSlugs.length}/${allColleges.length}`)
    console.log(`   ${duplicateSlugs.length === 0 ? "✅" : "❌"} Duplicate slugs: ${duplicateSlugs.length}`)
    console.log(`   ${invalidSlugs.length === 0 ? "✅" : "❌"} Valid slug format: ${allColleges.length - invalidSlugs.length}/${allColleges.length}`)
    console.log(`   📝 Sitemap URLs ready: ${sitemapUrls.length}`)
    console.log(`   ${collegesWithoutCourses.length === 0 ? "✅" : "⚠️"} Colleges with courses: ${collegesWithCourses.length - collegesWithoutCourses.length}/${collegesWithCourses.length}`)
    
    // Recommendations
    console.log("\n💡 Recommendations:")
    if (collegesWithoutSlugs.length > 0) {
      console.log("   1. Run generate-missing-slugs.ts to fix missing slugs")
    }
    if (duplicateSlugs.length > 0) {
      console.log("   2. Fix duplicate slugs to prevent 404 errors")
    }
    if (collegesWithoutCourses.length > 0) {
      console.log("   3. Add courses to colleges to improve SEO value")
    }
    console.log("   4. Submit sitemap to Google Search Console")
    console.log("   5. Request indexing for new/updated college pages")
    
  } catch (error) {
    console.error("❌ Error verifying college indexing:", error)
    process.exit(1)
  }
}

// Run the verification
verifyCollegeIndexing()
  .then(() => {
    console.log("\n✅ Verification complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Verification failed:", error)
    process.exit(1)
  })

