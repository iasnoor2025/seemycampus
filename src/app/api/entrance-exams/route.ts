import { NextResponse } from "next/server"
import { db } from "@/db"
import { entranceExams } from "@/db/schema"
import { asc, eq } from "drizzle-orm"

export async function GET() {
  try {
    const exams = await db
      .select()
      .from(entranceExams)
      .where(eq(entranceExams.isActive, true))
      .orderBy(asc(entranceExams.examDate))

    return NextResponse.json(exams)
  } catch (error: any) {
    console.error("Error fetching entrance exams:", error)
    return NextResponse.json({ error: "Failed to fetch entrance exams" }, { status: 500 })
  }
}

