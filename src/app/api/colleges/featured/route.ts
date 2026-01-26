import { NextResponse } from "next/server"
import { getAllColleges } from "@/lib/colleges"
import { db } from "@/db"
import { courses, featuredColleges, colleges } from "@/db/schema"
import { eq, or, ilike, and, desc, asc } from "drizzle-orm"

// Helper function to determine college category from name and description
function getCollegeCategory(college: { name: string; description?: string | null }): string[] {
  const name = (college.name || "").toLowerCase()
  const description = (college.description || "").toLowerCase()
  const combined = `${name} ${description}`

  const categories: string[] = []

  // Management/BBA colleges
  if (
    combined.includes("iim") ||
    combined.includes("management") ||
    combined.includes("business") ||
    combined.includes("mba") ||
    combined.includes("pgdm") ||
    combined.includes("bba") ||
    name.includes("business school")
  ) {
    if (combined.includes("bba") || name.includes("bba")) {
      categories.push("bba")
    } else {
      categories.push("management")
    }
  }

  // Engineering colleges
  if (
    combined.includes("iit") ||
    combined.includes("nit") ||
    combined.includes("engineering") ||
    combined.includes("technology") ||
    combined.includes("tech") ||
    name.includes("institute of technology")
  ) {
    categories.push("engineering")
  }

  // Medical colleges
  if (
    combined.includes("aiims") ||
    combined.includes("medical") ||
    combined.includes("mbbs") ||
    combined.includes("hospital") ||
    combined.includes("medicine") ||
    name.includes("medical college") ||
    name.includes("medical university")
  ) {
    categories.push("medical")
  }

  // Law colleges
  if (
    combined.includes("law") ||
    combined.includes("legal") ||
    combined.includes("nlu") ||
    combined.includes("nlsiu") ||
    combined.includes("nalsar") ||
    name.includes("law school") ||
    name.includes("law university")
  ) {
    categories.push("law")
  }

  // Design colleges
  if (
    combined.includes("design") ||
    combined.includes("nid") ||
    combined.includes("nift") ||
    combined.includes("fashion") ||
    name.includes("institute of design") ||
    name.includes("design school")
  ) {
    categories.push("design")
  }

  return categories
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "management"
    const includeInactive = searchParams.get("includeInactive") === "true"
    const collegeId = searchParams.get("collegeId")

    // Get featured colleges from database with proper joins
    const featuredData = await db
      .select({
        id: featuredColleges.id,
        collegeId: featuredColleges.collegeId,
        category: featuredColleges.category,
        displayOrder: featuredColleges.displayOrder,
        isActive: featuredColleges.isActive,
        featuredAt: featuredColleges.featuredAt,
        expiresAt: featuredColleges.expiresAt,
        college: {
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
          location: colleges.location,
          city: colleges.city,
          state: colleges.state,
          description: colleges.description,
          images: colleges.images,
          ranking: colleges.ranking,
          averagePackage: colleges.averagePackage,
          highestPackage: colleges.highestPackage,
          placementCurrency: colleges.placementCurrency,
          isEnabled: colleges.isEnabled,
        }
      })
      .from(featuredColleges)
      .leftJoin(colleges, eq(featuredColleges.collegeId, colleges.id))
      .where(
        and(
          collegeId ? eq(featuredColleges.collegeId, parseInt(collegeId)) : eq(featuredColleges.category, category),
          includeInactive ? undefined : eq(featuredColleges.isActive, true),
          includeInactive ? undefined : eq(colleges.isEnabled, true)
        )
      )
      .orderBy(asc(featuredColleges.displayOrder), desc(featuredColleges.featuredAt))

    // If we are filtering by collegeId, return the results directly
    if (collegeId) {
      const transformedFeatured = featuredData.map(item => ({
        id: item.id,
        collegeId: item.collegeId,
        category: item.category,
        displayOrder: item.displayOrder,
        isActive: item.isActive,
        featuredAt: item.featuredAt,
        expiresAt: item.expiresAt,
      }))

      return NextResponse.json({
        colleges: transformedFeatured,
        count: transformedFeatured.length,
        isFromFeatured: true,
      })
    }

    // If no featured colleges found or fallback is enabled, get all colleges
    if (featuredData.length === 0) {
      const allColleges = await getAllColleges()

      // For BBA category, get colleges that have BBA courses
      let bbaCollegeIds: Set<number> = new Set()
      if (category === "bba") {
        const bbaCourses = await db
          .selectDistinct({ collegeId: courses.collegeId })
          .from(courses)
          .where(
            or(
              ilike(courses.name, "%bba%"),
              ilike(courses.name, "%bbm%")
            )!
          )

        bbaCollegeIds = new Set(bbaCourses.map(c => c.collegeId))
      }

      // Filter colleges by category
      const filteredColleges = allColleges
        .map((college) => {
          const categories = getCollegeCategory(college)
          return {
            ...college,
            categories,
            isFeatured: false,
            featuredOrder: null,
          }
        })
        .filter((college) => {
          if (!college.isEnabled) return false

          // For BBA category, check if college has BBA courses OR matches name/description
          if (category === "bba") {
            return bbaCollegeIds.has(college.id) || college.categories.includes("bba")
          }
          // Handle bba as part of management for display
          if (category === "management") {
            return college.categories.includes("management") || college.categories.includes("bba")
          }
          return college.categories.includes(category)
        })
        .slice(0, 20) // Limit to 20 colleges per category

      return NextResponse.json({
        colleges: filteredColleges,
        count: filteredColleges.length,
        isFromFeatured: false,
      })
    }

    // Transform featured data to include category info
    const transformedColleges = featuredData.map(item => ({
      ...item.college,
      categories: [item.category],
      isFeatured: true,
      featuredOrder: item.displayOrder,
      featuredAt: item.featuredAt,
      expiresAt: item.expiresAt,
      featuredId: item.id,
      isActive: item.isActive,
    }))

    return NextResponse.json({
      colleges: transformedColleges,
      count: transformedColleges.length,
      isFromFeatured: true,
    })
  } catch (error) {
    console.error("Error fetching featured colleges:", error)
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { collegeId, category, displayOrder = 0, expiresAt } = body

    if (!collegeId || !category) {
      return NextResponse.json(
        { error: "collegeId and category are required" },
        { status: 400 }
      )
    }

    // Check if college exists
    const college = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, collegeId))
      .limit(1)

    if (college.length === 0) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    // Check if already featured
    const existing = await db
      .select()
      .from(featuredColleges)
      .where(
        and(
          eq(featuredColleges.collegeId, collegeId),
          eq(featuredColleges.category, category)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "College already featured in this category" },
        { status: 409 }
      )
    }

    // Add to featured colleges
    const [featured] = await db
      .insert(featuredColleges)
      .values({
        collegeId,
        category,
        displayOrder,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning()

    return NextResponse.json({
      success: true,
      featured,
      message: "College added to featured list successfully",
    })
  } catch (error) {
    console.error("Error adding featured college:", error)
    return NextResponse.json(
      { error: "Failed to add featured college" },
      { status: 500 }
    )
  }
}

