/**
 * Migration script to add check_out_status column to attendance_records table
 * Run with: tsx scripts/migrate-checkout-status.ts
 */

import { config } from "dotenv"
import postgres from "postgres"

// Load environment variables
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Make sure .env file exists.")
}

const sql = postgres(process.env.DATABASE_URL)

async function migrateCheckOutStatus() {
  try {
    console.log("Starting check-out status migration...")

    // Add check_out_status column to attendance_records table
    console.log("Adding check_out_status column to attendance_records table...")
    await sql`
      ALTER TABLE attendance_records
      ADD COLUMN IF NOT EXISTS check_out_status VARCHAR(50)
    `
    console.log("✓ Added check_out_status column to attendance_records table")

    console.log("\n✅ Migration completed successfully!")
  } catch (error: any) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    await sql.end()
  }
}

migrateCheckOutStatus()
  .then(() => {
    console.log("Migration script finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Migration script failed:", error)
    process.exit(1)
  })
