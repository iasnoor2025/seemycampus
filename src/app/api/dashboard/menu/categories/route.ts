import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { categories, studyGoals } from "@/db/schema"
import { desc, asc, eq } from "drizzle-orm"

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categoriesList = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name))

    return NextResponse.json({ categories: categoriesList })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, displayOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      )
    }

    // Check if a study goal with the same slug already exists
    const existingStudyGoal = await db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.slug, slug))
      .limit(1)

    if (existingStudyGoal.length > 0) {
      return NextResponse.json(
        { error: "A study goal with this slug already exists. Please use the Study Goals section to manage it, or use a different slug." },
        { status: 400 }
      )
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name,
        slug,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning()

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    console.error("Error creating category:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      )
    }
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Database table 'categories' does not exist. Please run: npm run db:migrate" },
        { status: 500 }
      )
    }
    // Return more detailed error message
    const errorMessage = error.message || error.toString() || "Failed to create category"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

