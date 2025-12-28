import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { counselors } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("active") !== "false"
    const session = await auth()
    const isAdmin = session?.user?.role === "admin"

    // Admins can see all, public only sees active
    const baseQuery = db.select().from(counselors)
    const query = (activeOnly && !isAdmin)
      ? baseQuery.where(eq(counselors.isActive, true))
      : baseQuery

    const allCounselors = await query

    return NextResponse.json({ counselors: allCounselors })
  } catch (error: any) {
    console.error("Error fetching counselors:", error)
    return NextResponse.json(
      { error: "Failed to fetch counselors" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      bio,
      specialization = [],
      experience,
      qualifications = [],
      imageUrl,
      isActive = true,
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const [newCounselor] = await db
      .insert(counselors)
      .values({
        name,
        email,
        phone: phone || null,
        bio: bio || null,
        specialization,
        experience: experience || null,
        qualifications,
        imageUrl: imageUrl || null,
        isActive,
      })
      .returning()

    return NextResponse.json({ counselor: newCounselor }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating counselor:", error)
    return NextResponse.json(
      { error: "Failed to create counselor" },
      { status: 500 }
    )
  }
}

