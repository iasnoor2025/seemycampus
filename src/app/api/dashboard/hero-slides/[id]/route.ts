import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { heroSlides } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 })
    }

    const [slide] = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.id, id))
      .limit(1)

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ slide })
  } catch (error) {
    console.error("Error fetching hero slide:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero slide" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 })
    }

    const body = await request.json()
    const { title, subtitle, imageUrl, buttonText, buttonLink, displayOrder, isActive } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    const [updatedSlide] = await db
      .update(heroSlides)
      .set({
        title: title || null,
        subtitle: subtitle || null,
        imageUrl,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        displayOrder: displayOrder !== undefined ? displayOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(heroSlides.id, id))
      .returning()

    if (!updatedSlide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ slide: updatedSlide })
  } catch (error) {
    console.error("Error updating hero slide:", error)
    return NextResponse.json(
      { error: "Failed to update hero slide" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 })
    }

    await db.delete(heroSlides).where(eq(heroSlides.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting hero slide:", error)
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    )
  }
}

