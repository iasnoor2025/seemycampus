import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { studentAnswers } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

// GET - Get quiz history for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    const quizzes = await db
      .select()
      .from(studentAnswers)
      .where(eq(studentAnswers.userId, userId))
      .orderBy(desc(studentAnswers.createdAt))

    return NextResponse.json({
      quizzes,
    })
  } catch (error) {
    console.error("Error fetching quiz history:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz history" },
      { status: 500 }
    )
  }
}

