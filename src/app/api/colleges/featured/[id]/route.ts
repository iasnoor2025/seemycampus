import { NextResponse } from "next/server"
import { db } from "@/db"
import { featuredColleges } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isActive, displayOrder, expiresAt } = body

    // Update featured college
    const [updated] = await db
      .update(featuredColleges)
      .set({
        isActive: isActive !== undefined ? isActive : undefined,
        displayOrder: displayOrder !== undefined ? displayOrder : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(featuredColleges.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: "Featured college not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      featured: updated,
      message: `Featured college ${isActive ? "enabled" : "disabled"} successfully`,
    })
  } catch (error) {
    console.error("Error updating featured college:", error)
    return NextResponse.json(
      { error: "Failed to update featured college" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      )
    }

    // Delete featured college
    const [deleted] = await db
      .delete(featuredColleges)
      .where(eq(featuredColleges.id, id))
      .returning()

    if (!deleted) {
      return NextResponse.json(
        { error: "Featured college not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "College removed from featured list successfully",
    })
  } catch (error) {
    console.error("Error deleting featured college:", error)
    return NextResponse.json(
      { error: "Failed to remove featured college" },
      { status: 500 }
    )
  }
}