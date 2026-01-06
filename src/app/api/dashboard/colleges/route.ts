import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { colleges } from "@/db/schema"
import { desc, sql, eq, and } from "drizzle-orm"

// GET - Fetch all colleges
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const getAll = searchParams.get("all") === "true" || limit >= 10000

    // If requesting all colleges (for client-side pagination), return all without limit
    let query = db.select().from(colleges).orderBy(desc(colleges.createdAt))
    
    if (!getAll) {
      const offset = (page - 1) * limit
      query = query.limit(limit).offset(offset) as any
    }

    const collegesList = await query

    // Get total count efficiently using COUNT
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(colleges)
    const totalCount = Number(totalCountResult[0]?.count || 0)
    const totalPages = getAll ? 1 : Math.ceil(totalCount / limit)

    return NextResponse.json({
      colleges: collegesList,
      pagination: {
        currentPage: getAll ? 1 : page,
        totalPages,
        totalCount,
        limit: getAll ? totalCount : limit,
      },
    })
  } catch (error) {
    console.error("Error fetching colleges:", error)
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    )
  }
}

// POST - Create a new college
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, location, city, state, country, description, website, email, phone, isAcademicAlliance, images, googlePlaceId, ranking, establishedYear, averagePackage, accreditation } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      )
    }

    const [newCollege] = await db
      .insert(colleges)
      .values({
        name,
        slug,
        location,
        city,
        state,
        country: country || "India",
        description,
        website,
        email,
        phone,
        isAcademicAlliance: isAcademicAlliance || false,
        images: images || [],
        googlePlaceId: googlePlaceId || null,
        ranking: ranking !== undefined && ranking !== null && ranking !== "" ? parseInt(ranking) : null,
        establishedYear: establishedYear !== undefined && establishedYear !== null && establishedYear !== "" ? parseInt(establishedYear) : null,
        averagePackage: averagePackage !== undefined && averagePackage !== null && averagePackage !== "" ? parseInt(averagePackage) : null,
        accreditation: accreditation || null,
      })
      .returning()

    return NextResponse.json(newCollege, { status: 201 })
  } catch (error: any) {
    console.error("Error creating college:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "College with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create college" },
      { status: 500 }
    )
  }
}

// PATCH - Bulk update colleges by state (enable/disable)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { state, isEnabled } = body

    if (!state || typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "State and isEnabled (boolean) are required" },
        { status: 400 }
      )
    }

    // Update all colleges in the specified state
    const updatedColleges = await db
      .update(colleges)
      .set({
        isEnabled,
        updatedAt: new Date(),
      })
      .where(eq(colleges.state, state))
      .returning()

    return NextResponse.json({
      message: `Successfully ${isEnabled ? "enabled" : "disabled"} ${updatedColleges.length} colleges in ${state}`,
      count: updatedColleges.length,
      state,
      isEnabled,
    })
  } catch (error) {
    console.error("Error bulk updating colleges:", error)
    return NextResponse.json(
      { error: "Failed to update colleges" },
      { status: 500 }
    )
  }
}

