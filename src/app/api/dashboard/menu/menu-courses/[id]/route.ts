import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { menuCourses } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Fetch a single menu course
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

    const [course] = await db
      .select()
      .from(menuCourses)
      .where(eq(menuCourses.id, courseId))
      .limit(1)

    if (!course) {
      return NextResponse.json(
        { error: "Menu course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching menu course:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu course" },
      { status: 500 }
    )
  }
}

// PUT - Update a menu course
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
    const body = await request.json()
    const { name, slug, categoryId, href, displayOrder, isActive } = body

    const [updatedCourse] = await db
      .update(menuCourses)
      .set({
        name,
        slug,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        href,
        displayOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(menuCourses.id, courseId))
      .returning()

    if (!updatedCourse) {
      return NextResponse.json(
        { error: "Menu course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("Error updating menu course:", error)
    return NextResponse.json(
      { error: "Failed to update menu course" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a menu course
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

    const [deletedCourse] = await db
      .delete(menuCourses)
      .where(eq(menuCourses.id, courseId))
      .returning()

    if (!deletedCourse) {
      return NextResponse.json(
        { error: "Menu course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Menu course deleted successfully" })
  } catch (error) {
    console.error("Error deleting menu course:", error)
    return NextResponse.json(
      { error: "Failed to delete menu course" },
      { status: 500 }
    )
  }
}

