import { NextResponse } from "next/server"
import { db } from "@/db"
import { heroRotatingTexts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const texts = await db
      .select()
      .from(heroRotatingTexts)
      .where(eq(heroRotatingTexts.isActive, true))
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

