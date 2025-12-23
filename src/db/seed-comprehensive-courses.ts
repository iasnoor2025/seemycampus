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

import { courses, colleges } from "./schema"
import { eq, ilike, or } from "drizzle-orm"

// Course templates based on comprehensive Indian college course structure
const courseTemplates = {
  // Bachelor's Programs
  bachelor: [
    { name: "B.Arch", level: "undergraduate", category: "architecture", duration: "5 years" },
    { name: "B.Pharm", level: "undergraduate", category: "pharmacy", duration: "4 years" },
    { name: "B.Sc", level: "undergraduate", category: "science", duration: "3 years" },
    { name: "B.Sc (Agriculture)", level: "undergraduate", category: "agriculture", duration: "4 years" },
    { name: "B.Sc (Medicine)", level: "undergraduate", category: "medical", duration: "3 years" },
    { name: "B.Sc (Nursing)", level: "undergraduate", category: "paramedical", duration: "4 years" },
    { name: "BA", level: "undergraduate", category: "arts", duration: "3 years" },
    { name: "Bachelors in Vocational Courses", level: "undergraduate", category: "vocational", duration: "3 years" },
    { name: "BAMS", level: "undergraduate", category: "medical", duration: "5.5 years" },
    { name: "BBA/BBM", level: "undergraduate", category: "management", duration: "3 years" },
    { name: "BBA (Aviation)", level: "undergraduate", category: "aviation", duration: "3 years" },
    { name: "BCA", level: "undergraduate", category: "computer", duration: "3 years" },
    { name: "BE/B.Tech", level: "undergraduate", category: "engineering", duration: "4 years" },
    { name: "BDS", level: "undergraduate", category: "dental", duration: "5 years" },
    { name: "MBBS", level: "undergraduate", category: "medical", duration: "5.5 years" },
    { name: "LLB", level: "undergraduate", category: "law", duration: "3 years" },
    { name: "B.Des", level: "undergraduate", category: "design", duration: "4 years" },
    { name: "BVSc", level: "undergraduate", category: "veterinary", duration: "5 years" },
    { name: "Bachelor of Animation", level: "undergraduate", category: "animation", duration: "3-4 years" },
    { name: "BSW", level: "undergraduate", category: "arts", duration: "3 years" },
    { name: "BPH", level: "undergraduate", category: "medical", duration: "4 years" },
    { name: "B.F.Sc", level: "undergraduate", category: "science", duration: "4 years" },
    { name: "Bachelors (Animation & Graphic Design)", level: "undergraduate", category: "arts", duration: "3-4 years" },
    { name: "B.P.Ed", level: "undergraduate", category: "education", duration: "1-2 years" },
    { name: "BFA", level: "undergraduate", category: "arts", duration: "4 years" },
    { name: "BUMS", level: "undergraduate", category: "medical", duration: "5.5 years" },
    { name: "Bachelor of Physiotherapy(BPT)", level: "undergraduate", category: "medical", duration: "4.5 years" },
    { name: "B.Planning", level: "undergraduate", category: "architecture", duration: "4 years" },
    { name: "BHMS", level: "undergraduate", category: "medical", duration: "5.5 years" },
    { name: "BMM", level: "undergraduate", category: "mass-communication", duration: "3 years" },
    { name: "BHM", level: "undergraduate", category: "hotel-management", duration: "3-4 years" },
    { name: "B.Com", level: "undergraduate", category: "commerce", duration: "3 years" },
    { name: "B.Ed", level: "undergraduate", category: "education", duration: "2 years" },
  ],
  // Master's Programs
  masters: [
    { name: "MBA/PGDM", level: "graduate", category: "management", duration: "2 years" },
    { name: "Executive MBA", level: "graduate", category: "management", duration: "1-2 years" },
    { name: "ME/M.Tech", level: "graduate", category: "engineering", duration: "2 years" },
    { name: "M.Sc", level: "graduate", category: "science", duration: "2 years" },
    { name: "M.Sc (Agriculture)", level: "graduate", category: "agriculture", duration: "2 years" },
    { name: "M.Sc (Aviation)", level: "graduate", category: "aviation", duration: "2 years" },
    { name: "M.Sc (Medicine)", level: "graduate", category: "medical", duration: "2 years" },
    { name: "M.Sc (Nursing)", level: "graduate", category: "paramedical", duration: "2 years" },
    { name: "MA", level: "graduate", category: "arts", duration: "2 years" },
    { name: "Masters in Vocational Courses", level: "graduate", category: "vocational", duration: "2 years" },
    { name: "MCA", level: "graduate", category: "computer", duration: "2 years" },
    { name: "LLM", level: "graduate", category: "law", duration: "2 years" },
    { name: "M.Des", level: "graduate", category: "design", duration: "2 years" },
    { name: "M.Pharm", level: "graduate", category: "pharmacy", duration: "2 years" },
    { name: "PG Medical", level: "graduate", category: "medical", duration: "3 years" },
    { name: "MSW", level: "graduate", category: "arts", duration: "2 years" },
    { name: "MMS", level: "graduate", category: "management", duration: "2 years" },
    { name: "MS", level: "graduate", category: "medical", duration: "3 years" },
    { name: "Master of Physiotherapy(MPT)", level: "graduate", category: "medical", duration: "2 years" },
    { name: "MDS", level: "graduate", category: "dental", duration: "3 years" },
    { name: "MHM", level: "graduate", category: "hotel-management", duration: "2 years" },
    { name: "MMC", level: "graduate", category: "mass-communication", duration: "2 years" },
    { name: "M.P.Ed", level: "graduate", category: "education", duration: "2 years" },
    { name: "MHA", level: "graduate", category: "management", duration: "2 years" },
    { name: "M.Ed", level: "graduate", category: "education", duration: "2 years" },
    { name: "M.Com", level: "graduate", category: "commerce", duration: "2 years" },
    { name: "MVSc", level: "graduate", category: "veterinary", duration: "2 years" },
    { name: "Master of Animation", level: "graduate", category: "animation", duration: "2 years" },
    { name: "M.Ch", level: "graduate", category: "medical", duration: "3 years" },
    { name: "M.Arch", level: "graduate", category: "architecture", duration: "2 years" },
    { name: "M.F.Sc", level: "graduate", category: "science", duration: "2 years" },
    { name: "MPH", level: "graduate", category: "medical", duration: "2 years" },
  ],
  // Doctorate Programs
  doctorate: [
    { name: "M.Phil/Ph.D in Paramedical", level: "doctorate", category: "paramedical", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Medicine", level: "doctorate", category: "medical", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Pharmacy", level: "doctorate", category: "pharmacy", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Science", level: "doctorate", category: "science", duration: "3-5 years" },
    { name: "MD", level: "doctorate", category: "medical", duration: "3 years" },
    { name: "Ph.D in Veterinary Science", level: "doctorate", category: "veterinary", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Mass Communication", level: "doctorate", category: "mass-communication", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Management", level: "doctorate", category: "management", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Law", level: "doctorate", category: "law", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Architecture", level: "doctorate", category: "architecture", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Arts", level: "doctorate", category: "arts", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Commerce", level: "doctorate", category: "commerce", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Computer Applications", level: "doctorate", category: "computer", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Dental", level: "doctorate", category: "dental", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Agriculture", level: "doctorate", category: "agriculture", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Design", level: "doctorate", category: "design", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Hotel Management", level: "doctorate", category: "hotel-management", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Engineering", level: "doctorate", category: "engineering", duration: "3-5 years" },
    { name: "M.Phil/Ph.D in Education", level: "doctorate", category: "education", duration: "3-5 years" },
    { name: "D.Litt", level: "doctorate", category: "arts", duration: "3-5 years" },
    { name: "Ph.D", level: "doctorate", category: "general", duration: "3-5 years" },
  ],
}

// Function to determine college category based on name and description
function getCollegeCategory(college: any): string[] {
  const name = (college.name || "").toLowerCase()
  const description = (college.description || "").toLowerCase()
  const category = (college.category || "").toLowerCase()
  const combined = `${name} ${description} ${category}`

  const categories: string[] = []

  // Engineering colleges
  if (
    combined.includes("iit") ||
    combined.includes("nit") ||
    combined.includes("engineering") ||
    combined.includes("technology") ||
    combined.includes("tech") ||
    category === "engineering"
  ) {
    categories.push("engineering")
  }

  // Management colleges
  if (
    combined.includes("iim") ||
    combined.includes("management") ||
    combined.includes("business") ||
    combined.includes("mba") ||
    category === "management"
  ) {
    categories.push("management")
  }

  // Medical colleges
  if (
    combined.includes("aiims") ||
    combined.includes("medical") ||
    combined.includes("mbbs") ||
    combined.includes("hospital") ||
    combined.includes("medicine") ||
    category === "medical"
  ) {
    categories.push("medical")
  }

  // Law colleges
  if (
    combined.includes("law") ||
    combined.includes("legal") ||
    category === "law"
  ) {
    categories.push("law")
  }

  // Design colleges
  if (
    combined.includes("design") ||
    combined.includes("art") ||
    category === "design"
  ) {
    categories.push("design")
  }

  // Pharmacy colleges
  if (
    combined.includes("pharmacy") ||
    combined.includes("pharm")
  ) {
    categories.push("pharmacy")
  }

  // If no specific category found, add general
  if (categories.length === 0) {
    categories.push("general")
  }

  return categories
}

// Function to generate slug from course name
function generateSlug(name: string, collegeSlug: string, index: number): string {
  const courseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50)
  return `${courseSlug}-${collegeSlug}-${index}`.substring(0, 255)
}

// Function to estimate fees based on course and level
function estimateFees(courseName: string, level: string, collegeCategory: string[]): number {
  const name = courseName.toLowerCase()
  let baseFee = 0

  // Base fees by level
  if (level === "undergraduate") {
    baseFee = 50000
  } else if (level === "graduate") {
    baseFee = 100000
  } else if (level === "doctorate") {
    baseFee = 50000
  }

  // Adjust based on course type
  if (name.includes("mba") || name.includes("pgdm")) {
    baseFee = 1000000 // 10 Lakhs
  } else if (name.includes("mbbs") || name.includes("bams") || name.includes("bds")) {
    baseFee = 500000 // 5 Lakhs
  } else if (name.includes("b.tech") || name.includes("be")) {
    baseFee = 200000 // 2 Lakhs
  } else if (name.includes("m.tech")) {
    baseFee = 300000 // 3 Lakhs
  } else if (name.includes("ph.d") || name.includes("m.phil")) {
    baseFee = 100000 // 1 Lakh
  } else if (name.includes("md")) {
    baseFee = 500000 // 5 Lakhs
  }

  // Adjust based on college category
  if (collegeCategory.includes("engineering") && name.includes("tech")) {
    baseFee = Math.max(baseFee, 200000)
  }
  if (collegeCategory.includes("management") && name.includes("mba")) {
    baseFee = Math.max(baseFee, 1000000)
  }
  if (collegeCategory.includes("medical") && (name.includes("mbbs") || name.includes("md"))) {
    baseFee = Math.max(baseFee, 500000)
  }

  return baseFee
}

async function seedComprehensiveCourses() {
  console.log("🌱 Starting Comprehensive Courses Seeding...")
  console.log("📋 Source: Based on comprehensive Indian college course structure\n")

  try {
    // Get all colleges
    const allColleges = await db.select().from(colleges)
    console.log(`📊 Found ${allColleges.length} colleges\n`)

    let totalCoursesAdded = 0
    let totalCoursesSkipped = 0

    for (const college of allColleges) {
      const collegeCategories = getCollegeCategory(college)
      console.log(`\n🏫 Processing: ${college.name}`)
      console.log(`   Categories: ${collegeCategories.join(", ")}`)

      const coursesToAdd: Array<{
        name: string
        level: string
        category: string
        duration: string
      }> = []

      // Add courses based on college category
      if (collegeCategories.includes("engineering")) {
        coursesToAdd.push(
          ...courseTemplates.bachelor.filter((c) => c.category === "engineering"),
          ...courseTemplates.masters.filter((c) => c.category === "engineering"),
          ...courseTemplates.doctorate.filter((c) => c.category === "science" || c.category === "general")
        )
      }

      if (collegeCategories.includes("management")) {
        coursesToAdd.push(
          ...courseTemplates.bachelor.filter((c) => c.category === "management"),
          ...courseTemplates.masters.filter((c) => c.category === "management")
        )
      }

      if (collegeCategories.includes("medical")) {
        coursesToAdd.push(
          ...courseTemplates.bachelor.filter((c) => c.category === "medical" || c.category === "paramedical"),
          ...courseTemplates.masters.filter((c) => c.category === "medical"),
          ...courseTemplates.doctorate.filter((c) => c.category === "medical")
        )
      }

      if (collegeCategories.includes("law")) {
        coursesToAdd.push(
          ...courseTemplates.bachelor.filter((c) => c.category === "law"),
          ...courseTemplates.masters.filter((c) => c.category === "law")
        )
      }

      if (collegeCategories.includes("design")) {
        coursesToAdd.push(
          ...courseTemplates.bachelor.filter((c) => c.category === "design"),
          ...courseTemplates.masters.filter((c) => c.category === "design")
        )
      }

      if (collegeCategories.includes("pharmacy")) {
        coursesToAdd.push(
          ...courseTemplates.bachelor.filter((c) => c.category === "pharmacy"),
          ...courseTemplates.masters.filter((c) => c.category === "pharmacy"),
          ...courseTemplates.doctorate.filter((c) => c.category === "pharmacy")
        )
      }

      // For general colleges, add a mix of common courses
      if (collegeCategories.includes("general") || coursesToAdd.length === 0) {
        const bba = courseTemplates.bachelor.find((c) => c.name === "BBA/BBM")
        const btech = courseTemplates.bachelor.find((c) => c.name === "BE/B.Tech")
        const mba = courseTemplates.masters.find((c) => c.name === "MBA/PGDM")
        const mtech = courseTemplates.masters.find((c) => c.name === "ME/M.Tech")
        
        if (bba) coursesToAdd.push(bba)
        if (btech) coursesToAdd.push(btech)
        if (mba) coursesToAdd.push(mba)
        if (mtech) coursesToAdd.push(mtech)
      }

      // Remove duplicates and filter out undefined values
      const uniqueCourses = Array.from(
        new Map(coursesToAdd.filter((c) => c !== undefined).map((c) => [c.name, c])).values()
      )

      let collegeCoursesAdded = 0

      for (let i = 0; i < uniqueCourses.length; i++) {
        const courseTemplate = uniqueCourses[i]
        const slug = generateSlug(courseTemplate.name, college.slug, i)

        try {
          // Check if course already exists
          const existingCourse = await db
            .select()
            .from(courses)
            .where(eq(courses.slug, slug))
            .limit(1)

          if (existingCourse.length > 0) {
            totalCoursesSkipped++
            continue
          }

          const fees = estimateFees(courseTemplate.name, courseTemplate.level, collegeCategories)

          await db.insert(courses).values({
            name: courseTemplate.name,
            slug: slug,
            collegeId: college.id,
            description: `${courseTemplate.name} program at ${college.name}`,
            duration: courseTemplate.duration,
            fees: fees,
            feesCurrency: "INR",
            level: courseTemplate.level,
            studyMode: "offline",
          })

          collegeCoursesAdded++
          totalCoursesAdded++
        } catch (error: any) {
          if (error?.code === "23505") {
            // Duplicate slug, skip
            totalCoursesSkipped++
          } else {
            console.error(`  ❌ Error adding course ${courseTemplate.name}:`, error.message)
          }
        }
      }

      if (collegeCoursesAdded > 0) {
        console.log(`   ✅ Added ${collegeCoursesAdded} courses`)
      } else {
        console.log(`   ⏭️  Skipped (courses already exist)`)
      }
    }

    console.log(`\n✨ Comprehensive Courses Seeding Completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Total courses added: ${totalCoursesAdded}`)
    console.log(`   - Total courses skipped: ${totalCoursesSkipped}`)
    console.log(`   - Total colleges processed: ${allColleges.length}`)
  } catch (error) {
    console.error("❌ Comprehensive Courses Seeding Failed:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedComprehensiveCourses()
    .then(() => {
      console.log("\n✅ Script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error)
      process.exit(1)
    })
}

export { seedComprehensiveCourses }

