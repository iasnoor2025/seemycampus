import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeReviews } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewId = parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 })
    }

    const body = await request.json()
    const { helpful } = body // true for helpful, false for not helpful

    if (typeof helpful !== "boolean") {
      return NextResponse.json({ error: "Invalid helpful value" }, { status: 400 })
    }

    // Increment the appropriate counter
    if (helpful) {
      await db
        .update(collegeReviews)
        .set({
          helpfulCount: sql`${collegeReviews.helpfulCount} + 1`,
        })
        .where(eq(collegeReviews.id, reviewId))
    } else {
      await db
        .update(collegeReviews)
        .set({
          notHelpfulCount: sql`${collegeReviews.notHelpfulCount} + 1`,
        })
        .where(eq(collegeReviews.id, reviewId))
    }

    // Fetch updated review
    const [updatedReview] = await db
      .select()
      .from(collegeReviews)
      .where(eq(collegeReviews.id, reviewId))

    return NextResponse.json({ review: updatedReview })
  } catch (error) {
    console.error("Error updating helpful count:", error)
    return NextResponse.json(
      { error: "Failed to update helpful count" },
      { status: 500 }
    )
  }
}

