import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { placementStats, colleges } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET - Fetch placement stats (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collegeId = searchParams.get("collegeId")
    const year = searchParams.get("year")

    let query = db.select().from(placementStats)

    const conditions = []
    if (collegeId) {
      conditions.push(eq(placementStats.collegeId, parseInt(collegeId)))
    }
    if (year) {
      conditions.push(eq(placementStats.year, parseInt(year)))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    const placementList = await query.orderBy(desc(placementStats.year))

    return NextResponse.json({ placements: placementList })
  } catch (error) {
    console.error("Error fetching placements:", error)
    return NextResponse.json(
      { error: "Failed to fetch placements" },
      { status: 500 }
    )
  }
}

// POST - Create new placement stat
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
      year,
      totalStudents,
      placedStudents,
      placementPercentage,
      averagePackage,
      medianPackage,
      highestPackage,
      lowestPackage,
      topRecruiters,
      departmentWiseData,
    } = body

    // Validate required fields
    if (!collegeId || !year) {
      return NextResponse.json(
        { error: "Missing required fields: collegeId, year" },
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

    const [newPlacement] = await db
      .insert(placementStats)
      .values({
        collegeId,
        year,
        totalStudents: totalStudents ? parseInt(totalStudents) : null,
        placedStudents: placedStudents ? parseInt(placedStudents) : null,
        placementPercentage: placementPercentage ? parseInt(placementPercentage) : null,
        averagePackage: averagePackage ? parseInt(averagePackage) : null,
        medianPackage: medianPackage ? parseInt(medianPackage) : null,
        highestPackage: highestPackage ? parseInt(highestPackage) : null,
        lowestPackage: lowestPackage ? parseInt(lowestPackage) : null,
        topRecruiters: topRecruiters || [],
        departmentWiseData: departmentWiseData || {},
      })
      .returning()

    return NextResponse.json({ placement: newPlacement }, { status: 201 })
  } catch (error) {
    console.error("Error creating placement:", error)
    return NextResponse.json(
      { error: "Failed to create placement" },
      { status: 500 }
    )
  }
}

