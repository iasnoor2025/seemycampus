import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { cutoffs, colleges } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET - Fetch cutoffs (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get("collegeId")
    const examName = searchParams.get("examName")
    const year = searchParams.get("year")
    const category = searchParams.get("category")

    let query = db.select().from(cutoffs)

    const conditions = []
    if (collegeId) {
      conditions.push(eq(cutoffs.collegeId, parseInt(collegeId)))
    }
    if (examName) {
      conditions.push(eq(cutoffs.examName, examName))
    }
    if (year) {
      conditions.push(eq(cutoffs.year, parseInt(year)))
    }
    if (category) {
      conditions.push(eq(cutoffs.category, category))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    const cutoffList = await query.orderBy(desc(cutoffs.year), desc(cutoffs.round))

    return NextResponse.json({ cutoffs: cutoffList })
  } catch (error) {
    console.error("Error fetching cutoffs:", error)
    return NextResponse.json(
      { error: "Failed to fetch cutoffs" },
      { status: 500 }
    )
  }
}

// POST - Create new cutoff
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      collegeId,
      examName,
      courseName,
      year,
      category,
      openingRank,
      closingRank,
      openingScore,
      closingScore,
      round,
      quota,
    } = body

    // Validate required fields
    if (!collegeId || !examName || !year) {
      return NextResponse.json(
        { error: "Missing required fields: collegeId, examName, year" },
        { status: 400 }
      )
    }

    // Verify college exists
    const college = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, collegeId))
      .limit(1)

    if (college.length === 0) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    const [newCutoff] = await db
      .insert(cutoffs)
      .values({
        collegeId,
        examName,
        courseName: courseName || null,
        year,
        category: category || null,
        openingRank: openingRank ? parseInt(openingRank) : null,
        closingRank: closingRank ? parseInt(closingRank) : null,
        openingScore: openingScore ? parseInt(openingScore) : null,
        closingScore: closingScore ? parseInt(closingScore) : null,
        round: round ? parseInt(round) : 1,
        quota: quota || null,
      })
      .returning()

    return NextResponse.json({ cutoff: newCutoff }, { status: 201 })
  } catch (error) {
    console.error("Error creating cutoff:", error)
    return NextResponse.json(
      { error: "Failed to create cutoff" },
      { status: 500 }
    )
  }
}

