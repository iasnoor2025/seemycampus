import { NextResponse } from "next/server"
import { db } from "@/db"
import { entranceExams } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const exam = await db
      .select()
      .from(entranceExams)
      .where(eq(entranceExams.slug, slug))
      .limit(1)

    if (exam.length === 0) {
      return NextResponse.json({ error: "Entrance exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam[0])
  } catch (error: any) {
    console.error("Error fetching entrance exam:", error)
    return NextResponse.json({ error: "Failed to fetch entrance exam" }, { status: 500 })
  }
}

