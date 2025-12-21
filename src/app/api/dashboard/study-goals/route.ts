import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { studyGoals } from "@/db/schema"
import { desc } from "drizzle-orm"

// GET - Fetch all study goals
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalsList = await db
      .select()
      .from(studyGoals)
      .orderBy(desc(studyGoals.displayOrder), desc(studyGoals.createdAt))

    return NextResponse.json({
      studyGoals: goalsList,
    })
  } catch (error) {
    console.error("Error fetching study goals:", error)
    return NextResponse.json(
      { error: "Failed to fetch study goals" },
      { status: 500 }
    )
  }
}

// POST - Create a new study goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, icon, collegeCount, courses, link, displayOrder, isActive } = body

    if (!name || !slug || !icon) {
      return NextResponse.json(
        { error: "Name, slug, and icon are required" },
        { status: 400 }
      )
    }

    // Check if a category with the same slug already exists
    const { categories } = await import("@/db/schema")
    const { eq } = await import("drizzle-orm")
    
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

    const [newGoal] = await db
      .insert(studyGoals)
      .values({
        name,
        slug,
        icon,
        collegeCount: collegeCount || null,
        courses: courses || [],
        link: link || `/colleges/${slug}`,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning()

    return NextResponse.json(newGoal, { status: 201 })
  } catch (error: any) {
    console.error("Error creating study goal:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Study goal with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create study goal" },
      { status: 500 }
    )
  }
}

