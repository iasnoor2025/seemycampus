import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { scholarships, colleges } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Get scholarship by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const [result] = await db
      .select({
        scholarship: scholarships,
        college: colleges,
      })
      .from(scholarships)
      .leftJoin(colleges, eq(scholarships.collegeId, colleges.id))
      .where(eq(scholarships.slug, slug))
      .limit(1)

    if (!result) {
      return NextResponse.json(
        { error: "Scholarship not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...result.scholarship,
      college: result.college,
    })
  } catch (error) {
    console.error("Error fetching scholarship:", error)
    return NextResponse.json(
      { error: "Failed to fetch scholarship" },
      { status: 500 }
    )
  }
}

