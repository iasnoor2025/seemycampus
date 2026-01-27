import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { colleges, courses, collegeReviews, placementStats, collegeRankings } from "@/db/schema"
import { ilike, or, and, eq, gte, lte, sql, desc, asc, inArray } from "drizzle-orm"
import { searchCache, generateCacheKey } from "@/lib/search/cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check cache first
    const cacheParams: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      cacheParams[key] = value
    })
    const cacheKey = generateCacheKey(cacheParams)
    const cachedResult = searchCache.get<any>(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

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
    // New filter parameters
    const placementPackageMin = searchParams.get("placementPackageMin") || ""
    const placementPackageMax = searchParams.get("placementPackageMax") || ""
    const placementPercentageMin = searchParams.get("placementPercentageMin") || ""
    const rankingMin = searchParams.get("rankingMin") || ""
    const rankingMax = searchParams.get("rankingMax") || ""
    const rankingSource = searchParams.get("rankingSource") || ""
    const rankingCategory = searchParams.get("rankingCategory") || ""
    const accreditation = searchParams.get("accreditation") || ""
    const campusSizeMin = searchParams.get("campusSizeMin") || ""
    const totalStudentsMin = searchParams.get("totalStudentsMin") || ""
    const establishedYearMin = searchParams.get("establishedYearMin") || ""
    const establishedYearMax = searchParams.get("establishedYearMax") || ""
    const sortBy = searchParams.get("sortBy") || "relevance" // relevance, rating, fees, ranking
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const offset = (page - 1) * limit

    // Build conditions array
    const conditions = []

    // Always filter out disabled colleges for public-facing API
    conditions.push(eq(colleges.isEnabled, true))

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

    // Accreditation filter
    if (accreditation) {
      conditions.push(ilike(colleges.accreditation, `%${accreditation}%`))
    }

    // Campus size filter
    if (campusSizeMin) {
      // Extract numeric value from campus size string (e.g., "50 acres" -> 50)
      conditions.push(
        sql`CAST(REGEXP_REPLACE(${colleges.campusSize}, '[^0-9]', '', 'g') AS INTEGER) >= ${parseInt(campusSizeMin)}`
      )
    }

    // Total students filter
    if (totalStudentsMin) {
      conditions.push(gte(colleges.totalStudents, parseInt(totalStudentsMin)))
    }

    // Established year filters
    if (establishedYearMin) {
      conditions.push(gte(colleges.establishedYear, parseInt(establishedYearMin)))
    }
    if (establishedYearMax) {
      conditions.push(lte(colleges.establishedYear, parseInt(establishedYearMax)))
    }

    // Build base query with ranking calculation for search relevance
    let baseQuery = db.select({
      id: colleges.id,
      name: colleges.name,
      slug: colleges.slug,
      location: colleges.location,
      city: colleges.city,
      state: colleges.state,
      country: colleges.country,
      description: colleges.description,
      images: colleges.images,
      brochureUrl: colleges.brochureUrl,
      website: colleges.website,
      email: colleges.email,
      phone: colleges.phone,
      isAcademicAlliance: colleges.isAcademicAlliance,
      ranking: colleges.ranking,
      establishedYear: colleges.establishedYear,
      accreditation: colleges.accreditation,
      hostelFees: colleges.hostelFees,
      hostelFeesCurrency: colleges.hostelFeesCurrency,
      averagePackage: colleges.averagePackage,
      highestPackage: colleges.highestPackage,
      placementCurrency: colleges.placementCurrency,
      entranceExams: colleges.entranceExams,
      ownership: colleges.ownership,
      campusSize: colleges.campusSize,
      totalStudents: colleges.totalStudents,
      googlePlaceId: colleges.googlePlaceId,
      placementData: colleges.placementData,
      rankingData: colleges.rankingData,
      createdAt: colleges.createdAt,
      updatedAt: colleges.updatedAt,
      // Calculate relevance score for search
      relevanceScore: search
        ? sql<number>`
          CASE
            WHEN ${colleges.name} ILIKE ${`${search}%`} THEN 100
            WHEN ${colleges.name} ILIKE ${`%${search}%`} THEN 50
            WHEN ${colleges.location} ILIKE ${`%${search}%`} THEN 30
            WHEN ${colleges.city} ILIKE ${`%${search}%`} THEN 30
            WHEN ${colleges.description} ILIKE ${`%${search}%`} THEN 10
            ELSE 0
          END
        `
        : sql<number>`0`,
    }).from(colleges)

    // Apply conditions
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery
    }

    // Get colleges with pagination (before course/fee filtering for accurate count)
    let collegesList = await baseQuery

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


    // Placement filters
    if (placementPackageMin || placementPackageMax || placementPercentageMin) {
      const placementConditions = []
      if (placementPackageMin) {
        placementConditions.push(gte(placementStats.averagePackage, parseInt(placementPackageMin)))
      }
      if (placementPackageMax) {
        placementConditions.push(lte(placementStats.averagePackage, parseInt(placementPackageMax)))
      }
      if (placementPercentageMin) {
        placementConditions.push(gte(placementStats.placementPercentage, parseInt(placementPercentageMin)))
      }

      if (placementConditions.length > 0) {
        const collegesWithPlacements = await db
          .selectDistinct({ collegeId: placementStats.collegeId })
          .from(placementStats)
          .where(and(...placementConditions))

        const collegeIds = new Set(collegesWithPlacements.map((c) => c.collegeId))
        filteredColleges = filteredColleges.filter((c) => collegeIds.has(c.id))
      }
    }

    // Ranking filters
    if (rankingMin || rankingMax || rankingSource || rankingCategory) {
      const rankingConditions = []
      if (rankingSource) {
        rankingConditions.push(eq(collegeRankings.rankingSource, rankingSource))
      }
      if (rankingCategory) {
        rankingConditions.push(eq(collegeRankings.category, rankingCategory))
      }
      if (rankingMin) {
        rankingConditions.push(gte(collegeRankings.rank, parseInt(rankingMin)))
      }
      if (rankingMax) {
        rankingConditions.push(lte(collegeRankings.rank, parseInt(rankingMax)))
      }

      if (rankingConditions.length > 0) {
        const collegesWithRankings = await db
          .selectDistinct({ collegeId: collegeRankings.collegeId })
          .from(collegeRankings)
          .where(and(...rankingConditions))

        const collegeIds = new Set(collegesWithRankings.map((c) => c.collegeId))
        filteredColleges = filteredColleges.filter((c) => collegeIds.has(c.id))
      }
    }

    // Get average ratings for colleges (for sorting by rating)
    const collegeIds = filteredColleges.map((c) => c.id)
    let ratingsMap: Record<number, number> = {}

    if (collegeIds.length > 0 && sortBy === "rating") {
      const ratings = await db
        .select({
          collegeId: collegeReviews.collegeId,
          avgRating: sql<number>`COALESCE(AVG(${collegeReviews.rating}::numeric), 0)`,
        })
        .from(collegeReviews)
        .where(
          and(
            inArray(collegeReviews.collegeId, collegeIds),
            eq(collegeReviews.isApproved, true)
          )
        )
        .groupBy(collegeReviews.collegeId)

      ratings.forEach((r) => {
        ratingsMap[r.collegeId] = Number(r.avgRating)
      })
    }

    // Sort colleges based on sortBy parameter
    filteredColleges.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          const ratingA = ratingsMap[a.id] || 0
          const ratingB = ratingsMap[b.id] || 0
          return ratingB - ratingA
        case "fees":
          // Sort by average package (descending - higher packages first)
          const feesA = a.averagePackage || 0
          const feesB = b.averagePackage || 0
          return feesB - feesA
        case "ranking":
          // Sort by ranking (ascending - lower rank number is better)
          const rankA = a.ranking || 999999
          const rankB = b.ranking || 999999
          return rankA - rankB
        case "relevance":
        default:
          // Sort by relevance score (if search query exists) or by name
          if (search) {
            const scoreA = (a as any).relevanceScore || 0
            const scoreB = (b as any).relevanceScore || 0
            if (scoreA !== scoreB) {
              return scoreB - scoreA
            }
          }
          // Secondary sort by name
          return a.name.localeCompare(b.name)
      }
    })

    // Apply pagination after sorting
    const paginatedColleges = filteredColleges.slice(offset, offset + limit)
    // Calculate total count and pages from filtered results
    const finalTotalCount = filteredColleges.length
    const finalTotalPages = Math.ceil(finalTotalCount / limit)

    const response = {
      colleges: paginatedColleges,
      pagination: {
        currentPage: page,
        totalPages: finalTotalPages,
        totalCount: finalTotalCount,
        limit,
      },
    }

    // Cache the result (shorter TTL for search results - 2 minutes)
    searchCache.set(cacheKey, response, 2 * 60 * 1000)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error searching colleges:", error)
    return NextResponse.json(
      { error: "Failed to search colleges" },
      { status: 500 }
    )
  }
}

