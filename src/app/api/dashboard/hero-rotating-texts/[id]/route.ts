import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { heroRotatingTexts } from "@/db/schema"
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

    const { id } = await params
    const textId = parseInt(id)
    if (isNaN(textId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const [text] = await db
      .select()
      .from(heroRotatingTexts)
      .where(eq(heroRotatingTexts.id, textId))

    if (!text) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 })
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error fetching hero rotating text:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero rotating text" },
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

    const { id } = await params
    const textId = parseInt(id)
    if (isNaN(textId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { text, displayOrder, isActive } = body

    if (text !== undefined && (!text || text.trim() === "")) {
      return NextResponse.json(
        { error: "Text cannot be empty" },
        { status: 400 }
      )
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (text !== undefined) {
      updateData.text = text.trim()
    }
    if (displayOrder !== undefined) {
      updateData.displayOrder = displayOrder
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const [updatedText] = await db
      .update(heroRotatingTexts)
      .set(updateData)
      .where(eq(heroRotatingTexts.id, textId))
      .returning()

    if (!updatedText) {
      return NextResponse.json({ error: "Text not found" }, { status: 404 })
    }

    return NextResponse.json({ text: updatedText })
  } catch (error) {
    console.error("Error updating hero rotating text:", error)
    return NextResponse.json(
      { error: "Failed to update hero rotating text" },
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

    const { id } = await params
    const textId = parseInt(id)
    if (isNaN(textId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    await db.delete(heroRotatingTexts).where(eq(heroRotatingTexts.id, textId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting hero rotating text:", error)
    return NextResponse.json(
      { error: "Failed to delete hero rotating text" },
      { status: 500 }
    )
  }
}

