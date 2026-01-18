import { db } from "@/db"
import { attendanceRecords, employees } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getDateString, validateDailyQRCode } from "./utils"
import { validateTodayQRCode } from "./dailyQR"

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
    const [updated] = await db
      .update(attendanceRecords)
      .set({
        checkOutTime: scanTime, // Always update to latest scan time
        updatedAt: new Date(),
      })
      .where(eq(attendanceRecords.id, existingRecord.id))
      .returning()

    const isFirstCheckOut = !existingRecord.checkOutTime

    return {
      success: true,
      type: isFirstCheckOut ? "check-out" : "check-out-updated",
      message: isFirstCheckOut 
        ? "Check-out recorded successfully" 
        : "Check-out time updated (last scan)",
      record: updated,
    }
  } else {
    // Create new check-in record
    const [newRecord] = await db
      .insert(attendanceRecords)
      .values({
        employeeId: emp.id,
        date: today,
        checkInTime: scanTime,
        status: "present",
        syncedToSheets: false,
      })
      .returning()

    return {
      success: true,
      type: "check-in",
      message: "Check-in recorded successfully",
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
