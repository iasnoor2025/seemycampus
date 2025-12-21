import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { testimonials } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

// GET - Fetch active testimonials for public display
export async function GET(request: NextRequest) {
  try {
    const testimonialsList = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(desc(testimonials.displayOrder), desc(testimonials.createdAt))

    return NextResponse.json({
      testimonials: testimonialsList,
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    )
  }
}

