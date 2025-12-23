// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { testimonials } from "./schema"
import { eq, sql } from "drizzle-orm"

async function removeDuplicateTestimonials() {
  console.log("Starting duplicate testimonials removal...")

  try {
    // Get all testimonials
    const allTestimonials = await db.select().from(testimonials)

    console.log(`Found ${allTestimonials.length} total testimonials`)

    // Group by name and testimonial text (case-insensitive comparison)
    const grouped = new Map<string, any[]>()

    for (const testimonial of allTestimonials) {
      // Create a key based on normalized name and testimonial text
      const key = `${(testimonial.name || "").toLowerCase().trim()}_${(testimonial.testimonial || "").toLowerCase().trim().substring(0, 100)}`
      
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(testimonial)
    }

    let duplicatesRemoved = 0
    let duplicatesFound = 0

    // Process each group
    for (const [key, group] of grouped.entries()) {
      if (group.length > 1) {
        duplicatesFound += group.length - 1
        
        // Sort by completeness score (more complete = higher score)
        group.sort((a, b) => {
          let scoreA = 0
          let scoreB = 0

          // Photo URL adds points
          if (a.photoUrl) scoreA += 10
          if (b.photoUrl) scoreB += 10

          // Longer testimonial text adds points
          scoreA += (a.testimonial?.length || 0) / 100
          scoreB += (b.testimonial?.length || 0) / 100

          // Active status adds points
          if (a.isActive) scoreA += 5
          if (b.isActive) scoreB += 5

          // Higher display order adds points
          scoreA += a.displayOrder || 0
          scoreB += b.displayOrder || 0

          // Newer creation date adds points (keep more recent)
          if (a.createdAt && b.createdAt) {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            scoreA += dateA / 10000000000
            scoreB += dateB / 10000000000
          }

          return scoreB - scoreA // Sort descending
        })

        // Keep the first one (most complete), delete the rest
        const toKeep = group[0]
        const toDelete = group.slice(1)

        console.log(`\nFound ${group.length} duplicates for "${toKeep.name}":`)
        console.log(`  Keeping ID ${toKeep.id} (score: highest)`)
        
        for (const duplicate of toDelete) {
          console.log(`  Deleting ID ${duplicate.id}`)
          await db.delete(testimonials).where(eq(testimonials.id, duplicate.id))
          duplicatesRemoved++
        }
      }
    }

    console.log(`\n✅ Duplicate removal complete!`)
    console.log(`   - Duplicates found: ${duplicatesFound}`)
    console.log(`   - Duplicates removed: ${duplicatesRemoved}`)
    console.log(`   - Remaining testimonials: ${allTestimonials.length - duplicatesRemoved}`)
  } catch (error) {
    console.error("Error removing duplicate testimonials:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  removeDuplicateTestimonials()
    .then(() => {
      console.log("Script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}

export { removeDuplicateTestimonials }

