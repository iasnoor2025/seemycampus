import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { faqs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET - Get single FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const faqId = parseInt(id)

    if (!faqId || isNaN(faqId)) {
      return NextResponse.json(
        { error: "Invalid FAQ ID" },
        { status: 400 }
      )
    }

    const [faq] = await db
      .select()
      .from(faqs)
      .where(eq(faqs.id, faqId))
      .limit(1)

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      faq,
    })
  } catch (error) {
    console.error("Error fetching FAQ:", error)
    return NextResponse.json(
      { error: "Failed to fetch FAQ" },
      { status: 500 }
    )
  }
}

// PATCH - Update FAQ
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const faqId = parseInt(id)

    if (!faqId || isNaN(faqId)) {
      return NextResponse.json(
        { error: "Invalid FAQ ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { question, answer, category, displayOrder, isActive, isApproved } = body

    // Check if FAQ exists
    const [existingFaq] = await db
      .select()
      .from(faqs)
      .where(eq(faqs.id, faqId))
      .limit(1)

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    // Update FAQ
    const [updated] = await db
      .update(faqs)
      .set({
        question: question !== undefined ? question.trim() : existingFaq.question,
        answer: answer !== undefined ? answer.trim() : existingFaq.answer,
        category: category !== undefined ? category : existingFaq.category,
        displayOrder: displayOrder !== undefined ? displayOrder : existingFaq.displayOrder,
        isActive: isActive !== undefined ? isActive : existingFaq.isActive,
        isApproved: isApproved !== undefined ? isApproved : existingFaq.isApproved,
        updatedAt: new Date(),
      })
      .where(eq(faqs.id, faqId))
      .returning()

    return NextResponse.json({
      success: true,
      message: "FAQ updated successfully",
      faq: updated,
    })
  } catch (error) {
    console.error("Error updating FAQ:", error)
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    )
  }
}

// DELETE - Delete FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const faqId = parseInt(id)

    if (!faqId || isNaN(faqId)) {
      return NextResponse.json(
        { error: "Invalid FAQ ID" },
        { status: 400 }
      )
    }

    // Check if FAQ exists
    const [existingFaq] = await db
      .select()
      .from(faqs)
      .where(eq(faqs.id, faqId))
      .limit(1)

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    // Delete FAQ
    await db.delete(faqs).where(eq(faqs.id, faqId))

    return NextResponse.json({
      success: true,
      message: "FAQ deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting FAQ:", error)
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    )
  }
}
