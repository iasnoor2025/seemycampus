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

import { colleges } from "./schema"

// Function to calculate completeness score for a college
function getCompletenessScore(college: any): number {
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
  
  return score
}

async function removeDuplicates() {
  try {
    console.log("🔍 Finding and removing duplicate colleges...\n")

    // Get all colleges
    const allColleges = await db.select().from(colleges)
    console.log(`📊 Total colleges: ${allColleges.length}\n`)

    // Group colleges by name (case-insensitive) and slug
    const collegesByName = new Map<string, any[]>()
    const collegesBySlug = new Map<string, any[]>()

    for (const college of allColleges) {
      const nameKey = college.name.toLowerCase().trim()
      const slugKey = college.slug.toLowerCase().trim()

      // Group by name
      if (!collegesByName.has(nameKey)) {
        collegesByName.set(nameKey, [])
      }
      collegesByName.get(nameKey)!.push(college)

      // Group by slug
      if (!collegesBySlug.has(slugKey)) {
        collegesBySlug.set(slugKey, [])
      }
      collegesBySlug.get(slugKey)!.push(college)
    }

    // Find duplicates
    const duplicatesToRemove = new Set<number>()
    let duplicateGroups = 0

    // Check name duplicates
    for (const [name, collegesList] of collegesByName.entries()) {
      if (collegesList.length > 1) {
        duplicateGroups++
        console.log(`\n🔍 Found ${collegesList.length} colleges with name: "${name}"`)
        
        // Calculate scores for each
        const collegesWithScores = collegesList.map(college => ({
          college,
          score: getCompletenessScore(college)
        }))
        
        // Sort by score (highest first), then by ID (keep the one created first)
        collegesWithScores.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return a.college.id - b.college.id
        })

        // Keep the first one (highest score), mark others for deletion
        const [keep, ...toRemove] = collegesWithScores
        console.log(`  ✅ Keeping: ID ${keep.college.id} (Score: ${keep.score})`)
        
        for (const { college: toDelete } of toRemove) {
          console.log(`  ❌ Removing: ID ${toDelete.id} (Score: ${getCompletenessScore(toDelete)})`)
          duplicatesToRemove.add(toDelete.id)
        }
      }
    }

    // Check slug duplicates (might catch different cases)
    for (const [slug, collegesList] of collegesBySlug.entries()) {
      if (collegesList.length > 1) {
        // Only process if not already marked for removal
        const notMarked = collegesList.filter(c => !duplicatesToRemove.has(c.id))
        if (notMarked.length > 1) {
          console.log(`\n🔍 Found ${collegesList.length} colleges with slug: "${slug}"`)
          
          const collegesWithScores = notMarked.map(college => ({
            college,
            score: getCompletenessScore(college)
          }))
          
          collegesWithScores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return a.college.id - b.college.id
          })

          const [keep, ...toRemove] = collegesWithScores
          console.log(`  ✅ Keeping: ID ${keep.college.id} (Score: ${keep.score})`)
          
          for (const { college: toDelete } of toRemove) {
            console.log(`  ❌ Removing: ID ${toDelete.id} (Score: ${getCompletenessScore(toDelete)})`)
            duplicatesToRemove.add(toDelete.id)
          }
        }
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
      console.log("\n✅ No duplicates found!")
    }

    // Final count
    const finalCount = await db.select().from(colleges)
    console.log(`\n📊 Final college count: ${finalCount.length}`)
    console.log(`   Removed: ${allColleges.length - finalCount.length} duplicates`)
    
  } catch (error) {
    console.error("❌ Error removing duplicates:", error)
    throw error
  }
}

// Run
removeDuplicates()
  .then(() => {
    console.log("✅ Duplicate removal script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Duplicate removal script failed:", error)
    process.exit(1)
  })

export { removeDuplicates }

