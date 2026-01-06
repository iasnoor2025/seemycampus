import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeReviews, colleges } from "@/db/schema"
import { eq, desc, and, isNotNull } from "drizzle-orm"

// GET - Fetch reviews for a college
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get college by slug (only enabled colleges)
    const [college] = await db
      .select()
      .from(colleges)
      .where(and(
        eq(colleges.slug, slug),
        eq(colleges.isEnabled, true)
      ))
      .limit(1)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    // Get approved reviews (both internal and external)
    const reviews = await db
      .select()
      .from(collegeReviews)
      .where(and(eq(collegeReviews.collegeId, college.id), eq(collegeReviews.isApproved, true)))
      .orderBy(desc(collegeReviews.externalDate || collegeReviews.createdAt))

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Count ratings
    const ratingCounts = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    }

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingCounts,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    const { rating, title, review, reviewerName, reviewerEmail, course, batch } = body

    if (!rating || !review || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating (1-5) and review text are required" },
        { status: 400 }
      )
    }

    // Get college by slug
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.slug, slug))
      .limit(1)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    // Create review (not approved by default, needs admin approval)
    const [newReview] = await db
      .insert(collegeReviews)
      .values({
        collegeId: college.id,
        rating: parseInt(rating),
        title: title || null,
        review,
        reviewerName: reviewerName || null,
        reviewerEmail: reviewerEmail || null,
        course: course || null,
        batch: batch || null,
        source: "internal", // Internal user-submitted reviews
        isApproved: false, // Requires admin approval
      })
      .returning()

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

