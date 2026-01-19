/**
 * Migration script to add shift timing columns to employees and attendance_records tables
 * Run with: tsx scripts/migrate-shift-timing.ts
 */

import { config } from "dotenv"
import postgres from "postgres"

// Load environment variables
config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Make sure .env file exists.")
}

const sql = postgres(process.env.DATABASE_URL)

async function migrateShiftTiming() {
  try {
    console.log("Starting shift timing migration...")

    // Add columns to employees table
    console.log("Adding shift timing columns to employees table...")
    await sql`
      ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS shift_start_time TIME,
      ADD COLUMN IF NOT EXISTS shift_end_time TIME,
      ADD COLUMN IF NOT EXISTS early_threshold_minutes INTEGER DEFAULT 15,
      ADD COLUMN IF NOT EXISTS late_threshold_minutes INTEGER DEFAULT 15
    `
    console.log("✓ Added shift timing columns to employees table")

    // Add check_in_status column to attendance_records table
    console.log("Adding check_in_status column to attendance_records table...")
    await sql`
      ALTER TABLE attendance_records
      ADD COLUMN IF NOT EXISTS check_in_status VARCHAR(50)
    `
    console.log("✓ Added check_in_status column to attendance_records table")

    // Set default shift timing for all employees (9 AM - 5 PM)
    console.log("Setting default shift timing (09:00 - 17:00) for all employees...")
    await sql`
      UPDATE employees
      SET 
        shift_start_time = '09:00:00',
        shift_end_time = '17:00:00',
        early_threshold_minutes = 15,
        late_threshold_minutes = 15
    `
    console.log("✓ Set default shift timing for all employees")

    console.log("\n✅ Migration completed successfully!")
  } catch (error: any) {
    console.error("❌ Migration failed:", error)
    throw error
  } finally {
    await sql.end()
  }
}

migrateShiftTiming()
  .then(() => {
    console.log("Migration script finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Migration script failed:", error)
    process.exit(1)
  })
