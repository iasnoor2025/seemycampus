import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { applicationGuides } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const updateGuideSchema = z.object({
  courseId: z.number().int().optional().nullable(),
  guideContent: z.string().min(1).optional(),
  requiredDocs: z.array(z.string()).optional(),
  feeInfo: z.record(z.any()).optional().nullable(),
  deadlines: z.record(z.any()).optional().nullable(),
  tips: z.string().optional().nullable(),
  applicationUrl: z.string().url().optional().nullable(),
  contactInfo: z.record(z.any()).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const guideId = parseInt(id)

    if (isNaN(guideId)) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }

    const [guide] = await db
      .select()
      .from(applicationGuides)
      .where(eq(applicationGuides.id, guideId))
      .limit(1)

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    return NextResponse.json({ guide })
  } catch (error) {
    console.error("Error fetching application guide:", error)
    return NextResponse.json(
      { error: "Failed to fetch application guide" },
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
    const guideId = parseInt(id)

    if (isNaN(guideId)) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateGuideSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [updatedGuide] = await db
      .update(applicationGuides)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(applicationGuides.id, guideId))
      .returning()

    if (!updatedGuide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    return NextResponse.json({ guide: updatedGuide })
  } catch (error) {
    console.error("Error updating application guide:", error)
    return NextResponse.json(
      { error: "Failed to update application guide" },
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
    const guideId = parseInt(id)

    if (isNaN(guideId)) {
      return NextResponse.json({ error: "Invalid guide ID" }, { status: 400 })
    }

    await db.delete(applicationGuides).where(eq(applicationGuides.id, guideId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting application guide:", error)
    return NextResponse.json(
      { error: "Failed to delete application guide" },
      { status: 500 }
    )
  }
}

