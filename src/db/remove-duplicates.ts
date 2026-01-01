// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq, sql } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { colleges, courses } from "./schema"
import { and } from "drizzle-orm"

// Function to normalize college name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// Function to calculate completeness score for a college
function getCompletenessScore(college: any, courseCount: number = 0): number {
  let score = 0
  
  // Basic fields (required)
  if (college.name) score += 10
  if (college.slug) score += 10
  
  // Location fields
  if (college.location) score += 5
  if (college.city) score += 5
  if (college.state) score += 5
  if (college.country) score += 3
  
  // Contact fields
  if (college.email) score += 5
  if (college.phone) score += 5
  if (college.website) score += 5
  
  // Description
  if (college.description && college.description.length > 50) score += 10
  
  // Additional fields
  if (college.ranking) score += 5
  if (college.establishedYear) score += 5
  if (college.accreditation) score += 5
  if (college.ownership) score += 3
  if (college.campusSize) score += 3
  if (college.totalStudents) score += 3
  if (college.hostelFees) score += 3
  if (college.averagePackage) score += 3
  if (college.highestPackage) score += 3
  if (college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0) score += 5
  
  // Images
  if (college.images && Array.isArray(college.images) && college.images.length > 0) {
    const hasValidImage = college.images.some((img: string) => 
      img && (img.startsWith("http://") || img.startsWith("https://"))
    )
    if (hasValidImage) score += 10
  }
  
  // Course count bonus (max 10 points)
  if (courseCount > 0) {
    score += Math.min(10, courseCount * 0.5) // 0.5 points per course, max 10
  }
  
  return score
}

// Function to merge courses from duplicate colleges
async function mergeCourses(keepCollegeId: number, duplicateCollegeIds: number[]): Promise<number> {
  let mergedCount = 0
  
  for (const duplicateId of duplicateCollegeIds) {
    // Get courses from duplicate college
    const duplicateCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.collegeId, duplicateId))
    
    for (const course of duplicateCourses) {
      // Check if course with same name already exists in kept college
      const existingCourse = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.collegeId, keepCollegeId),
            eq(courses.name, course.name)
          )
        )
        .limit(1)
      
      if (existingCourse.length === 0) {
        // Course doesn't exist in kept college, update it to point to kept college
        await db
          .update(courses)
          .set({
            collegeId: keepCollegeId,
            updatedAt: new Date()
          })
          .where(eq(courses.id, course.id))
        
        mergedCount++
      } else {
        // Course already exists, delete duplicate
        await db.delete(courses).where(eq(courses.id, course.id))
      }
    }
  }
  
  return mergedCount
}

async function removeDuplicates(closeConnection: boolean = true) {
  try {
    console.log("🧹 Starting duplicate college removal process...\n")
    console.log("⚠️  This will keep colleges with the most complete data and delete duplicates\n")

    // Get all colleges
    const allColleges = await db.select().from(colleges)
    console.log(`📊 Total colleges: ${allColleges.length}\n`)

    // Group colleges by normalized name and location (city + state)
    const collegeGroups = new Map<string, any[]>()

    for (const college of allColleges) {
      const normalizedName = normalizeName(college.name)
      const city = (college.city || "").toLowerCase().trim()
      const state = (college.state || "").toLowerCase().trim()
      const locationKey = `${normalizedName}|${city}|${state}`
      
      if (!collegeGroups.has(locationKey)) {
        collegeGroups.set(locationKey, [])
      }
      collegeGroups.get(locationKey)!.push(college)
    }

    // Filter to only groups with duplicates (2+ colleges)
    const duplicateGroups = new Map<string, any[]>()
    for (const [key, group] of collegeGroups.entries()) {
      if (group.length > 1) {
        duplicateGroups.set(key, group)
      }
    }

    if (duplicateGroups.size === 0) {
      console.log("✅ No duplicate colleges found!")
      return {
        duplicatesFound: 0,
        duplicatesRemoved: 0,
        coursesMerged: 0
      }
    }

    console.log(`📋 Found ${duplicateGroups.size} groups of duplicate colleges\n`)

    const duplicatesToRemove = new Set<number>()
    let totalCoursesMerged = 0

    // Process each duplicate group
    for (const [key, group] of duplicateGroups.entries()) {
      const collegeName = group[0].name
      console.log(`\n📦 Processing group: ${collegeName}`)
      console.log(`   Found ${group.length} duplicates`)
      
      // Calculate completeness score for each college in the group (including course count)
      const collegesWithScores = await Promise.all(
        group.map(async (college) => {
          // Get course count for each college
          const courseCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(courses)
            .where(eq(courses.collegeId, college.id))
          
          const coursesCount = Number(courseCountResult[0]?.count || 0)
          
          // Calculate completeness score
          const score = getCompletenessScore(college, coursesCount)
          
          return {
            college,
            score,
            coursesCount
          }
        })
      )
      
      // Sort by score (highest first), then by course count, then by ID (newest first)
      collegesWithScores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        if (b.coursesCount !== a.coursesCount) return b.coursesCount - a.coursesCount
        return b.college.id - a.college.id // Keep newer one if scores are equal
      })

      const keepCollege = collegesWithScores[0].college
      const duplicatesToRemoveInGroup = collegesWithScores.slice(1)
      
      console.log(`   ✅ Keeping: ${keepCollege.name} (ID: ${keepCollege.id}, Score: ${collegesWithScores[0].score.toFixed(1)}, Courses: ${collegesWithScores[0].coursesCount})`)
      
      // Merge courses from duplicates to kept college
      const duplicateIds = duplicatesToRemoveInGroup.map(c => c.college.id)
      const coursesMerged = await mergeCourses(keepCollege.id, duplicateIds)
      totalCoursesMerged += coursesMerged
      
      if (coursesMerged > 0) {
        console.log(`   📚 Merged ${coursesMerged} course(s) to kept college`)
      }
      
      // Mark duplicates for removal
      for (const duplicate of duplicatesToRemoveInGroup) {
        console.log(`   🗑️  Marking for deletion: ${duplicate.college.name} (ID: ${duplicate.college.id}, Score: ${duplicate.score.toFixed(1)}, Courses: ${duplicate.coursesCount})`)
        duplicatesToRemove.add(duplicate.college.id)
      }
    }

    // Remove duplicates
    if (duplicatesToRemove.size > 0) {
      console.log(`\n🗑️  Removing ${duplicatesToRemove.size} duplicate colleges...`)
      
      const idsToRemove = Array.from(duplicatesToRemove)
      
      // Delete in batches to avoid issues
      for (const id of idsToRemove) {
        try {
          await db.delete(colleges).where(eq(colleges.id, id))
          console.log(`  ✅ Removed college ID: ${id}`)
        } catch (error: any) {
          console.error(`  ❌ Error removing college ID ${id}:`, error.message)
        }
      }
      
      console.log(`\n✨ Successfully removed ${idsToRemove.length} duplicate colleges!`)
    } else {
      console.log("\n✅ No duplicates to remove!")
    }

    // Final count
    const finalCount = await db.select().from(colleges)
    console.log(`\n📊 Summary:`)
    console.log(`   - Duplicate groups found: ${duplicateGroups.size}`)
    console.log(`   - Duplicates removed: ${duplicatesToRemove.size}`)
    console.log(`   - Courses merged: ${totalCoursesMerged}`)
    console.log(`   - Final college count: ${finalCount.length}`)
    console.log(`   - Removed: ${allColleges.length - finalCount.length} duplicates`)
    
    return {
      duplicatesFound: duplicateGroups.size,
      duplicatesRemoved: duplicatesToRemove.size,
      coursesMerged: totalCoursesMerged
    }
    
  } catch (error) {
    console.error("❌ Error removing duplicates:", error)
    throw error
  } finally {
    if (closeConnection) {
      await client.end()
    }
  }
}

// Run if called directly (from command line)
if (require.main === module) {
  removeDuplicates()
    .then((result) => {
      console.log("\n✅ Duplicate removal script completed successfully")
      if (result) {
        console.log(JSON.stringify(result, null, 2))
      }
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Duplicate removal script failed:", error)
      process.exit(1)
    })
}

export { removeDuplicates }

