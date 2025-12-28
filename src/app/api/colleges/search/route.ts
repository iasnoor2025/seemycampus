import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { ilike, or, and, eq, gte, lte, sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const state = searchParams.get("state") || ""
    const course = searchParams.get("course") || ""
    const feesMin = searchParams.get("feesMin") || ""
    const feesMax = searchParams.get("feesMax") || ""
    const entranceExam = searchParams.get("entranceExam") || ""
    const ownership = searchParams.get("ownership") || ""
    const academicAlliance = searchParams.get("academicAlliance")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const offset = (page - 1) * limit

    // Build conditions array
    const conditions = []

    // Search filter (name, location, city)
    if (search) {
      conditions.push(
        or(
          ilike(colleges.name, `%${search}%`),
          ilike(colleges.location, `%${search}%`),
          ilike(colleges.city, `%${search}%`),
          ilike(colleges.description, `%${search}%`)
        )!
      )
    }

    // Location filter
    if (location) {
      conditions.push(
        or(
          ilike(colleges.city, `%${location}%`),
          ilike(colleges.location, `%${location}%`)
        )!
      )
    }

    // State filter
    if (state) {
      conditions.push(eq(colleges.state, state))
    }

    // Ownership filter
    if (ownership) {
      conditions.push(eq(colleges.ownership, ownership))
    }

    // Academic Alliance filter
    if (academicAlliance === "true") {
      conditions.push(eq(colleges.isAcademicAlliance, true))
    } else if (academicAlliance === "false") {
      conditions.push(eq(colleges.isAcademicAlliance, false))
    }

    // Entrance exam filter (check if college has this exam in entranceExams array)
    if (entranceExam) {
      conditions.push(
        sql`${colleges.entranceExams}::text ILIKE ${`%${entranceExam}%`}`
      )
    }

    // Build query
    const baseQuery = db.select().from(colleges)
    const query = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery

    // Get colleges with pagination
    const collegesList = await query
      .limit(limit)
      .offset(offset)

    // Get total count with same filters
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(colleges)
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery
    }
    const totalResult = await countQuery
    const totalCount = totalResult[0]?.count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // If course filter is applied, we need to filter by courses
    let filteredColleges = collegesList
    if (course) {
      // Get colleges that have courses matching the course filter
      const collegesWithCourse = await db
        .select({ collegeId: courses.collegeId })
        .from(courses)
        .where(ilike(courses.name, `%${course}%`))

      const collegeIds = new Set(collegesWithCourse.map((c) => c.collegeId))
      filteredColleges = collegesList.filter((c) => collegeIds.has(c.id))
    }

    // Fees filter (if course filter was applied, we need to check course fees)
    if ((feesMin || feesMax) && course) {
      const feesConditions = []
      if (feesMin) {
        feesConditions.push(gte(courses.fees, parseInt(feesMin)))
      }
      if (feesMax) {
        feesConditions.push(lte(courses.fees, parseInt(feesMax)))
      }

      if (feesConditions.length > 0) {
        const collegesWithFees = await db
          .select({ collegeId: courses.collegeId })
          .from(courses)
          .where(and(...feesConditions))

        const collegeIds = new Set(collegesWithFees.map((c) => c.collegeId))
        filteredColleges = filteredColleges.filter((c) => collegeIds.has(c.id))
      }
    }

    return NextResponse.json({
      colleges: filteredColleges,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: filteredColleges.length,
        limit,
      },
    })
  } catch (error) {
    console.error("Error searching colleges:", error)
    return NextResponse.json(
      { error: "Failed to search colleges" },
      { status: 500 }
    )
  }
}

