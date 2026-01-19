/**
 * Google Sheets integration service
 * Sends attendance records to Google Apps Script web app for Google Sheets sync
 */

interface AttendanceRecordForSheets {
  employeeId: string
  employeeName: string
  employeeEmail: string
  date: string // YYYY-MM-DD
  checkInTime: string | null // HH:MM:SS
  checkOutTime: string | null // HH:MM:SS
  status: string // "present", "absent", "late"
  checkInStatus: string | null // "early", "on-time", "late"
  checkOutStatus: string | null // "early", "on-time", "late"
  totalHours?: string // Calculated hours worked (e.g., "8h 30m")
}

/**
 * Calculate total hours worked from check-in and check-out times
 */
function calculateTotalHours(checkInTime: string | null, checkOutTime: string | null): string {
  if (!checkInTime || !checkOutTime) return "--"
  
  try {
    const [inHours, inMinutes] = checkInTime.split(':').map(Number)
    const [outHours, outMinutes] = checkOutTime.split(':').map(Number)
    
    const checkInMinutes = inHours * 60 + inMinutes
    const checkOutMinutes = outHours * 60 + outMinutes
    
    // Handle case where check-out is next day (e.g., night shift)
    let diffMinutes = checkOutMinutes - checkInMinutes
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60 // Add 24 hours
    }
    
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    
    return `${hours}h ${minutes}m`
  } catch {
    return "--"
  }
}

/**
 * Send attendance record to Google Sheets via Google Apps Script
 * @param record - Attendance record to sync
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function syncToGoogleSheets(
  record: AttendanceRecordForSheets
): Promise<boolean> {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL

  if (!appsScriptUrl) {
    console.warn("[Google Sheets] GOOGLE_APPS_SCRIPT_URL not configured, skipping sync")
    return false
  }

  try {
    // Calculate total hours if both times are present
    const totalHours = calculateTotalHours(record.checkInTime, record.checkOutTime)

    const payload = {
      action: "writeAttendance",
      data: {
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        employeeEmail: record.employeeEmail,
        date: record.date,
        checkInTime: record.checkInTime || "",
        checkOutTime: record.checkOutTime || "",
        status: record.status,
        checkInStatus: record.checkInStatus || "",
        checkOutStatus: record.checkOutStatus || "",
        totalHours: totalHours,
      },
    }

    console.log(`[Google Sheets] Syncing attendance record: ${record.employeeName} - ${record.date}`)

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`[Google Sheets] Sync failed: ${response.status} - ${errorText}`)
      return false
    }

    const result = await response.json().catch(() => ({ success: false }))

    if (result.success) {
      console.log(`[Google Sheets] Successfully synced: ${record.employeeName} - ${record.date}`)
      return true
    } else {
      console.error(`[Google Sheets] Sync failed: ${result.error || "Unknown error"}`)
      return false
    }
  } catch (error: any) {
    // Handle timeout and network errors gracefully
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      console.error("[Google Sheets] Sync timeout - request took too long")
    } else if (error.message?.includes("fetch")) {
      console.error("[Google Sheets] Network error - could not reach Google Apps Script")
    } else {
      console.error("[Google Sheets] Sync error:", error.message || error)
    }
    return false
  }
}

/**
 * Batch sync multiple attendance records to Google Sheets
 * @param records - Array of attendance records to sync
 * @returns Promise<{ successCount: number, failedCount: number }>
 */
export async function batchSyncToGoogleSheets(
  records: AttendanceRecordForSheets[]
): Promise<{ successCount: number; failedCount: number }> {
  let successCount = 0
  let failedCount = 0

  // Sync records sequentially to avoid overwhelming the Google Apps Script
  for (const record of records) {
    const success = await syncToGoogleSheets(record)
    if (success) {
      successCount++
    } else {
      failedCount++
    }
    
    // Small delay between requests to avoid rate limiting
    if (records.length > 1) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // 500ms delay
    }
  }

  return { successCount, failedCount }
}
