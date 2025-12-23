import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { savedColleges, colleges } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// GET - Get all saved colleges for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    const saved = await db
      .select({
        id: savedColleges.id,
        collegeId: savedColleges.collegeId,
        createdAt: savedColleges.createdAt,
        college: colleges,
      })
      .from(savedColleges)
      .innerJoin(colleges, eq(savedColleges.collegeId, colleges.id))
      .where(eq(savedColleges.userId, userId))
      .orderBy(savedColleges.createdAt)

    return NextResponse.json({
      savedColleges: saved.map((item) => ({
        id: item.id,
        collegeId: item.collegeId,
        createdAt: item.createdAt,
        college: item.college,
      })),
    })
  } catch (error) {
    console.error("Error fetching saved colleges:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved colleges" },
      { status: 500 }
    )
  }
}

// POST - Save a college
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { collegeId } = body

    if (!collegeId) {
      return NextResponse.json(
        { error: "College ID is required" },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    // Check if already saved
    const existing = await db
      .select()
      .from(savedColleges)
      .where(
        and(
          eq(savedColleges.userId, userId),
          eq(savedColleges.collegeId, collegeId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "College already saved" },
        { status: 400 }
      )
    }

    // Verify college exists
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, collegeId))
      .limit(1)

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    // Save college
    const [saved] = await db
      .insert(savedColleges)
      .values({
        userId,
        collegeId,
      })
      .returning()

    return NextResponse.json(
      {
        success: true,
        savedCollege: saved,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error saving college:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "College already saved" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to save college" },
      { status: 500 }
    )
  }
}

// DELETE - Unsave a college
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get("collegeId")

    if (!collegeId) {
      return NextResponse.json(
        { error: "College ID is required" },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    await db
      .delete(savedColleges)
      .where(
        and(
          eq(savedColleges.userId, userId),
          eq(savedColleges.collegeId, parseInt(collegeId))
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unsaving college:", error)
    return NextResponse.json(
      { error: "Failed to unsave college" },
      { status: 500 }
    )
  }
}

