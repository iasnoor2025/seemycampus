import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendanceRecords, employees } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { batchSyncToGoogleSheets } from "@/lib/employees/googleSheets"

// POST sync pending attendance records to Google Sheets (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all records that haven't been synced to Google Sheets
    const pendingRecords = await db
      .select({
        id: attendanceRecords.id,
        employeeId: attendanceRecords.employeeId,
        date: attendanceRecords.date,
        checkInTime: attendanceRecords.checkInTime,
        checkOutTime: attendanceRecords.checkOutTime,
        status: attendanceRecords.status,
        checkInStatus: attendanceRecords.checkInStatus,
        checkOutStatus: attendanceRecords.checkOutStatus,
        employeeName: employees.name,
        employeeEmail: employees.email,
        employeeEmployeeId: employees.employeeId,
      })
      .from(attendanceRecords)
      .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .where(eq(attendanceRecords.syncedToSheets, false))
      .limit(100) // Limit to 100 records per sync to avoid timeout

    if (pendingRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending records to sync",
        syncedCount: 0,
        failedCount: 0,
      })
    }

    // Format records for Google Sheets sync
    const recordsForSheets = pendingRecords.map((record) => {
      let dateString: string
      if (record.date instanceof Date) {
        dateString = record.date.toISOString().split("T")[0]
      } else if (typeof record.date === "string") {
        dateString = record.date
      } else {
        dateString = String(record.date)
      }

      return {
        employeeId: record.employeeEmployeeId || String(record.employeeId),
        employeeName: record.employeeName || "Unknown",
        employeeEmail: record.employeeEmail || "",
        date: dateString,
        checkInTime: record.checkInTime || null,
        checkOutTime: record.checkOutTime || null,
        status: record.status,
        checkInStatus: record.checkInStatus || null,
        checkOutStatus: record.checkOutStatus || null,
      }
    })

    // Sync to Google Sheets
    const { successCount, failedCount } = await batchSyncToGoogleSheets(recordsForSheets)

    // Update syncedToSheets flag for successfully synced records
    if (successCount > 0) {
      const syncedIds = pendingRecords
        .slice(0, successCount)
        .map((r) => r.id)

      for (const id of syncedIds) {
        await db
          .update(attendanceRecords)
          .set({ syncedToSheets: true })
          .where(eq(attendanceRecords.id, id))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${successCount} records to Google Sheets${failedCount > 0 ? `, ${failedCount} failed` : ""}`,
      syncedCount: successCount,
      failedCount: failedCount,
      totalPending: pendingRecords.length,
    })
  } catch (error: any) {
    console.error("Error syncing to Google Sheets:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
