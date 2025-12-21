import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { heroSlides } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get only active slides, ordered by display order
    const slides = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true))
      .orderBy(desc(heroSlides.displayOrder), desc(heroSlides.createdAt))

    return NextResponse.json({ slides })
  } catch (error) {
    console.error("Error fetching hero slides:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    )
  }
}

