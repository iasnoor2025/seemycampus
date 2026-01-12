// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eq } from "drizzle-orm"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { faqs } from "./schema"

async function approveExistingFAQs() {
  console.log("Approving existing FAQs...")

  try {
    // Approve all existing FAQs that are active
    const result = await db
      .update(faqs)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(faqs.isActive, true))
      .returning()

    console.log(`✅ Successfully approved ${result.length} existing FAQs`)
  } catch (error) {
    console.error("Error approving FAQs:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  approveExistingFAQs()
    .then(() => {
      console.log("Approval completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Approval failed:", error)
      process.exit(1)
    })
}

export { approveExistingFAQs }
