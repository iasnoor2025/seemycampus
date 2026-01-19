import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendanceRecords } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// DELETE attendance record (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = (session.user as any)?.role
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params
    const recordId = parseInt(id)

    if (isNaN(recordId)) {
      return NextResponse.json(
        { error: "Invalid record ID" },
        { status: 400 }
      )
    }

    // Check if record exists
    const [existingRecord] = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.id, recordId))
      .limit(1)

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      )
    }

    // Delete the record
    await db
      .delete(attendanceRecords)
      .where(eq(attendanceRecords.id, recordId))

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting attendance record:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
