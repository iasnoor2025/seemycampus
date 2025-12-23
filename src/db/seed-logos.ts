// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { colleges } from "./schema"
import { findCollegeLogoWeb } from "./find-logos-web"

// Alternative: Use a logo database service or manual mapping
const knownLogos: Record<string, string> = {
  "gl-bajaj-institute-of-management-and-technology": "https://www.glbitm.org/wp-content/uploads/2020/06/GL-Bajaj-Logo.png",
  "jaipuria-institute-of-management": "https://www.jaipuria.ac.in/wp-content/uploads/2021/06/Jaipuria-Logo.png",
  "shanti-business-school": "https://www.shantibusinessschool.com/images/logo.png",
  "isbr-business-school": "https://www.isbr.in/wp-content/uploads/2020/06/ISBR-Logo.png",
  "iit-delhi": "https://www.iitd.ac.in/sites/default/files/IITD_Logo.png",
  "iit-bombay": "https://www.iitb.ac.in/sites/default/files/IITB_Logo.png",
  "iit-madras": "https://www.iitm.ac.in/sites/default/files/IITM_Logo.png",
  "vit-vellore": "https://vit.ac.in/files/vit-logo.png",
  "srm-institute-of-science-and-technology": "https://www.srmist.edu.in/sites/default/files/srm-logo.png",
  "amity-university": "https://www.amity.edu/images/amity-logo.png",
  "lovely-professional-university": "https://www.lpu.in/images/lpu-logo.png",
  "manipal-academy-of-higher-education": "https://manipal.edu/images/mahe-logo.png",
  "bits-pilani": "https://www.bits-pilani.ac.in/images/bits-logo.png",
  "iim-ahmedabad": "https://www.iima.ac.in/sites/default/files/iima-logo.png",
  "iim-bangalore": "https://www.iimb.ac.in/sites/default/files/iimb-logo.png",
  "iim-calcutta": "https://www.iimcal.ac.in/sites/default/files/iimc-logo.png",
  "aiims-delhi": "https://www.aiims.edu/images/aiims-logo.png",
  "nlsiu-bangalore": "https://www.nls.ac.in/images/nls-logo.png",
  "nid-ahmedabad": "https://www.nid.edu/images/nid-logo.png",
}

async function seedLogos() {
  try {
    console.log("🔍 Finding and seeding college logos...\n")

    // Get all colleges from database
    const allColleges = await db.select().from(colleges)
    
    console.log(`📊 Found ${allColleges.length} colleges to process\n`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const college of allColleges) {
      try {
        // Check if college already has images
        if (college.images && Array.isArray(college.images) && college.images.length > 0) {
          const existingImage = college.images[0]
          // Skip if it's already a valid URL (not a local path)
          if (existingImage.startsWith("http://") || existingImage.startsWith("https://")) {
            console.log(`⏭️  Skipped: ${college.name} (already has logo URL)`)
            skippedCount++
            continue
          }
        }

        console.log(`\n🔍 Searching logo for: ${college.name}`)
        
        // First check known logos
        let logoUrl: string | null = knownLogos[college.slug] || null
        let logoSource = "known-logos"
        
        // If not in known logos, try to find it using web search
        if (!logoUrl) {
          const searchResult = await findCollegeLogoWeb(college.name, college.website, college.slug)
          logoUrl = searchResult.url
          logoSource = searchResult.source
        }

        if (logoUrl) {
          // Update college with logo URL
          await db
            .update(colleges)
            .set({
              images: [logoUrl],
              updatedAt: new Date(),
            })
            .where(eq(colleges.id, college.id))
          
          console.log(`  ✅ Updated: ${college.name}`)
          console.log(`     Logo URL: ${logoUrl}`)
          console.log(`     Source: ${logoSource}`)
          updatedCount++
        } else {
          console.log(`  ⚠️  Could not find logo for: ${college.name}`)
          errorCount++
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: any) {
        console.error(`  ❌ Error processing ${college.name}:`, error.message)
        errorCount++
      }
    }

    console.log("\n✨ Logo seeding completed!")
    console.log(`📊 Summary:`)
    console.log(`   - Colleges updated: ${updatedCount}`)
    console.log(`   - Colleges skipped: ${skippedCount}`)
    console.log(`   - Errors/Not found: ${errorCount}`)
    console.log(`   - Total processed: ${allColleges.length}`)
    
    if (errorCount > 0) {
      console.log("\n💡 Tip: You can manually add logo URLs to the 'knownLogos' object in seed-logos.ts")
    }
  } catch (error) {
    console.error("❌ Logo seeding failed:", error)
    throw error
  }
}

// Run seed
seedLogos()
  .then(() => {
    console.log("✅ Logo seed script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Logo seed script failed:", error)
    process.exit(1)
  })

export { seedLogos }

