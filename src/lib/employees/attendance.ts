import { db } from "@/db"
import { attendanceRecords, employees } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getDateString, validateDailyQRCode } from "./utils"
import { validateTodayQRCode } from "./dailyQR"
import { calculateCheckInStatus, calculateCheckOutStatus } from "./shiftTiming"
import { syncToGoogleSheets } from "./googleSheets"

export interface RecordAttendanceData {
  employeeId: string
  qrCodeData: string
  scanTime: Date
}

export interface AttendanceResult {
  success: boolean
  type: "check-in" | "check-out" | "check-out-updated"
  message: string
  record?: any
}

/**
 * Record attendance for an employee
 * First scan of the day = Check-In
 * Subsequent scans on same day = Check-Out
 */
export async function recordAttendance(
  data: RecordAttendanceData
): Promise<AttendanceResult> {
  // Validate QR code is valid for today
  const isValidQR = await validateTodayQRCode(data.qrCodeData)
  if (!isValidQR) {
    return {
      success: false,
      type: "check-in",
      message: "Invalid or expired QR code",
    }
  }

  // Get employee by employeeId
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeId, data.employeeId))
    .limit(1)

  if (employee.length === 0) {
    return {
      success: false,
      type: "check-in",
      message: "Employee not found",
    }
  }

  if (!employee[0].isActive) {
    return {
      success: false,
      type: "check-in",
      message: "Employee is inactive",
    }
  }

  const emp = employee[0]
  const today = getDateString(data.scanTime)
  const scanTime = data.scanTime.toTimeString().split(' ')[0] // HH:MM:SS format

  // Get shift timing (use employee's shift timing or default global shift timing)
  // Default: 9 AM - 5 PM if not set
  const shiftStartTime = emp.shiftStartTime || "09:00:00"
  const shiftEndTime = emp.shiftEndTime || "17:00:00"
  const earlyThreshold = emp.earlyThresholdMinutes || 15
  const lateThreshold = emp.lateThresholdMinutes || 15

  // Check if employee already has a record for today
  const [existingRecord] = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.employeeId, emp.id),
        eq(attendanceRecords.date, today)
      )
    )
    .limit(1)

  if (existingRecord) {
    // Employee already has a record for today
    // If no check-out time, this scan becomes check-out
    // If already checked out, update check-out time (last scan = check-out)
    
    // Calculate check-out status based on shift timing
    const checkOutStatus = calculateCheckOutStatus(
      scanTime,
      shiftEndTime,
      earlyThreshold,
      lateThreshold
    )
    
    const [updated] = await db
      .update(attendanceRecords)
      .set({
        checkOutTime: scanTime, // Always update to latest scan time
        checkOutStatus: checkOutStatus, // Set check-out status
        updatedAt: new Date(),
      })
      .where(eq(attendanceRecords.id, existingRecord.id))
      .returning()

    const isFirstCheckOut = !existingRecord.checkOutTime

    // Sync to Google Sheets in background (don't await)
    syncToGoogleSheets({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      employeeEmail: emp.email,
      date: today,
      checkInTime: existingRecord.checkInTime,
      checkOutTime: scanTime,
      status: existingRecord.status,
      checkInStatus: existingRecord.checkInStatus,
      checkOutStatus: checkOutStatus,
    })
      .then((success) => {
        if (success) {
          // Update syncedToSheets flag in database
          db.update(attendanceRecords)
            .set({ syncedToSheets: true })
            .where(eq(attendanceRecords.id, updated.id))
            .catch((err) => console.error("[Attendance] Error updating syncedToSheets:", err))
        }
      })
      .catch((err) => console.error("[Attendance] Error syncing to Google Sheets:", err))

    return {
      success: true,
      type: isFirstCheckOut ? "check-out" : "check-out-updated",
      message: isFirstCheckOut 
        ? "Check-out recorded successfully" 
        : "Check-out time updated (last scan)",
      record: updated,
    }
  } else {
    // Calculate check-in status based on shift timing
    const checkInStatus = calculateCheckInStatus(
      scanTime,
      shiftStartTime,
      earlyThreshold,
      lateThreshold
    )

    // Determine overall status
    let overallStatus = "present"
    if (checkInStatus === "late") {
      overallStatus = "late"
    } else if (checkInStatus === "early") {
      overallStatus = "present" // Early is still present, just marked as early
    }

    // Create new check-in record
    const [newRecord] = await db
      .insert(attendanceRecords)
      .values({
        employeeId: emp.id,
        date: today,
        checkInTime: scanTime,
        status: overallStatus,
        checkInStatus: checkInStatus,
        syncedToSheets: false,
      })
      .returning()

    // Format message based on check-in status
    let message = "Check-in recorded successfully"
    if (checkInStatus === "early") {
      message = "Checked in early - Great job!"
    } else if (checkInStatus === "late") {
      message = "Checked in late"
    } else if (checkInStatus === "on-time") {
      message = "Checked in on time"
    }

    // Sync to Google Sheets in background (don't await)
    syncToGoogleSheets({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      employeeEmail: emp.email,
      date: today,
      checkInTime: scanTime,
      checkOutTime: null,
      status: overallStatus,
      checkInStatus: checkInStatus,
      checkOutStatus: null,
    })
      .then((success) => {
        if (success) {
          // Update syncedToSheets flag in database
          db.update(attendanceRecords)
            .set({ syncedToSheets: true })
            .where(eq(attendanceRecords.id, newRecord.id))
            .catch((err) => console.error("[Attendance] Error updating syncedToSheets:", err))
        }
      })
      .catch((err) => console.error("[Attendance] Error syncing to Google Sheets:", err))

    return {
      success: true,
      type: "check-in",
      message: message,
      record: newRecord,
    }
  }
}

/**
 * Get today's attendance status for an employee
 */
export async function getTodayAttendanceStatus(employeeId: string) {
  const employee = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeId, employeeId))
    .limit(1)

  if (employee.length === 0) {
    return null
  }

  const today = getDateString()
  const [record] = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.employeeId, employee[0].id),
        eq(attendanceRecords.date, today)
      )
    )
    .limit(1)

  if (!record) {
    return {
      checkedIn: false,
      checkedOut: false,
      checkInTime: null,
      checkOutTime: null,
    }
  }

  return {
    checkedIn: !!record.checkInTime,
    checkedOut: !!record.checkOutTime,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
  }
}
