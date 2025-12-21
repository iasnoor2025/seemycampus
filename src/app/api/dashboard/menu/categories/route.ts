import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { desc, asc } from "drizzle-orm"

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
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

