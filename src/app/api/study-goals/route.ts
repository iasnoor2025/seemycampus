import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { studyGoals } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

// GET - Fetch active study goals for public display
export async function GET(request: NextRequest) {
  try {
    const goalsList = await db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.isActive, true))
      .orderBy(desc(studyGoals.displayOrder), desc(studyGoals.createdAt))

    return NextResponse.json({
      studyGoals: goalsList,
    })
  } catch (error) {
    console.error("Error fetching study goals:", error)
    return NextResponse.json(
      { error: "Failed to fetch study goals" },
      { status: 500 }
    )
  }
}

