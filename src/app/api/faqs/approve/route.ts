import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { faqs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// PATCH - Approve or reject FAQ
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { faqId, isApproved } = body

    if (!faqId || typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: faqId and isApproved" },
        { status: 400 }
      )
    }

    // Update FAQ approval status
    const [updated] = await db
      .update(faqs)
      .set({
        isApproved: isApproved,
        updatedAt: new Date(),
      })
      .where(eq(faqs.id, faqId))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `FAQ ${isApproved ? "approved" : "rejected"} successfully`,
      faq: updated,
    })
  } catch (error) {
    console.error("Error updating FAQ approval:", error)
    return NextResponse.json(
      { error: "Failed to update FAQ approval" },
      { status: 500 }
    )
  }
}
