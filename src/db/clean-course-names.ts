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

import { courses } from "./schema"
import { eq } from "drizzle-orm"

function cleanCourseName(name: string): string {
  if (!name) return name

  // Remove common scraped metadata patterns
  let cleaned = name

  // Remove patterns like "Total Fees:₹13.5 Lakhs" or "Total Fees:₹13.5 Lakhs - 2.38 Lakhs"
  cleaned = cleaned.replace(/Total Fees:₹?[\d.,\s-]+\s*(Lakhs|Lakh|Crore|Crores|K|L)?/gi, "")

  // Remove patterns like "9 Courses" or "1 Courses"
  cleaned = cleaned.replace(/\d+\s*Courses?/gi, "")

  // Remove patterns like "3 Years Full Time", "1 Year 6 MonthsFull Time", etc.
  cleaned = cleaned.replace(/\d+\s*Years?\s*(\d+\s*Months?)?\s*(Full|Part|Distance)\s*Time/gi, "")
  cleaned = cleaned.replace(/\d+\s*Years?\s*Full\s*Time/gi, "")
  cleaned = cleaned.replace(/\d+\s*Years?\s*Part\s*Time/gi, "")
  cleaned = cleaned.replace(/\d+\s*Years?\s*Distance/gi, "")

  // Remove patterns like "Check Detailed Fees"
  cleaned = cleaned.replace(/Check\s*Detailed\s*Fees/gi, "")

  // Remove patterns like "#166out of 500 by [external source]"
  cleaned = cleaned.replace(/#\d+out\s*of\s*\d+\s*by\s*[A-Za-z.]+/gi, "")

  // Remove patterns like "Eligibility:Diploma with 60%" or "Eligibility:10th with 65%"
  cleaned = cleaned.replace(/Eligibility:[^A-Z]*/gi, "")

  // Remove patterns like "Brochure", "Apply Now", "View X Courses"
  cleaned = cleaned.replace(/Brochure/gi, "")
  cleaned = cleaned.replace(/Apply\s*Now/gi, "")
  cleaned = cleaned.replace(/View\s*\d+\s*Courses?/gi, "")

  // Remove patterns like "(Based on 56 views last year)"
  cleaned = cleaned.replace(/\(Based\s*on\s*\d+\s*views?\s*last\s*year\)/gi, "")

  // Remove patterns like "X Students have shown interest in the last 30 days"
  cleaned = cleaned.replace(/\d+\s*Students?\s*have\s*shown\s*interest\s*in\s*the\s*last\s*\d+\s*days?/gi, "")

  // Remove patterns like "4.2(12 Reviews)" or "3.9(6 Reviews)"
  cleaned = cleaned.replace(/\d+\.\d+\(\d+\s*Reviews?\)/gi, "")
  cleaned = cleaned.replace(/\d+\(\d+\s*Reviews?\)/gi, "")

  // Remove patterns like "Post Graduation + UGC NET" or "Graduation + CEED" or any "+" patterns
  cleaned = cleaned.replace(/\s*(Post\s*)?Graduation\s*\+[^A-Z]*/gi, "")
  cleaned = cleaned.replace(/\s*\+\s*[A-Z\s]+/g, "") // Remove any "+ Something" patterns

  // Remove patterns like "Application Date:20 Mar - 30 Mar 2025"
  cleaned = cleaned.replace(/Application\s*Date:\s*\d+\s*[A-Za-z]+\s*-\s*\d+\s*[A-Za-z]+\s*\d{4}/gi, "")
  cleaned = cleaned.replace(/Application\s*Date:[^A-Z]*/gi, "")

  // Remove patterns like "Today" at the end
  cleaned = cleaned.replace(/\s+Today\s*$/gi, "")

  // Remove patterns like "View" at the end
  cleaned = cleaned.replace(/\s+View\s*$/gi, "")

  // Remove patterns like "Diploma with 60%" or "10th with 65%" or "Diploma"
  cleaned = cleaned.replace(/\s+(Diploma|10th|12th)\s*(with\s*\d+%)?/gi, "")

  // Remove patterns like "Years Full Time" (leftover from previous cleaning)
  cleaned = cleaned.replace(/\s+Years?\s*Full\s*Time/gi, "")

  // Remove common exam/entrance test names that appear after course names
  cleaned = cleaned.replace(/\s+(UGC\s*NET|CEED|PET|NMIMS\s*CET|MH-CET|JEE|Entrance\s*Test)[^A-Z]*/gi, "")

  // Remove patterns like "Post Graduation" or "Graduation" standalone
  cleaned = cleaned.replace(/\s+(Post\s*)?Graduation\s*$/gi, "")

  // Remove extra whitespace and trim
  cleaned = cleaned.replace(/\s+/g, " ").trim()

  // Remove trailing special characters and common words
  cleaned = cleaned.replace(/[^\w\s()[\]-]+$/g, "").trim()
  cleaned = cleaned.replace(/\s+(View|Courses?|Years?|Today|Graduation|Post\s*Graduation)$/gi, "").trim()

  // Final cleanup: remove any remaining artifacts that look like metadata
  // If the course name is too long (likely contains metadata), try to extract just the course name
  if (cleaned.length > 100) {
    // Try to find where the actual course name ends (usually before common metadata keywords)
    const metadataKeywords = [
      "Total Fees",
      "Courses",
      "Years",
      "Check",
      "Eligibility",
      "Brochure",
      "Apply",
      "View",
      "Based on",
      "Students have",
      "Application Date",
      "Post Graduation",
      "Graduation",
    ]
    
    let shortestMatch = cleaned
    for (const keyword of metadataKeywords) {
      const index = cleaned.indexOf(keyword)
      if (index > 0 && index < shortestMatch.length) {
        shortestMatch = cleaned.substring(0, index).trim()
      }
    }
    
    if (shortestMatch.length < cleaned.length && shortestMatch.length > 10) {
      cleaned = shortestMatch
    }
  }

  return cleaned || name // Return original if cleaned is empty
}

async function cleanCourseNames() {
  console.log("Starting course name cleaning...")

  try {
    // Get all courses
    const allCourses = await db.select().from(courses)

    console.log(`Found ${allCourses.length} total courses`)

    let cleanedCount = 0

    for (const course of allCourses) {
      const cleanedName = cleanCourseName(course.name)

      if (cleanedName !== course.name) {
        console.log(`\nCleaning course ID ${course.id}:`)
        console.log(`  Before: ${course.name.substring(0, 100)}...`)
        console.log(`  After:  ${cleanedName.substring(0, 100)}...`)

        await db
          .update(courses)
          .set({ name: cleanedName })
          .where(eq(courses.id, course.id))

        cleanedCount++
      }
    }

    console.log(`\n✅ Course name cleaning complete!`)
    console.log(`   - Courses cleaned: ${cleanedCount}`)
    console.log(`   - Courses unchanged: ${allCourses.length - cleanedCount}`)
  } catch (error) {
    console.error("Error cleaning course names:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  cleanCourseNames()
    .then(() => {
      console.log("Script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}

export { cleanCourseNames }

