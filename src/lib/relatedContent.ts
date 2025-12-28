import { db } from "@/db"
import { colleges, courses, scholarships, entranceExams } from "@/db/schema"
import { eq, and, ne, or, ilike, sql } from "drizzle-orm"

/**
 * Get related colleges based on location, city, or similar characteristics
 */
export async function getRelatedColleges(
  currentCollegeId: number,
  location?: string | null,
  city?: string | null,
  limit: number = 5
) {
  const conditions = [ne(colleges.id, currentCollegeId)]
  
  if (city) {
    conditions.push(eq(colleges.city, city))
  } else if (location) {
    conditions.push(eq(colleges.location, location))
  }

  return await db
    .select({
      id: colleges.id,
      name: colleges.name,
      slug: colleges.slug,
      location: colleges.location,
      city: colleges.city,
    })
    .from(colleges)
    .where(and(...conditions))
    .limit(limit)
}

/**
 * Get related courses for a college
 */
export async function getRelatedCourses(collegeId: number, limit: number = 5) {
  return await db
    .select({
      id: courses.id,
      name: courses.name,
      slug: courses.slug,
      level: courses.level,
    })
    .from(courses)
    .where(eq(courses.collegeId, collegeId))
    .limit(limit)
}

/**
 * Get scholarships related to a college or location
 */
export async function getRelatedScholarships(
  collegeId?: number | null,
  limit: number = 5
) {
  const conditions: any[] = []
  
  if (collegeId) {
    conditions.push(eq(scholarships.collegeId, collegeId))
  }

  const query = db
    .select({
      id: scholarships.id,
      title: scholarships.title,
      slug: scholarships.slug,
      amount: scholarships.amount,
    })
    .from(scholarships)

  if (conditions.length > 0) {
    return await query.where(and(...conditions)).limit(limit)
  }

  return await query.limit(limit)
}

/**
 * Get entrance exams based on exam names (from college entranceExams array)
 */
export async function getRelatedExams(examNames: string[] | null, limit: number = 5) {
  if (!examNames || examNames.length === 0) {
    return []
  }

  // Map common exam names to slugs
  const examSlugMap: Record<string, string> = {
    "CAT": "cat",
    "JEE Main": "jee-main",
    "JEE Advanced": "jee-advanced",
    "NEET": "neet",
    "CLAT": "clat",
    "MAT": "mat",
    "XAT": "xat",
    "GATE": "gate",
    "GMAT": "gmat",
  }

  const slugs = examNames
    .map(name => examSlugMap[name] || name.toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)

  if (slugs.length === 0) return []

  // Build OR condition for slugs
  const slugConditions = slugs.map(slug => ilike(entranceExams.slug, slug))
  
  return await db
    .select({
      id: entranceExams.id,
      name: entranceExams.name,
      slug: entranceExams.slug,
    })
    .from(entranceExams)
    .where(or(...slugConditions))
    .limit(limit)
}

