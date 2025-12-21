import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { courses } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

// GET - Fetch all courses
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const collegeId = searchParams.get("collegeId")
    const offset = (page - 1) * limit

    let coursesList
    if (collegeId) {
      coursesList = await db
        .select()
        .from(courses)
        .where(eq(courses.collegeId, parseInt(collegeId)))
        .orderBy(desc(courses.createdAt))
        .limit(limit)
        .offset(offset)
    } else {
      coursesList = await db
        .select()
        .from(courses)
        .orderBy(desc(courses.createdAt))
        .limit(limit)
        .offset(offset)
    }

    let totalCount
    if (collegeId) {
      totalCount = await db
        .select()
        .from(courses)
        .where(eq(courses.collegeId, parseInt(collegeId)))
    } else {
      totalCount = await db.select().from(courses)
    }
    const totalPages = Math.ceil(totalCount.length / limit)

    return NextResponse.json({
      courses: coursesList,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalCount.length,
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

