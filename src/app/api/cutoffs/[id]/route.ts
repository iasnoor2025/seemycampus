import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { cutoffs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// PUT - Update cutoff
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      examName,
      courseName,
      year,
      category,
      openingRank,
      closingRank,
      openingScore,
      closingScore,
      round,
      quota,
    } = body

    const [updatedCutoff] = await db
      .update(cutoffs)
      .set({
        examName: examName || undefined,
        courseName: courseName !== undefined ? courseName : undefined,
        year: year ? parseInt(year) : undefined,
        category: category !== undefined ? category : undefined,
        openingRank: openingRank !== undefined ? parseInt(openingRank) : undefined,
        closingRank: closingRank !== undefined ? parseInt(closingRank) : undefined,
        openingScore: openingScore !== undefined ? parseInt(openingScore) : undefined,
        closingScore: closingScore !== undefined ? parseInt(closingScore) : undefined,
        round: round !== undefined ? parseInt(round) : undefined,
        quota: quota !== undefined ? quota : undefined,
      })
      .where(eq(cutoffs.id, parseInt(id)))
      .returning()

    if (!updatedCutoff) {
      return NextResponse.json(
        { error: "Cutoff not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ cutoff: updatedCutoff })
  } catch (error) {
    console.error("Error updating cutoff:", error)
    return NextResponse.json(
      { error: "Failed to update cutoff" },
      { status: 500 }
    )
  }
}

// DELETE - Delete cutoff
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const [deletedCutoff] = await db
      .delete(cutoffs)
      .where(eq(cutoffs.id, parseInt(id)))
      .returning()

    if (!deletedCutoff) {
      return NextResponse.json(
        { error: "Cutoff not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Cutoff deleted successfully" })
  } catch (error) {
    console.error("Error deleting cutoff:", error)
    return NextResponse.json(
      { error: "Failed to delete cutoff" },
      { status: 500 }
    )
  }
}

