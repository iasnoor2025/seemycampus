import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { heroSlides } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const slides = await db
      .select()
      .from(heroSlides)
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, subtitle, imageUrl, buttonText, buttonLink, displayOrder, isActive } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    const [slide] = await db
      .insert(heroSlides)
      .values({
        title: title || null,
        subtitle: subtitle || null,
        imageUrl,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning()

    return NextResponse.json({ slide }, { status: 201 })
  } catch (error) {
    console.error("Error creating hero slide:", error)
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    )
  }
}

