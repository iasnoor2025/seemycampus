import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { colleges } from "@/db/schema"
import { desc } from "drizzle-orm"

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
    const offset = (page - 1) * limit

    const collegesList = await db
      .select()
      .from(colleges)
      .orderBy(desc(colleges.createdAt))
      .limit(limit)
      .offset(offset)

    const totalCount = await db.select().from(colleges)
    const totalPages = Math.ceil(totalCount.length / limit)

    return NextResponse.json({
      colleges: collegesList,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalCount.length,
        limit,
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
    const { name, slug, location, city, state, country, description, website, email, phone, isAcademicAlliance } = body

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

