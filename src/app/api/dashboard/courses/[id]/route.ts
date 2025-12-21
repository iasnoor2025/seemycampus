import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { courses } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Fetch a single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      )
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}

// PUT - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, slug, collegeId, description, duration, fees, feesCurrency, studyMode, level } = body

    const [updatedCourse] = await db
      .update(courses)
      .set({
        name,
        slug,
        collegeId: collegeId ? parseInt(collegeId) : undefined,
        description,
        duration,
        fees: fees ? parseInt(fees) : null,
        feesCurrency,
        studyMode,
        level,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning()

    if (!updatedCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCourse)
  } catch (error: any) {
    console.error("Error updating course:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Course with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      )
    }

    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning()

    if (!deletedCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}

