import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { testimonials } from "@/db/schema"
import { desc } from "drizzle-orm"

// GET - Fetch all testimonials
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const testimonialsList = await db
      .select()
      .from(testimonials)
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

// POST - Create a new testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, testimonial, photoUrl, avatarColor, date, displayOrder, isActive } = body

    if (!name || !testimonial) {
      return NextResponse.json(
        { error: "Name and testimonial are required" },
        { status: 400 }
      )
    }

    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        name,
        testimonial,
        photoUrl: photoUrl || null,
        avatarColor: avatarColor || "blue",
        date: date ? new Date(date) : new Date(),
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning()

    return NextResponse.json(newTestimonial, { status: 201 })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    )
  }
}

