import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { colleges } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET - Fetch a single college
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
      .where(eq(colleges.id, collegeId))
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

// PUT - Update a college
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
    const collegeId = parseInt(id)

    if (isNaN(collegeId)) {
      return NextResponse.json(
        { error: "Invalid college ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, slug, location, city, state, country, description, website, email, phone, isAcademicAlliance, isEnabled, images, googlePlaceId, ranking, establishedYear, averagePackage, accreditation, entranceExams } = body

    const [updatedCollege] = await db
      .update(colleges)
      .set({
        name,
        slug,
        location,
        city,
        state,
        country,
        description,
        website,
        email,
        phone,
        isAcademicAlliance,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        images: images || [],
        googlePlaceId: googlePlaceId || null,
        ranking: ranking !== undefined && ranking !== null && ranking !== "" ? parseInt(ranking) : null,
        establishedYear: establishedYear !== undefined && establishedYear !== null && establishedYear !== "" ? parseInt(establishedYear) : null,
        averagePackage: averagePackage !== undefined && averagePackage !== null && averagePackage !== "" ? parseInt(averagePackage) : null,
        accreditation: accreditation || null,
        entranceExams: entranceExams || [],
        updatedAt: new Date(),
      })
      .where(eq(colleges.id, collegeId))
      .returning()

    if (!updatedCollege) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCollege)
  } catch (error: any) {
    console.error("Error updating college:", error)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "College with this slug already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 }
    )
  }
}

// PATCH - Partially update a college (for enable/disable)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const collegeId = parseInt(id)

    if (isNaN(collegeId)) {
      return NextResponse.json(
        { error: "Invalid college ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.isEnabled !== undefined) {
      updateData.isEnabled = body.isEnabled
    }

    const [updatedCollege] = await db
      .update(colleges)
      .set(updateData)
      .where(eq(colleges.id, collegeId))
      .returning()

    if (!updatedCollege) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCollege)
  } catch (error) {
    console.error("Error updating college:", error)
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a college
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
    const collegeId = parseInt(id)

    if (isNaN(collegeId)) {
      return NextResponse.json(
        { error: "Invalid college ID" },
        { status: 400 }
      )
    }

    const [deletedCollege] = await db
      .delete(colleges)
      .where(eq(colleges.id, collegeId))
      .returning()

    if (!deletedCollege) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "College deleted successfully" })
  } catch (error) {
    console.error("Error deleting college:", error)
    return NextResponse.json(
      { error: "Failed to delete college" },
      { status: 500 }
    )
  }
}

