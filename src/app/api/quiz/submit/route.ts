import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { studentAnswers, leads } from "@/db/schema"
import { eq } from "drizzle-orm"
import { quizSchema } from "@/lib/quiz"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate quiz data
    const validatedData = quizSchema.parse(body)

    // Get current user if logged in
    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    // Save student answers (link to user if logged in)
    const [studentAnswer] = await db
      .insert(studentAnswers)
      .values({
        userId: userId || undefined,
        interests: validatedData.interests,
        preferredLocation: validatedData.preferredLocation,
        budgetMin: validatedData.budgetMin,
        budgetMax: validatedData.budgetMax,
        budgetCurrency: validatedData.budgetCurrency,
        studyMode: validatedData.studyMode,
        academicLevel: validatedData.academicLevel,
      })
      .returning()

    // Create a lead (anonymous for now, can be updated later)
    const [lead] = await db
      .insert(leads)
      .values({
        name: "Anonymous",
        email: `quiz_${Date.now()}@seemycampus.com`,
        quizData: validatedData,
        studentAnswerId: studentAnswer.id,
        source: "quiz",
        status: "new",
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        quizId: studentAnswer.id,
        leadId: lead.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Quiz submission error:", error)
    return NextResponse.json(
      { error: "Invalid quiz data or server error" },
      { status: 400 }
    )
  }
}

