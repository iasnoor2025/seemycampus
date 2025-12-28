import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { counselingPackages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("active") !== "false"

    const baseQuery = db.select().from(counselingPackages)
    const query = activeOnly
      ? baseQuery.where(eq(counselingPackages.isActive, true))
      : baseQuery

    const packages = await query

    return NextResponse.json({ packages })
  } catch (error: any) {
    console.error("Error fetching counseling packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch counseling packages" },
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
      slug,
      description,
      price,
      currency = "INR",
      duration,
      sessions,
      features = [],
      displayOrder = 0,
      isActive = true,
    } = body

    if (!name || !slug || !price || !duration || !sessions) {
      return NextResponse.json(
        { error: "Name, slug, price, duration, and sessions are required" },
        { status: 400 }
      )
    }

    const [newPackage] = await db
      .insert(counselingPackages)
      .values({
        name,
        slug,
        description,
        price,
        currency,
        duration,
        sessions,
        features,
        displayOrder,
        isActive,
      })
      .returning()

    return NextResponse.json({ package: newPackage }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating counseling package:", error)
    return NextResponse.json(
      { error: "Failed to create counseling package" },
      { status: 500 }
    )
  }
}

