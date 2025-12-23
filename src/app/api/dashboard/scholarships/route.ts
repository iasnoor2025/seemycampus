import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { scholarships, colleges } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"

// GET - Fetch all scholarships for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const getAll = searchParams.get("all") === "true"

    let query = db
      .select({
        scholarship: scholarships,
        college: colleges,
      })
      .from(scholarships)
      .leftJoin(colleges, eq(scholarships.collegeId, colleges.id))
      .orderBy(desc(scholarships.displayOrder), desc(scholarships.createdAt))

    if (!getAll) {
      query = query.limit(100) as any
    }

    const results = await query

    const scholarshipsList = results.map((item) => ({
      ...item.scholarship,
      college: item.college,
    }))

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(scholarships)
    const totalCount = Number(totalCountResult[0]?.count || 0)

    return NextResponse.json({
      scholarships: scholarshipsList,
      pagination: {
        totalCount,
      },
    })
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    return NextResponse.json(
      { error: "Failed to fetch scholarships" },
      { status: 500 }
    )
  }
}

// POST - Create a new scholarship
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }

    const [newScholarship] = await db
      .insert(scholarships)
      .values({
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
      })
      .returning()

    return NextResponse.json(newScholarship, { status: 201 })
  } catch (error: any) {
    console.error("Error creating scholarship:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Scholarship with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create scholarship" },
      { status: 500 }
    )
  }
}

