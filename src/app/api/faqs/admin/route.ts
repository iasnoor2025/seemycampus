import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { faqs } from "@/db/schema"
import { desc, asc } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET - Fetch all FAQs for admin (including unapproved)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch all FAQs, ordered by approval status (pending first), then by display order
    const results = await db
      .select()
      .from(faqs)
      .orderBy(asc(faqs.isApproved), asc(faqs.displayOrder), desc(faqs.createdAt))

    return NextResponse.json({
      success: true,
      faqs: results,
    })
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    )
  }
}

// POST - Create new FAQ (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question, answer, category, displayOrder, isActive, isApproved } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      )
    }

    // Create new FAQ
    const [newFaq] = await db
      .insert(faqs)
      .values({
        question: question.trim(),
        answer: answer.trim(),
        category: category || null,
        source: "admin",
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        isApproved: isApproved !== undefined ? isApproved : true, // Admin-created FAQs are approved by default
        viewCount: 0,
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: "FAQ created successfully",
      faq: newFaq,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating FAQ:", error)
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    )
  }
}
