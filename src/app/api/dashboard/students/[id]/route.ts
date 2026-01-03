import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { studentAnswers } from "@/db/schema"
import { eq } from "drizzle-orm"

// DELETE - Delete a student quiz response
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
    const studentId = parseInt(id)

    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    await db.delete(studentAnswers).where(eq(studentAnswers.id, studentId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting student answer:", error)
    return NextResponse.json(
      { error: "Failed to delete student answer" },
      { status: 500 }
    )
  }
}


