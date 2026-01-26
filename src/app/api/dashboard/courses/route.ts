import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { desc, eq, ilike, or, and, sql } from "drizzle-orm"
import { courses, colleges } from "@/db/schema"

// GET - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const collegeId = searchParams.get("collegeId")
    const search = searchParams.get("search")
    const offset = (page - 1) * limit

    const conditions = []
    if (collegeId) {
      conditions.push(eq(courses.collegeId, parseInt(collegeId)))
    }
    if (search) {
      conditions.push(
        or(
          ilike(courses.name, `%${search}%`),
          ilike(colleges.name, `%${search}%`)
        )
      )
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    // For the list, we need the join if we are searching by college name
    const coursesList = await db
      .select({
        id: courses.id,
        name: courses.name,
        slug: courses.slug,
        collegeId: courses.collegeId,
        description: courses.description,
        duration: courses.duration,
        fees: courses.fees,
        feesCurrency: courses.feesCurrency,
        studyMode: courses.studyMode,
        level: courses.level,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .leftJoin(colleges, eq(courses.collegeId, colleges.id))
      .where(where)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset)

    // For total count, use a optimized count query
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .leftJoin(colleges, eq(courses.collegeId, colleges.id))
      .where(where)

    const totalCount = Number(totalResult[0]?.count || 0)
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      courses: coursesList,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

// POST - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, collegeId, description, duration, fees, feesCurrency, studyMode, level } = body

    if (!name || !slug || !collegeId) {
      return NextResponse.json(
        { error: "Name, slug, and college ID are required" },
        { status: 400 }
      )
    }

    const [newCourse] = await db
      .insert(courses)
      .values({
        name,
        slug,
        collegeId: parseInt(collegeId),
        description,
        duration,
        fees: fees ? parseInt(fees) : null,
        feesCurrency: feesCurrency || "INR",
        studyMode,
        level,
      })
      .returning()

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error: any) {
    console.error("Error creating course:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Course with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}

