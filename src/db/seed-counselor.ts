import { config } from "dotenv"
import { resolve } from "path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq } from "drizzle-orm"

config({ path: resolve(process.cwd(), ".env") })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

const { users } = schema

// Create test counselor
async function seedCounselor() {
  try {
    console.log("🌱 Creating test counselor...\n")

    // Check if counselor already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "counselor@seemycampus.com"))
      .limit(1)

    if (existing.length > 0) {
      console.log("  ℹ️  Counselor already exists: counselor@seemycampus.com")
      console.log("     Updating role to counselor...")
      
      await db
        .update(users)
        .set({
          role: "counselor",
          updatedAt: new Date(),
        })
        .where(eq(users.email, "counselor@seemycampus.com"))
      
      console.log("  ✅ Updated existing user to counselor role")
    } else {
      // Create new counselor
      await db.insert(users).values({
        name: "Test Counselor",
        email: "counselor@seemycampus.com",
        role: "counselor",
        isApproved: true,
      })

      console.log("  ✅ Created test counselor: counselor@seemycampus.com")
    }

    // List all counselors
    const allCounselors = await db
      .select()
      .from(users)
      .where(eq(users.role, "counselor"))

    console.log(`\n✨ Total counselors in database: ${allCounselors.length}`)
    allCounselors.forEach((c) => {
      console.log(`   - ${c.name || "N/A"} (${c.email})`)
    })

    console.log("\n✅ Done!\n")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding counselor:", error)
    process.exit(1)
  }
}

seedCounselor()

