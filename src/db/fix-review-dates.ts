// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq, and, sql } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { collegeReviews } from "./schema"

// Function to generate realistic review date based on batch year
function generateRealisticReviewDate(batch: string | null, course: string | null): Date {
  let reviewDate = new Date()
  
  if (batch) {
    const batchYear = parseInt(batch)
    
    if (batchYear >= 2018 && batchYear <= 2024) {
      // Calculate course duration
      const courseDuration = course?.toLowerCase().includes("m.tech") || 
                            course?.toLowerCase().includes("mba") || 
                            course?.toLowerCase().includes("m.") || 
                            course?.toLowerCase().includes("pgdm") ||
                            course?.toLowerCase().includes("m.sc") ||
                            course?.toLowerCase().includes("m.com") ||
                            course?.toLowerCase().includes("m.a") ||
                            course?.toLowerCase().includes("llm") ? 2 : 4
      
      const graduationYear = batchYear + courseDuration
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      
      // Review can be from graduation year to current year
      // Spread reviews over time - some recent, some older
      const yearsSinceGraduation = Math.min(currentYear - graduationYear, 3) // Max 3 years after graduation
      const randomYearOffset = Math.floor(Math.random() * (yearsSinceGraduation + 1))
      const reviewYear = Math.min(graduationYear + randomYearOffset, currentYear)
      
      // Random month (0-11) and day (1-28 to avoid month-end issues)
      const randomMonth = Math.floor(Math.random() * 12)
      const randomDay = Math.floor(Math.random() * 28) + 1
      
      // If review year is current year, don't go beyond current month
      if (reviewYear === currentYear) {
        const maxMonth = Math.min(randomMonth, currentMonth)
        reviewDate = new Date(reviewYear, maxMonth, Math.min(randomDay, 28))
      } else {
        reviewDate = new Date(reviewYear, randomMonth, randomDay)
      }
    } else {
      // Invalid batch year, generate random date in last 2 years
      const daysAgo = Math.floor(Math.random() * 730)
      reviewDate = new Date()
      reviewDate.setDate(reviewDate.getDate() - daysAgo)
    }
  } else {
    // No batch year, generate random date in last 2 years
    const daysAgo = Math.floor(Math.random() * 730)
    reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() - daysAgo)
  }
  
  // Add some variation to avoid all reviews on same day
  const dayVariation = Math.floor(Math.random() * 30) - 15 // ±15 days
  reviewDate.setDate(reviewDate.getDate() + dayVariation)
  
  // Ensure date is not in the future
  if (reviewDate > new Date()) {
    reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 30))
  }
  
  // Ensure date is not too old (not before 2018)
  const minDate = new Date(2018, 0, 1)
  if (reviewDate < minDate) {
    reviewDate = new Date(2018, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  }
  
  return reviewDate
}

// Main function to fix review dates
async function fixReviewDates() {
  console.log("🔧 Starting review date fix process...\n")
  console.log("📅 This will update review dates to be more realistic based on batch years\n")
  
  try {
    // Get all reviews
    const allReviews = await db.select().from(collegeReviews)
    console.log(`📊 Found ${allReviews.length} reviews to process\n`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    // Group reviews by college to avoid same dates
    const reviewsByCollege = new Map<number, any[]>()
    for (const review of allReviews) {
      if (!reviewsByCollege.has(review.collegeId)) {
        reviewsByCollege.set(review.collegeId, [])
      }
      reviewsByCollege.get(review.collegeId)!.push(review)
    }
    
    // Process each college's reviews
    for (const [collegeId, reviews] of reviewsByCollege.entries()) {
      console.log(`\n📦 Processing college ID ${collegeId} (${reviews.length} reviews)`)
      
      // Sort reviews by batch year (if available) to generate dates in order
      const sortedReviews = [...reviews].sort((a, b) => {
        const batchA = a.batch ? parseInt(a.batch) : 0
        const batchB = b.batch ? parseInt(b.batch) : 0
        return batchA - batchB
      })
      
      // Generate dates for each review, ensuring they're spread out
      for (let i = 0; i < sortedReviews.length; i++) {
        const review = sortedReviews[i]
        
        // Generate realistic date
        const newDate = generateRealisticReviewDate(review.batch, review.course)
        
        // Add variation based on index to spread reviews over time
        const daysOffset = i * 7 + Math.floor(Math.random() * 14) // Spread over weeks
        newDate.setDate(newDate.getDate() - daysOffset)
        
        // Ensure date is not in the future
        if (newDate > new Date()) {
          newDate.setTime(new Date().getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        }
        
        try {
          await db
            .update(collegeReviews)
            .set({
              externalDate: newDate,
              createdAt: newDate,
              updatedAt: new Date(),
            })
            .where(eq(collegeReviews.id, review.id))
          
          console.log(`  ✅ Updated review ID ${review.id}: ${newDate.toLocaleDateString()} (Batch: ${review.batch || "N/A"})`)
          updatedCount++
        } catch (error: any) {
          console.error(`  ❌ Error updating review ID ${review.id}:`, error.message)
          skippedCount++
        }
      }
    }
    
    console.log(`\n✨ Review date fix completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Reviews updated: ${updatedCount}`)
    console.log(`   - Reviews skipped: ${skippedCount}`)
    console.log(`   - Total reviews processed: ${allReviews.length}`)
    
  } catch (error) {
    console.error("❌ Error fixing review dates:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly (from command line)
if (require.main === module) {
  fixReviewDates()
    .then(() => {
      console.log("\n✅ Review date fix script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Review date fix script failed:", error)
      process.exit(1)
    })
}

export { fixReviewDates }

