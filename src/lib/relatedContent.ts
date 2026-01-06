import { db } from "@/db"
import { colleges, courses, scholarships, entranceExams } from "@/db/schema"
import { eq, and, ne, or, ilike, sql } from "drizzle-orm"

/**
 * Get related colleges based on location, city, ranking, or similar characteristics
 */
export async function getRelatedColleges(
  currentCollegeId: number,
  location?: string | null,
  city?: string | null,
  limit: number = 8
) {
  const conditions = [ne(colleges.id, currentCollegeId)]
  
  // Prioritize location-based matches
  if (city) {
    conditions.push(eq(colleges.city, city))
  } else if (location) {
    conditions.push(eq(colleges.location, location))
  }

  // Get location-based colleges first, then similar ranked colleges (only enabled ones)
  const locationColleges = await db
    .select({
      id: colleges.id,
      name: colleges.name,
      slug: colleges.slug,
      location: colleges.location,
      city: colleges.city,
      ranking: colleges.ranking,
    })
    .from(colleges)
    .where(and(
      eq(colleges.isEnabled, true),
      ...conditions
    ))
    .orderBy(sql`${colleges.ranking} ASC NULLS LAST`)
    .limit(limit)
  
  // If we don't have enough location-based colleges, add similar ranked ones
  if (locationColleges.length < limit) {
    const remaining = limit - locationColleges.length
    const locationCollegeIds = locationColleges.map(c => c.id)
    
    if (locationCollegeIds.length > 0) {
      const similarColleges = await db
        .select({
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
          location: colleges.location,
          city: colleges.city,
          ranking: colleges.ranking,
        })
        .from(colleges)
        .where(
          and(
            eq(colleges.isEnabled, true),
            ne(colleges.id, currentCollegeId),
            sql`${colleges.id} NOT IN (${sql.join(locationCollegeIds.map(id => sql`${id}`), sql`, `)})`
          )
        )
        .orderBy(sql`${colleges.ranking} ASC NULLS LAST`)
        .limit(remaining)
      
      return [...locationColleges, ...similarColleges].slice(0, limit)
    } else {
      // If no location colleges, get similar ranked colleges (only enabled ones)
      const similarColleges = await db
        .select({
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
          location: colleges.location,
          city: colleges.city,
          ranking: colleges.ranking,
        })
        .from(colleges)
        .where(
          and(
            eq(colleges.isEnabled, true),
            ne(colleges.id, currentCollegeId)
          )
        )
        .orderBy(sql`${colleges.ranking} ASC NULLS LAST`)
        .limit(limit)
      
      return similarColleges
    }
  }
  
  return locationColleges
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

