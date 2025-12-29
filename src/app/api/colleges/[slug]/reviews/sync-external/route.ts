import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeReviews, colleges } from "@/db/schema"
import { eq, and, isNotNull } from "drizzle-orm"
import { fetchAllExternalReviews } from "@/lib/reviews/externalReviews"

/**
 * POST /api/colleges/[slug]/reviews/sync-external
 * Sync external reviews from Google Maps, college websites, etc.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get college by slug
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.slug, slug))
      .limit(1)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    // Fetch external reviews
    const externalReviews = await fetchAllExternalReviews({
      name: college.name,
      website: college.website || null,
      googlePlaceId: college.googlePlaceId || null,
      location: college.location || null,
    })

    if (externalReviews.length === 0) {
      return NextResponse.json({
        message: "No external reviews found",
        synced: 0,
      })
    }

    // Get existing external review IDs to avoid duplicates
    const existingReviews = await db
      .select({ externalId: collegeReviews.externalId })
      .from(collegeReviews)
      .where(
        and(
          eq(collegeReviews.collegeId, college.id),
          isNotNull(collegeReviews.externalId)
        )
      )

    const existingIds = new Set(
      existingReviews
        .map((r) => r.externalId)
        .filter((id): id is string => id !== null)
    )

    // Insert new reviews
    const newReviews = externalReviews.filter(
      (review) => !existingIds.has(review.externalId)
    )

    if (newReviews.length === 0) {
      return NextResponse.json({
        message: "All external reviews already synced",
        synced: 0,
        total: externalReviews.length,
      })
    }

    const insertedReviews = await db
      .insert(collegeReviews)
      .values(
        newReviews.map((review) => ({
          collegeId: college.id,
          rating: review.rating,
          title: review.title || null,
          review: review.review,
          reviewerName: review.reviewerName || null,
          reviewerEmail: review.reviewerEmail || null,
          source: review.source,
          externalId: review.externalId,
          externalUrl: review.externalUrl || null,
          externalDate: review.externalDate || null,
          isApproved: true, // Auto-approve external reviews
          isVerified: true, // Mark as verified since from external source
        }))
      )
      .returning()

    return NextResponse.json({
      message: `Synced ${insertedReviews.length} external reviews`,
      synced: insertedReviews.length,
      total: externalReviews.length,
      reviews: insertedReviews,
    })
  } catch (error) {
    console.error("Error syncing external reviews:", error)
    return NextResponse.json(
      { error: "Failed to sync external reviews" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/colleges/[slug]/reviews/sync-external
 * Check status of external reviews sync
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get college by slug
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.slug, slug))
      .limit(1)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    // Count external reviews
    const externalReviewsCount = await db
      .select()
      .from(collegeReviews)
      .where(
        and(
          eq(collegeReviews.collegeId, college.id),
          isNotNull(collegeReviews.externalId)
        )
      )

    return NextResponse.json({
      collegeName: college.name,
      googlePlaceId: college.googlePlaceId || null,
      website: college.website || null,
      externalReviewsCount: externalReviewsCount.length,
      hasGooglePlaceId: !!college.googlePlaceId,
      hasWebsite: !!college.website,
    })
  } catch (error) {
    console.error("Error checking external reviews status:", error)
    return NextResponse.json(
      { error: "Failed to check external reviews status" },
      { status: 500 }
    )
  }
}

