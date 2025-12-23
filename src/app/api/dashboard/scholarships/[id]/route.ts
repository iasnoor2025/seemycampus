import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { scholarships } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Get scholarship by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const [scholarship] = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.id, parseInt(id)))
      .limit(1)

    if (!scholarship) {
      return NextResponse.json(
        { error: "Scholarship not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(scholarship)
  } catch (error) {
    console.error("Error fetching scholarship:", error)
    return NextResponse.json(
      { error: "Failed to fetch scholarship" },
      { status: 500 }
    )
  }
}

// PUT - Update scholarship
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      slug,
      description,
      provider,
      amount,
      amountCurrency,
      amountType,
      eligibilityCriteria,
      applicationDeadline,
      applicationStartDate,
      applicationUrl,
      contactEmail,
      contactPhone,
      category,
      level,
      course,
      collegeId,
      isActive,
      displayOrder,
    } = body

    const [updated] = await db
      .update(scholarships)
      .set({
        title,
        slug,
        description,
        provider,
        amount: amount ? parseInt(amount) : undefined,
        amountCurrency: amountCurrency || "INR",
        amountType,
        eligibilityCriteria,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : undefined,
        applicationStartDate: applicationStartDate
          ? new Date(applicationStartDate)
          : undefined,
        applicationUrl,
        contactEmail,
        contactPhone,
        category,
        level,
        course,
        collegeId: collegeId ? parseInt(collegeId) : undefined,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0,
        updatedAt: new Date(),
      })
      .where(eq(scholarships.id, parseInt(id)))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: "Scholarship not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating scholarship:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Scholarship with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update scholarship" },
      { status: 500 }
    )
  }
}

// DELETE - Delete scholarship
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.delete(scholarships).where(eq(scholarships.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting scholarship:", error)
    return NextResponse.json(
      { error: "Failed to delete scholarship" },
      { status: 500 }
    )
  }
}

