import { config } from "dotenv"
import { resolve } from "path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../src/db/schema"
import { eq, or, ilike } from "drizzle-orm"

config({ path: resolve(process.cwd(), ".env") })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

const { colleges, courses } = schema

async function checkBBAColleges() {
  console.log("Checking for BBA colleges in database...\n")

  // Method 1: Check colleges with BBA in name or description
  const collegesByName = await db
    .select()
    .from(colleges)
    .where(
      or(
        ilike(colleges.name, "%bba%"),
        ilike(colleges.description, "%bba%")
      )!
    )

  console.log(`Colleges with BBA in name/description: ${collegesByName.length}`)
  if (collegesByName.length > 0) {
    console.log("Sample colleges:")
    collegesByName.slice(0, 5).forEach((c) => {
      console.log(`  - ${c.name} (${c.slug})`)
    })
  }

  // Method 2: Check colleges that have BBA courses
  const collegesWithBBACourses = await db
    .selectDistinct({
      collegeId: courses.collegeId,
      collegeName: colleges.name,
      collegeSlug: colleges.slug,
      courseName: courses.name,
    })
    .from(courses)
    .innerJoin(colleges, eq(courses.collegeId, colleges.id))
    .where(
      or(
        ilike(courses.name, "%bba%"),
        ilike(courses.name, "%bbm%")
      )!
    )
    .limit(50)

  console.log(`\nColleges with BBA/BBM courses: ${collegesWithBBACourses.length}`)
  if (collegesWithBBACourses.length > 0) {
    console.log("Sample colleges with BBA courses:")
    const uniqueColleges = new Map()
    collegesWithBBACourses.forEach((c) => {
      if (!uniqueColleges.has(c.collegeId)) {
        uniqueColleges.set(c.collegeId, c)
        console.log(`  - ${c.collegeName} (${c.collegeSlug}) - Course: ${c.courseName}`)
      }
    })
  }

  // Get total count
  const allColleges = await db.select().from(colleges)
  console.log(`\nTotal colleges in database: ${allColleges.length}`)

  await client.end()
}

checkBBAColleges().catch(console.error)

