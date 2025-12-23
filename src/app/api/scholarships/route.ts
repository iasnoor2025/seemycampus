import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { scholarships, colleges } from "@/db/schema"
import { eq, ilike, and, desc, or } from "drizzle-orm"

// GET - List scholarships with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const level = searchParams.get("level")
    const collegeId = searchParams.get("collegeId")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    // Build conditions array
    const conditions = []
    if (activeOnly) {
      conditions.push(eq(scholarships.isActive, true))
    }
    if (search) {
      conditions.push(
        or(
          ilike(scholarships.title, `%${search}%`),
          ilike(scholarships.description, `%${search}%`),
          ilike(scholarships.provider, `%${search}%`)
        )!
      )
    }
    if (category) {
      conditions.push(eq(scholarships.category, category))
    }
    if (level) {
      conditions.push(eq(scholarships.level, level))
    }
    if (collegeId) {
      conditions.push(eq(scholarships.collegeId, parseInt(collegeId)))
    }

    // Build query with all conditions at once
    const results = await db
      .select({
        scholarship: scholarships,
        college: colleges,
      })
      .from(scholarships)
      .leftJoin(colleges, eq(scholarships.collegeId, colleges.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(scholarships.displayOrder), desc(scholarships.createdAt))

    const scholarshipsList = results.map((item) => ({
      ...item.scholarship,
      college: item.college,
    }))

    return NextResponse.json({
      scholarships: scholarshipsList,
      total: scholarshipsList.length,
    })
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    return NextResponse.json(
      { error: "Failed to fetch scholarships" },
      { status: 500 }
    )
  }
}

// POST - Create a new scholarship (admin only)
export async function POST(request: NextRequest) {
  try {
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

