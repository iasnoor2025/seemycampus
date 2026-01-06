import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { colleges } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// Public GET endpoint to fetch college by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const collegeId = parseInt(id)

    if (isNaN(collegeId)) {
      return NextResponse.json(
        { error: "Invalid college ID" },
        { status: 400 }
      )
    }

    const [college] = await db
      .select()
      .from(colleges)
      .where(and(
        eq(colleges.id, collegeId),
        eq(colleges.isEnabled, true)
      ))
      .limit(1)

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(college)
  } catch (error) {
    console.error("Error fetching college:", error)
    return NextResponse.json(
      { error: "Failed to fetch college" },
      { status: 500 }
    )
  }
}

