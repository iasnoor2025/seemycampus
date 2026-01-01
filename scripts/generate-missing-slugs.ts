import { config } from "dotenv"
import { resolve } from "path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../src/db/schema"
import { 
  colleges, 
  courses, 
  categories, 
  studyGoals, 
  scholarships, 
  entranceExams, 
  blogPosts 
} from "../src/db/schema"
import { eq, or, isNull, sql } from "drizzle-orm"

// Load environment variables from .env file FIRST
config({ path: resolve(process.cwd(), ".env") })

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set")
  console.error("\nPlease set DATABASE_URL in your .env file")
  console.error("Example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname")
  process.exit(1)
}

// Create database connection
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 255)
}

/**
 * Generate a unique slug by appending a number if needed
 */
async function generateUniqueSlug(
  baseSlug: string,
  table: any,
  id: number,
  existingSlugs: Set<string>
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  // If slug is empty, use ID as fallback
  if (!slug || slug.trim() === "") {
    slug = `item-${id}`
  }

  // Ensure slug is valid
  slug = generateSlug(slug)

  // If still empty after processing, use ID
  if (!slug || slug.trim() === "") {
    slug = `item-${id}`
  }

  // Check uniqueness and append number if needed
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`
    slug = generateSlug(slug)
    counter++
    
    // Prevent infinite loop
    if (counter > 1000) {
      slug = `item-${id}-${Date.now()}`
      break
    }
  }

  existingSlugs.add(slug)
  return slug
}

/**
 * Fix missing slugs for colleges
 */
async function fixCollegeSlugs() {
  console.log("\n🔧 Fixing college slugs...")
  
  try {
    const allColleges = await db.select().from(colleges)
    const existingSlugs = new Set<string>()
    
    // First pass: collect existing valid slugs
    allColleges.forEach(college => {
      if (college.slug && college.slug.trim() !== "") {
        existingSlugs.add(college.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const college of allColleges) {
      if (college.slug && college.slug.trim() !== "") {
        skipped++
        continue
      }

      const newSlug = await generateUniqueSlug(
        college.name || `college-${college.id}`,
        colleges,
        college.id,
        existingSlugs
      )

      try {
        await db
          .update(colleges)
          .set({ slug: newSlug })
          .where(eq(colleges.id, college.id))
        
        fixed++
        console.log(`  ✅ Fixed college ${college.id}: "${college.name}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing college ${college.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing college slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Fix missing slugs for courses
 */
async function fixCourseSlugs() {
  console.log("\n🔧 Fixing course slugs...")
  
  try {
    const allCourses = await db.select().from(courses)
    const existingSlugs = new Set<string>()
    
    // First pass: collect existing valid slugs
    allCourses.forEach(course => {
      if (course.slug && course.slug.trim() !== "") {
        existingSlugs.add(course.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const course of allCourses) {
      if (course.slug && course.slug.trim() !== "") {
        skipped++
        continue
      }

      // Get college name for better slug
      const [college] = await db
        .select()
        .from(colleges)
        .where(eq(colleges.id, course.collegeId))
        .limit(1)

      const baseName = course.name || `course-${course.id}`
      const collegeSlug = college?.slug || `college-${course.collegeId}`
      const slugBase = `${baseName}-${collegeSlug}`

      const newSlug = await generateUniqueSlug(
        slugBase,
        courses,
        course.id,
        existingSlugs
      )

      try {
        await db
          .update(courses)
          .set({ slug: newSlug })
          .where(eq(courses.id, course.id))
        
        fixed++
        console.log(`  ✅ Fixed course ${course.id}: "${course.name}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing course ${course.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing course slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Fix missing slugs for categories
 */
async function fixCategorySlugs() {
  console.log("\n🔧 Fixing category slugs...")
  
  try {
    const allCategories = await db.select().from(categories)
    const existingSlugs = new Set<string>()
    
    allCategories.forEach(category => {
      if (category.slug && category.slug.trim() !== "") {
        existingSlugs.add(category.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const category of allCategories) {
      if (category.slug && category.slug.trim() !== "") {
        skipped++
        continue
      }

      const newSlug = await generateUniqueSlug(
        category.name || `category-${category.id}`,
        categories,
        category.id,
        existingSlugs
      )

      try {
        await db
          .update(categories)
          .set({ slug: newSlug })
          .where(eq(categories.id, category.id))
        
        fixed++
        console.log(`  ✅ Fixed category ${category.id}: "${category.name}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing category ${category.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing category slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Fix missing slugs for study goals
 */
async function fixStudyGoalSlugs() {
  console.log("\n🔧 Fixing study goal slugs...")
  
  try {
    const allStudyGoals = await db.select().from(studyGoals)
    const existingSlugs = new Set<string>()
    
    allStudyGoals.forEach(goal => {
      if (goal.slug && goal.slug.trim() !== "") {
        existingSlugs.add(goal.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const goal of allStudyGoals) {
      if (goal.slug && goal.slug.trim() !== "") {
        skipped++
        continue
      }

      const newSlug = await generateUniqueSlug(
        goal.name || `study-goal-${goal.id}`,
        studyGoals,
        goal.id,
        existingSlugs
      )

      try {
        await db
          .update(studyGoals)
          .set({ slug: newSlug })
          .where(eq(studyGoals.id, goal.id))
        
        fixed++
        console.log(`  ✅ Fixed study goal ${goal.id}: "${goal.name}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing study goal ${goal.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing study goal slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Fix missing slugs for scholarships
 */
async function fixScholarshipSlugs() {
  console.log("\n🔧 Fixing scholarship slugs...")
  
  try {
    const allScholarships = await db.select().from(scholarships)
    const existingSlugs = new Set<string>()
    
    allScholarships.forEach(scholarship => {
      if (scholarship.slug && scholarship.slug.trim() !== "") {
        existingSlugs.add(scholarship.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const scholarship of allScholarships) {
      if (scholarship.slug && scholarship.slug.trim() !== "") {
        skipped++
        continue
      }

      const newSlug = await generateUniqueSlug(
        scholarship.title || `scholarship-${scholarship.id}`,
        scholarships,
        scholarship.id,
        existingSlugs
      )

      try {
        await db
          .update(scholarships)
          .set({ slug: newSlug })
          .where(eq(scholarships.id, scholarship.id))
        
        fixed++
        console.log(`  ✅ Fixed scholarship ${scholarship.id}: "${scholarship.title}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing scholarship ${scholarship.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing scholarship slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Fix missing slugs for entrance exams
 */
async function fixEntranceExamSlugs() {
  console.log("\n🔧 Fixing entrance exam slugs...")
  
  try {
    const allExams = await db.select().from(entranceExams)
    const existingSlugs = new Set<string>()
    
    allExams.forEach(exam => {
      if (exam.slug && exam.slug.trim() !== "") {
        existingSlugs.add(exam.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const exam of allExams) {
      if (exam.slug && exam.slug.trim() !== "") {
        skipped++
        continue
      }

      const newSlug = await generateUniqueSlug(
        exam.name || `exam-${exam.id}`,
        entranceExams,
        exam.id,
        existingSlugs
      )

      try {
        await db
          .update(entranceExams)
          .set({ slug: newSlug })
          .where(eq(entranceExams.id, exam.id))
        
        fixed++
        console.log(`  ✅ Fixed exam ${exam.id}: "${exam.name}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing exam ${exam.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing entrance exam slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Fix missing slugs for blog posts
 */
async function fixBlogPostSlugs() {
  console.log("\n🔧 Fixing blog post slugs...")
  
  try {
    const allPosts = await db.select().from(blogPosts)
    const existingSlugs = new Set<string>()
    
    allPosts.forEach(post => {
      if (post.slug && post.slug.trim() !== "") {
        existingSlugs.add(post.slug)
      }
    })

    let fixed = 0
    let skipped = 0

    for (const post of allPosts) {
      if (post.slug && post.slug.trim() !== "") {
        skipped++
        continue
      }

      const newSlug = await generateUniqueSlug(
        post.title || `blog-post-${post.id}`,
        blogPosts,
        post.id,
        existingSlugs
      )

      try {
        await db
          .update(blogPosts)
          .set({ slug: newSlug })
          .where(eq(blogPosts.id, post.id))
        
        fixed++
        console.log(`  ✅ Fixed blog post ${post.id}: "${post.title}" -> "${newSlug}"`)
      } catch (error: any) {
        console.error(`  ❌ Error fixing blog post ${post.id}:`, error.message)
      }
    }

    console.log(`   📊 Fixed: ${fixed}, Skipped: ${skipped}`)
    return { fixed, skipped }
  } catch (error) {
    console.error("❌ Error fixing blog post slugs:", error)
    return { fixed: 0, skipped: 0 }
  }
}

/**
 * Main function to fix all missing slugs
 */
async function main() {
  console.log("🚀 Starting slug generation for all entities...\n")

  const results = {
    colleges: await fixCollegeSlugs(),
    courses: await fixCourseSlugs(),
    categories: await fixCategorySlugs(),
    studyGoals: await fixStudyGoalSlugs(),
    scholarships: await fixScholarshipSlugs(),
    entranceExams: await fixEntranceExamSlugs(),
    blogPosts: await fixBlogPostSlugs(),
  }

  console.log("\n✨ Slug generation completed!")
  console.log("📊 Summary:")
  Object.entries(results).forEach(([entity, stats]) => {
    console.log(`   ${entity}: ${stats.fixed} fixed, ${stats.skipped} skipped`)
  })

  const totalFixed = Object.values(results).reduce((sum, stats) => sum + stats.fixed, 0)
  const totalSkipped = Object.values(results).reduce((sum, stats) => sum + stats.skipped, 0)

  console.log(`\n📈 Total: ${totalFixed} slugs generated, ${totalSkipped} already had slugs`)
  console.log("\n✅ All entities now have valid slugs!")
}

// Run the script
main()
  .then(async () => {
    console.log("\n🎉 Script completed successfully!")
    await client.end()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error("\n❌ Script failed:", error)
    await client.end()
    process.exit(1)
  })

