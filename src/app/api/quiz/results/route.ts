import { NextRequest, NextResponse } from "next/server"
import { getRecommendations } from "@/lib/recommendations/engine"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get("quizId")

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      )
    }

    const quizIdNum = parseInt(quizId)
    if (isNaN(quizIdNum)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      )
    }

    // Get current user if logged in
    const session = await auth()
    
    // If user is logged in, verify they own this quiz
    if (session?.user?.id) {
      // This check would be done in the recommendation engine or here
      // For now, we'll allow access - in production, add ownership check
    }

    const recommendations = await getRecommendations(quizIdNum)

    return NextResponse.json({
      quizId: quizIdNum,
      recommendations: recommendations.map((rec) => ({
        college: rec.college,
        score: rec.score,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching quiz results:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
}

