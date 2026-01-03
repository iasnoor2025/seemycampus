// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq, and } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { courses } from "./schema"

// Function to normalize course name for comparison
function normalizeCourseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// Function to calculate completeness score for a course
function getCourseCompletenessScore(course: any): number {
  let score = 0
  
  // Basic fields (required)
  if (course.name) score += 10
  if (course.slug) score += 10
  if (course.collegeId) score += 5
  
  // Description
  if (course.description && course.description.length > 20) score += 10
  
  // Additional fields
  if (course.duration) score += 5
  if (course.fees) score += 5
  if (course.feesCurrency) score += 3
  if (course.studyMode) score += 3
  if (course.level) score += 3
  
  return score
}

async function removeDuplicateCourses(closeConnection: boolean = true) {
  try {
    console.log("🧹 Starting duplicate course removal process...\n")
    console.log("⚠️  This will keep courses with the most complete data and delete duplicates\n")

    // Get all courses
    const allCourses = await db.select().from(courses)
    console.log(`📊 Total courses: ${allCourses.length}\n`)

    // Group courses by normalized name and collegeId
    const courseGroups = new Map<string, any[]>()

    for (const course of allCourses) {
      const normalizedName = normalizeCourseName(course.name)
      const groupKey = `${normalizedName}|${course.collegeId}`
      
      if (!courseGroups.has(groupKey)) {
        courseGroups.set(groupKey, [])
      }
      courseGroups.get(groupKey)!.push(course)
    }

    // Filter to only groups with duplicates (2+ courses)
    const duplicateGroups = new Map<string, any[]>()
    for (const [key, group] of courseGroups.entries()) {
      if (group.length > 1) {
        duplicateGroups.set(key, group)
      }
    }

    if (duplicateGroups.size === 0) {
      console.log("✅ No duplicate courses found!")
      return {
        duplicatesFound: 0,
        duplicatesRemoved: 0
      }
    }

    console.log(`📋 Found ${duplicateGroups.size} groups of duplicate courses\n`)

    const duplicatesToRemove = new Set<number>()

    // Process each duplicate group
    for (const [key, group] of duplicateGroups.entries()) {
      const courseName = group[0].name
      const collegeId = group[0].collegeId
      console.log(`\n📦 Processing group: "${courseName}" (College ID: ${collegeId})`)
      console.log(`   Found ${group.length} duplicates`)
      
      // Calculate completeness score for each course in the group
      const coursesWithScores = group.map(course => {
        const score = getCourseCompletenessScore(course)
        return {
          course,
          score
        }
      })
      
      // Sort by score (highest first), then by ID (newest first)
      coursesWithScores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.course.id - a.course.id // Keep newer one if scores are equal
      })

      const keepCourse = coursesWithScores[0].course
      const duplicatesToRemoveInGroup = coursesWithScores.slice(1)
      
      console.log(`   ✅ Keeping: "${keepCourse.name}" (ID: ${keepCourse.id}, Score: ${coursesWithScores[0].score.toFixed(1)})`)
      
      // Mark duplicates for removal
      for (const duplicate of duplicatesToRemoveInGroup) {
        console.log(`   🗑️  Marking for deletion: "${duplicate.course.name}" (ID: ${duplicate.course.id}, Score: ${duplicate.score.toFixed(1)})`)
        duplicatesToRemove.add(duplicate.course.id)
      }
    }

    // Remove duplicates
    if (duplicatesToRemove.size > 0) {
      console.log(`\n🗑️  Removing ${duplicatesToRemove.size} duplicate courses...`)
      
      const idsToRemove = Array.from(duplicatesToRemove)
      
      // Delete in batches to avoid issues
      for (const id of idsToRemove) {
        try {
          await db.delete(courses).where(eq(courses.id, id))
          console.log(`  ✅ Removed course ID: ${id}`)
        } catch (error: any) {
          console.error(`  ❌ Error removing course ID ${id}:`, error.message)
        }
      }
      
      console.log(`\n✨ Successfully removed ${idsToRemove.length} duplicate courses!`)
    } else {
      console.log("\n✅ No duplicates to remove!")
    }

    // Final count
    const finalCount = await db.select().from(courses)
    console.log(`\n📊 Summary:`)
    console.log(`   - Duplicate groups found: ${duplicateGroups.size}`)
    console.log(`   - Duplicates removed: ${duplicatesToRemove.size}`)
    console.log(`   - Final course count: ${finalCount.length}`)
    console.log(`   - Removed: ${allCourses.length - finalCount.length} duplicates`)
    
    return {
      duplicatesFound: duplicateGroups.size,
      duplicatesRemoved: duplicatesToRemove.size
    }
    
  } catch (error) {
    console.error("❌ Error removing duplicate courses:", error)
    throw error
  } finally {
    if (closeConnection) {
      await client.end()
    }
  }
}

// Run if called directly (from command line)
if (require.main === module) {
  removeDuplicateCourses()
    .then((result) => {
      console.log("\n✅ Duplicate course removal script completed successfully")
      if (result) {
        console.log(JSON.stringify(result, null, 2))
      }
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Duplicate course removal script failed:", error)
      process.exit(1)
    })
}

export { removeDuplicateCourses }

