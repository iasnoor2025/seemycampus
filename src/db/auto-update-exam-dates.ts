// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq } from "drizzle-orm"
import { entranceExams } from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })
import { 
  getCurrentAcademicYear, 
  getAcademicYearFromDate, 
  shouldUpdateExamDates,
  incrementExamDatesByYear 
} from "@/lib/examDateUpdater"

/**
 * Automatically update exam dates when academic year changes
 * This function:
 * 1. Checks all active exams
 * 2. Identifies exams with dates from past academic years
 * 3. Increments their dates by 1 year
 * 4. Updates the database
 */
async function autoUpdateExamDates() {
  try {
    console.log("🔄 Starting automatic exam date update...")
    console.log(`📅 Current Academic Year: ${getCurrentAcademicYear()}-${getCurrentAcademicYear() + 1}`)
    
    // Fetch all active exams
    const allExams = await db
      .select()
      .from(entranceExams)
      .where(eq(entranceExams.isActive, true))

    console.log(`\n📊 Found ${allExams.length} active exams to check\n`)

    let updatedCount = 0
    let skippedCount = 0

    for (const exam of allExams) {
      try {
        // Check if exam dates need updating
        const needsUpdate = exam.examDate ? shouldUpdateExamDates(new Date(exam.examDate)) : false
        
        if (!needsUpdate) {
          const examYear = exam.examDate ? getAcademicYearFromDate(new Date(exam.examDate)) : null
          console.log(`  ⏭️  Skipped: ${exam.name} (Academic Year: ${examYear ? `${examYear}-${examYear + 1}` : 'N/A'})`)
          skippedCount++
          continue
        }

        // Get current dates
        const currentDates = {
          examDate: exam.examDate ? new Date(exam.examDate) : null,
          registrationStartDate: exam.registrationStartDate ? new Date(exam.registrationStartDate) : null,
          registrationEndDate: exam.registrationEndDate ? new Date(exam.registrationEndDate) : null,
          resultDate: exam.resultDate ? new Date(exam.resultDate) : null,
        }

        // Increment dates by 1 year
        const updatedDates = incrementExamDatesByYear(currentDates)

        // Update in database
        await db
          .update(entranceExams)
          .set({
            examDate: updatedDates.examDate,
            registrationStartDate: updatedDates.registrationStartDate,
            registrationEndDate: updatedDates.registrationEndDate,
            resultDate: updatedDates.resultDate,
            updatedAt: new Date(),
          })
          .where(eq(entranceExams.id, exam.id))

        const oldYear = exam.examDate ? getAcademicYearFromDate(new Date(exam.examDate)) : null
        const newYear = updatedDates.examDate ? getAcademicYearFromDate(updatedDates.examDate) : null
        
        console.log(`  ✅ Updated: ${exam.name}`)
        console.log(`     ${oldYear ? `${oldYear}-${oldYear + 1}` : 'N/A'} → ${newYear ? `${newYear}-${newYear + 1}` : 'N/A'}`)
        if (updatedDates.examDate) {
          console.log(`     Exam Date: ${updatedDates.examDate.toLocaleDateString()}`)
        }
        
        updatedCount++
      } catch (error: any) {
        console.error(`  ❌ Error updating ${exam.name}:`, error.message)
      }
    }

    console.log(`\n✨ Update completed!`)
    console.log(`   ✅ Updated: ${updatedCount} exams`)
    console.log(`   ⏭️  Skipped: ${skippedCount} exams (already current)`)
    
    return { updated: updatedCount, skipped: skippedCount }
  } catch (error) {
    console.error("❌ Auto-update failed:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  autoUpdateExamDates()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { autoUpdateExamDates }

