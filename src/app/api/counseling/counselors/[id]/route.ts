import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { counselors } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const counselorId = parseInt(id)

    const [counselor] = await db
      .select()
      .from(counselors)
      .where(eq(counselors.id, counselorId))
      .limit(1)

    if (!counselor) {
      return NextResponse.json({ error: "Counselor not found" }, { status: 404 })
    }

    return NextResponse.json({ counselor })
  } catch (error: any) {
    console.error("Error fetching counselor:", error)
    return NextResponse.json(
      { error: "Failed to fetch counselor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const counselorId = parseInt(id)
    const body = await request.json()

    const [updatedCounselor] = await db
      .update(counselors)
      .set({
        ...body,
        experience: body.experience ? parseInt(body.experience.toString()) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(counselors.id, counselorId))
      .returning()

    if (!updatedCounselor) {
      return NextResponse.json({ error: "Counselor not found" }, { status: 404 })
    }

    return NextResponse.json({ counselor: updatedCounselor })
  } catch (error: any) {
    console.error("Error updating counselor:", error)
    return NextResponse.json(
      { error: "Failed to update counselor" },
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

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const counselorId = parseInt(id)

    await db
      .update(counselors)
      .set({ isActive: false })
      .where(eq(counselors.id, counselorId))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting counselor:", error)
    return NextResponse.json(
      { error: "Failed to delete counselor" },
      { status: 500 }
    )
  }
}

