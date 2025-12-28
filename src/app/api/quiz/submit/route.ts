import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { studentAnswers, leads } from "@/db/schema"
import { eq, or } from "drizzle-orm"
import { quizSchema } from "@/lib/quiz"
import { auth } from "@/lib/auth"
import { createLead } from "@/lib/leads/capture"

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

    // Try to get email/phone from request headers or body (set by contact form)
    const contactEmail = body.contactEmail || request.headers.get("x-contact-email")
    const contactPhone = body.contactPhone || request.headers.get("x-contact-phone")
    const contactName = body.contactName || request.headers.get("x-contact-name")

    // Check if we have contact info from the form
    if (contactEmail && !contactEmail.includes("quiz_")) {
      // Use createLead to merge with existing lead if it exists
      const lead = await createLead({
        name: contactName || "Anonymous",
        email: contactEmail,
        phone: contactPhone || undefined,
        source: "quiz",
        quizData: validatedData,
        studentAnswerId: studentAnswer.id,
        phoneVerified: false,
      })

      return NextResponse.json(
        {
          success: true,
          quizId: studentAnswer.id,
          leadId: lead.id,
          merged: true,
        },
        { status: 201 }
      )
    }

    // No contact info - create anonymous lead (will be merged later if contact form is filled)
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
        merged: false,
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

