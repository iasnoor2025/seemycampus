import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { counselors } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const activeCounselors = await db
      .select()
      .from(counselors)
      .where(eq(counselors.isActive, true))

    return NextResponse.json({ counselors: activeCounselors })
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

