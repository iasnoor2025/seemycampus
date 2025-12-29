import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeRankings, colleges } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET - Fetch rankings (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get("collegeId")
    const rankingSource = searchParams.get("rankingSource")
    const year = searchParams.get("year")

    let query = db.select().from(collegeRankings)

    const conditions = []
    if (collegeId) {
      conditions.push(eq(collegeRankings.collegeId, parseInt(collegeId)))
    }
    if (rankingSource) {
      conditions.push(eq(collegeRankings.rankingSource, rankingSource))
    }
    if (year) {
      conditions.push(eq(collegeRankings.year, parseInt(year)))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    const rankingList = await query.orderBy(desc(collegeRankings.year), desc(collegeRankings.rank))

    return NextResponse.json({ rankings: rankingList })
  } catch (error) {
    console.error("Error fetching rankings:", error)
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    )
  }
}

// POST - Create new ranking
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
    const { collegeId, rankingSource, year, rank, category, score, metadata } = body

    // Validate required fields
    if (!collegeId || !rankingSource || !year || !rank) {
      return NextResponse.json(
        { error: "Missing required fields: collegeId, rankingSource, year, rank" },
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

    const [newRanking] = await db
      .insert(collegeRankings)
      .values({
        collegeId,
        rankingSource,
        year,
        rank,
        category: category || null,
        score: score ? parseInt(score) : null,
        metadata: metadata || {},
      })
      .returning()

    return NextResponse.json({ ranking: newRanking }, { status: 201 })
  } catch (error) {
    console.error("Error creating ranking:", error)
    return NextResponse.json(
      { error: "Failed to create ranking" },
      { status: 500 }
    )
  }
}

