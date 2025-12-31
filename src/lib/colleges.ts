import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { eq, and, or, ilike, sql } from "drizzle-orm"

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

export async function getCollegesByCity(city: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit
  
  const conditions = [
    or(
      ilike(colleges.city, `%${city}%`),
      ilike(colleges.location, `%${city}%`)
    )!
  ]
  
  const collegesList = await db
    .select()
    .from(colleges)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
  
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(colleges)
    .where(and(...conditions))
  
  const totalCount = totalCountResult[0]?.count || 0
  const totalPages = Math.ceil(totalCount / limit)
  
  return {
    colleges: collegesList,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: Number(totalCount),
      limit,
    },
  }
}

export async function getAllCities(): Promise<string[]> {
  const cities = await db
    .selectDistinct({ city: colleges.city })
    .from(colleges)
    .where(sql`${colleges.city} IS NOT NULL AND ${colleges.city} != ''`)
  
  return cities.map(c => c.city).filter(Boolean) as string[]
}

export async function getCityStats(city: string) {
  const cityColleges = await db
    .select()
    .from(colleges)
    .where(
      or(
        ilike(colleges.city, `%${city}%`),
        ilike(colleges.location, `%${city}%`)
      )!
    )
  
  const stats = {
    totalColleges: cityColleges.length,
    privateColleges: cityColleges.filter(c => c.ownership === 'Private').length,
    governmentColleges: cityColleges.filter(c => c.ownership === 'Government' || c.ownership === 'Public').length,
    averageRanking: cityColleges.filter(c => c.ranking).length > 0
      ? Math.round(cityColleges.filter(c => c.ranking).reduce((sum, c) => sum + (c.ranking || 0), 0) / cityColleges.filter(c => c.ranking).length)
      : null,
    topColleges: cityColleges
      .filter(c => c.ranking)
      .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
      .slice(0, 5)
      .map(c => ({ name: c.name, slug: c.slug, ranking: c.ranking })),
  }
  
  return stats
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

export async function getCategoryStats(categoryName: string) {
  // Get all colleges (for now - will filter by category when category field is added)
  const allColleges = await db.select().from(colleges)
  
  // Calculate statistics
  const stats = {
    totalColleges: allColleges.length,
    privateColleges: allColleges.filter(c => c.ownership === 'Private').length,
    governmentColleges: allColleges.filter(c => c.ownership === 'Government' || c.ownership === 'Public').length,
    averageRanking: allColleges.filter(c => c.ranking).length > 0
      ? Math.round(allColleges.filter(c => c.ranking).reduce((sum, c) => sum + (c.ranking || 0), 0) / allColleges.filter(c => c.ranking).length)
      : null,
    topColleges: allColleges
      .filter(c => c.ranking)
      .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
      .slice(0, 10)
      .map(c => ({ name: c.name, slug: c.slug, ranking: c.ranking, location: c.location || c.city })),
    averagePackage: allColleges.filter(c => c.averagePackage).length > 0
      ? Math.round(allColleges.filter(c => c.averagePackage).reduce((sum, c) => sum + (c.averagePackage || 0), 0) / allColleges.filter(c => c.averagePackage).length)
      : null,
    highestPackage: allColleges.filter(c => c.highestPackage).length > 0
      ? Math.max(...allColleges.filter(c => c.highestPackage).map(c => c.highestPackage || 0))
      : null,
  }
  
  return stats
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

