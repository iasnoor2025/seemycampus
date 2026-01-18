import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendanceRecords, employees } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET all attendance records (admin only)
export async function GET(request: NextRequest) {
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

    // Fetch all attendance records with employee information
    const records = await db
      .select({
        id: attendanceRecords.id,
        employeeId: attendanceRecords.employeeId,
        date: attendanceRecords.date,
        checkInTime: attendanceRecords.checkInTime,
        checkOutTime: attendanceRecords.checkOutTime,
        status: attendanceRecords.status,
        syncedToSheets: attendanceRecords.syncedToSheets,
        createdAt: attendanceRecords.createdAt,
        employeeName: employees.name,
        employeeEmail: employees.email,
      })
      .from(attendanceRecords)
      .innerJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .orderBy(desc(attendanceRecords.date), desc(attendanceRecords.checkInTime))

    return NextResponse.json({
      success: true,
      records: records.map((record) => ({
        id: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        employeeEmail: record.employeeEmail,
        date: record.date, // Already in YYYY-MM-DD format (string from PostgreSQL date type)
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        status: record.status,
        syncedToSheets: record.syncedToSheets,
        createdAt: record.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
