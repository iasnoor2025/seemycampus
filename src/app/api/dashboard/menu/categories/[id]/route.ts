import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Fetch a single category
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
    const categoryId = parseInt(id)

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT - Update a category
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
    const categoryId = parseInt(id)
    const body = await request.json()
    const { name, slug, displayOrder, isActive } = body

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name,
        slug,
        displayOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryId))
      .returning()

    if (!updatedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    console.error("Error updating category:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
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
    const categoryId = parseInt(id)

    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning()

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

