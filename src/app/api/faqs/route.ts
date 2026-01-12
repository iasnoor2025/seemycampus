import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { faqs } from "@/db/schema"
import { eq, desc, asc, and } from "drizzle-orm"

// GET - Fetch FAQs for home page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "6")
    const category = searchParams.get("category")

    let results
    if (category) {
      results = await db
        .select()
        .from(faqs)
        .where(and(eq(faqs.isActive, true), eq(faqs.isApproved, true), eq(faqs.category, category)))
        .orderBy(asc(faqs.displayOrder), desc(faqs.viewCount), desc(faqs.createdAt))
        .limit(limit)
    } else {
      results = await db
        .select()
        .from(faqs)
        .where(and(eq(faqs.isActive, true), eq(faqs.isApproved, true)))
        .orderBy(asc(faqs.displayOrder), desc(faqs.viewCount), desc(faqs.createdAt))
        .limit(limit)
    }

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

// POST - Create or update FAQ from chatbot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, category = "general" } = body

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      )
    }

    // Check if FAQ with similar question already exists
    const existingFaqs = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .limit(100) // Check recent FAQs

    // Normalize question for comparison
    const normalizedQuestion = question.toLowerCase().trim()
    const existingFaq = existingFaqs.find(faq => 
      faq.question.toLowerCase().trim() === normalizedQuestion
    )

    if (existingFaq) {
      // Update existing FAQ - increment view count and update answer if different
      const [updated] = await db
        .update(faqs)
        .set({
          answer: answer,
          viewCount: (existingFaq.viewCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, existingFaq.id))
        .returning()

      return NextResponse.json({
        success: true,
        faq: updated,
        created: false,
      })
    } else {
      // Create new FAQ - not approved by default, needs admin approval
      const [newFaq] = await db
        .insert(faqs)
        .values({
          question: question.trim(),
          answer: answer.trim(),
          category: category,
          source: "chat",
          viewCount: 1,
          isActive: true,
          isApproved: false, // Requires admin approval
          displayOrder: 0,
        })
        .returning()

      return NextResponse.json({
        success: true,
        faq: newFaq,
        created: true,
      })
    }
  } catch (error) {
    console.error("Error saving FAQ:", error)
    return NextResponse.json(
      { error: "Failed to save FAQ" },
      { status: 500 }
    )
  }
}
