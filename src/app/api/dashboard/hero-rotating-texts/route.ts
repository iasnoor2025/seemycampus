import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { heroRotatingTexts } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const texts = await db
      .select()
      .from(heroRotatingTexts)
      .orderBy(desc(heroRotatingTexts.displayOrder), desc(heroRotatingTexts.createdAt))

    return NextResponse.json({ texts })
  } catch (error) {
    console.error("Error fetching hero rotating texts:", error)
    return NextResponse.json(
      { error: "Failed to fetch hero rotating texts" },
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
    const { text, displayOrder = 0, isActive = true } = body

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    const [newText] = await db
      .insert(heroRotatingTexts)
      .values({
        text: text.trim(),
        displayOrder,
        isActive,
      })
      .returning()

    return NextResponse.json({ text: newText }, { status: 201 })
  } catch (error) {
    console.error("Error creating hero rotating text:", error)
    return NextResponse.json(
      { error: "Failed to create hero rotating text" },
      { status: 500 }
    )
  }
}

