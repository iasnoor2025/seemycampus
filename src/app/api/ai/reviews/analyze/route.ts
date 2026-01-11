import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  analyzeReviewSentiment,
  summarizeReviews,
  extractReviewTopics,
  moderateReview,
  type Review,
} from "@/lib/ai/reviewAnalysis"

/**
 * POST /api/ai/reviews/analyze
 * Analyze reviews using AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "sentiment":
        if (!params.review) {
          return NextResponse.json({ error: "Review is required" }, { status: 400 })
        }

        const sentiment = await analyzeReviewSentiment(params.review, true)
        return NextResponse.json({ sentiment })

      case "summarize":
        if (!params.reviews || !Array.isArray(params.reviews) || !params.collegeName) {
          return NextResponse.json(
            { error: "Reviews array and collegeName are required" },
            { status: 400 }
          )
        }

        const summary = await summarizeReviews(params.reviews as Review[], params.collegeName, true)
        return NextResponse.json({ summary })

      case "topics":
        if (!params.reviews || !Array.isArray(params.reviews)) {
          return NextResponse.json({ error: "Reviews array is required" }, { status: 400 })
        }

        const topics = await extractReviewTopics(params.reviews as Review[], true)
        return NextResponse.json({ topics })

      case "moderate":
        if (!params.review) {
          return NextResponse.json({ error: "Review is required" }, { status: 400 })
        }

        const moderation = await moderateReview(params.review, true)
        return NextResponse.json({ moderation })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error in review analysis API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    )
  }
}
