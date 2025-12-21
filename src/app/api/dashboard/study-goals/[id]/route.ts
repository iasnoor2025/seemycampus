import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { studyGoals } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Fetch a single study goal
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
    const [goal] = await db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.id, parseInt(id)))
      .limit(1)

    if (!goal) {
      return NextResponse.json({ error: "Study goal not found" }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error fetching study goal:", error)
    return NextResponse.json(
      { error: "Failed to fetch study goal" },
      { status: 500 }
    )
  }
}

// PUT - Update a study goal
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
    const body = await request.json()
    const { name, slug, icon, collegeCount, courses, link, displayOrder, isActive } = body

    // Check if slug is being changed and if it conflicts with existing category
    if (slug) {
      const { categories } = await import("@/db/schema")
      const existingCategory = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1)

      if (existingCategory.length > 0) {
        return NextResponse.json(
          { error: "A category with this slug already exists in the menu. Please use the Menu section to manage it." },
          { status: 400 }
        )
      }
    }

    const [updatedGoal] = await db
      .update(studyGoals)
      .set({
        name,
        slug,
        icon,
        collegeCount,
        courses,
        link,
        displayOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(studyGoals.id, parseInt(id)))
      .returning()

    if (!updatedGoal) {
      return NextResponse.json({ error: "Study goal not found" }, { status: 404 })
    }

    return NextResponse.json(updatedGoal)
  } catch (error) {
    console.error("Error updating study goal:", error)
    return NextResponse.json(
      { error: "Failed to update study goal" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a study goal
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

    await db.delete(studyGoals).where(eq(studyGoals.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting study goal:", error)
    return NextResponse.json(
      { error: "Failed to delete study goal" },
      { status: 500 }
    )
  }
}

