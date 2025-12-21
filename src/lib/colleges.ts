import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function getAllColleges() {
  return await db.select().from(colleges)
}

export async function getCollegeBySlug(slug: string) {
  const [college] = await db
    .select()
    .from(colleges)
    .where(eq(colleges.slug, slug))
    .limit(1)

  return college || null
}

export async function getCollegeWithCourses(slug: string) {
  const college = await getCollegeBySlug(slug)
  if (!college) return null

  const collegeCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.collegeId, college.id))

  return {
    ...college,
    courses: collegeCourses,
  }
}

export async function getCollegesByLocation(location: string) {
  return await db
    .select()
    .from(colleges)
    .where(eq(colleges.location, location))
}

export async function getCollegesByCategory(category: string) {
  // For now, return all colleges. In the future, add category field to schema
  // This is a placeholder that can be enhanced when category field is added
  return await db.select().from(colleges)
}

export async function getCollegesByCategoryPaginated(category: string, page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit
  
  // For now, return all colleges with pagination. In the future, filter by category
  const collegesList = await db
    .select()
    .from(colleges)
    .limit(limit)
    .offset(offset)
  
  const totalCount = await db.select().from(colleges)
  const totalPages = Math.ceil(totalCount.length / limit)
  
  return {
    colleges: collegesList,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: totalCount.length,
      limit,
    },
  }
}

export async function getCollegesByCategoryAndSubcategory(category: string, subcategory: string) {
  // For now, return all colleges. In the future, add category/subcategory fields to schema
  // This is a placeholder that can be enhanced when category/subcategory fields are added
  return await db.select().from(colleges)
}

export async function getCollegesByCategoryAndSubcategoryPaginated(
  category: string,
  subcategory: string,
  page: number = 1,
  limit: number = 10
) {
  const offset = (page - 1) * limit
  
  // For now, return all colleges with pagination. In the future, filter by category/subcategory
  const collegesList = await db
    .select()
    .from(colleges)
    .limit(limit)
    .offset(offset)
  
  const totalCount = await db.select().from(colleges)
  const totalPages = Math.ceil(totalCount.length / limit)
  
  return {
    colleges: collegesList,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: totalCount.length,
      limit,
    },
  }
}

export async function getCollegesPaginated(page: number = 1, limit: number = 10, academicAllianceOnly: boolean = false) {
  const offset = (page - 1) * limit
  
  // Build query with optional Academic Alliance filter
  let query = db.select().from(colleges)
  
  if (academicAllianceOnly) {
    query = query.where(eq(colleges.isAcademicAlliance, true)) as typeof query
  }
  
  const collegesList = await query.limit(limit).offset(offset)
  
  // Get total count with same filter
  let countQuery = db.select().from(colleges)
  if (academicAllianceOnly) {
    countQuery = countQuery.where(eq(colleges.isAcademicAlliance, true)) as typeof countQuery
  }
  const totalCount = await countQuery
  const totalPages = Math.ceil(totalCount.length / limit)
  
  return {
    colleges: collegesList,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: totalCount.length,
      limit,
    },
  }
}

export async function getAcademicAllianceColleges() {
  return await db
    .select()
    .from(colleges)
    .where(eq(colleges.isAcademicAlliance, true))
}

