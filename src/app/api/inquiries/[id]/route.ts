import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeInquiries } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const updateInquirySchema = z.object({
  status: z.enum(["pending", "responded", "resolved", "closed"]).optional(),
  response: z.string().optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    const inquiryId = parseInt(id)

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const [inquiry] = await db
      .select()
      .from(collegeInquiries)
      .where(eq(collegeInquiries.id, inquiryId))
      .limit(1)

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    // Students can only view their own inquiries
    if (session?.user && (session.user as any)?.role === "student") {
      if (inquiry.studentId !== parseInt((session.user as any).id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error fetching inquiry:", error)
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const inquiryId = parseInt(id)

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateInquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const updateData: any = {
      ...parsed.data,
      updatedAt: new Date(),
    }

    // If responding, set responder and response time
    if (parsed.data.response) {
      updateData.respondedBy = parseInt((session.user as any).id)
      updateData.respondedAt = new Date()
      if (!parsed.data.status) {
        updateData.status = "responded"
      }
    }

    const [updatedInquiry] = await db
      .update(collegeInquiries)
      .set(updateData)
      .where(eq(collegeInquiries.id, inquiryId))
      .returning()

    if (!updatedInquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    return NextResponse.json({ inquiry: updatedInquiry })
  } catch (error) {
    console.error("Error updating inquiry:", error)
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const inquiryId = parseInt(id)

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 })
    }

    await db.delete(collegeInquiries).where(eq(collegeInquiries.id, inquiryId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting inquiry:", error)
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    )
  }
}

