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

import { heroRotatingTexts } from "./schema"

const defaultRotatingTexts = [
  "Find Over 4 Lakh Reviews in India",
  "Find Over 11000+ Courses in India",
  "Find Over 25000+ Colleges in India",
  "Find Over 250+ Exams in India",
]

async function seedHeroRotatingTexts() {
  console.log("Seeding hero rotating texts...")

  try {
    // Check if texts already exist
    const existingTexts = await db.select().from(heroRotatingTexts)
    
    if (existingTexts.length > 0) {
      console.log(`Found ${existingTexts.length} existing rotating texts. Skipping seed.`)
      return
    }

    // Insert default texts
    for (let i = 0; i < defaultRotatingTexts.length; i++) {
      await db.insert(heroRotatingTexts).values({
        text: defaultRotatingTexts[i],
        displayOrder: i,
        isActive: true,
      })
    }

    console.log(`✅ Successfully seeded ${defaultRotatingTexts.length} hero rotating texts`)
  } catch (error) {
    console.error("Error seeding hero rotating texts:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedHeroRotatingTexts()
    .then(() => {
      console.log("Seed completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Seed failed:", error)
      process.exit(1)
    })
}

export { seedHeroRotatingTexts }

