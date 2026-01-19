/**
 * Shift timing utilities for calculating early/late check-in status
 */

/**
 * Calculate check-in status based on shift timing
 * @param checkInTime - Check-in time in HH:MM:SS format
 * @param shiftStartTime - Shift start time in HH:MM:SS format (optional)
 * @param earlyThresholdMinutes - Minutes before shift start to be considered "early" (default: 15)
 * @param lateThresholdMinutes - Minutes after shift start to be considered "late" (default: 15)
 * @returns "early" | "on-time" | "late" | null (if no shift timing set)
 */
export function calculateCheckInStatus(
  checkInTime: string,
  shiftStartTime?: string | null,
  earlyThresholdMinutes: number = 15,
  lateThresholdMinutes: number = 15
): "early" | "on-time" | "late" | null {
  if (!shiftStartTime) {
    return null // No shift timing set
  }

  // Parse times to minutes since midnight
  const checkInMinutes = timeToMinutes(checkInTime)
  const shiftStartMinutes = timeToMinutes(shiftStartTime)

  if (checkInMinutes === null || shiftStartMinutes === null) {
    return null // Invalid time format
  }

  const diffMinutes = checkInMinutes - shiftStartMinutes

  if (diffMinutes <= -earlyThresholdMinutes) {
    return "early"
  } else if (diffMinutes > lateThresholdMinutes) {
    return "late"
  } else {
    return "on-time"
  }
}

/**
 * Convert time string (HH:MM:SS) to minutes since midnight
 */
function timeToMinutes(timeStr: string): number | null {
  try {
    const parts = timeStr.split(":")
    if (parts.length < 2) {
      return null
    }

    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    const seconds = parts.length > 2 ? parseInt(parts[2], 10) : 0

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return null
    }

    return hours * 60 + minutes + seconds / 60
  } catch {
    return null
  }
}

/**
 * Calculate check-out status based on shift timing
 * @param checkOutTime - Check-out time in HH:MM:SS format
 * @param shiftEndTime - Shift end time in HH:MM:SS format (optional)
 * @param earlyThresholdMinutes - Minutes before shift end to be considered "early" (default: 15)
 * @param lateThresholdMinutes - Minutes after shift end to be considered "late" (default: 15)
 * @returns "early" | "on-time" | "late" | null (if no shift timing set)
 */
export function calculateCheckOutStatus(
  checkOutTime: string,
  shiftEndTime?: string | null,
  earlyThresholdMinutes: number = 15,
  lateThresholdMinutes: number = 15
): "early" | "on-time" | "late" | null {
  if (!shiftEndTime) {
    return null // No shift timing set
  }

  // Parse times to minutes since midnight
  const checkOutMinutes = timeToMinutes(checkOutTime)
  const shiftEndMinutes = timeToMinutes(shiftEndTime)

  if (checkOutMinutes === null || shiftEndMinutes === null) {
    return null // Invalid time format
  }

  const diffMinutes = checkOutMinutes - shiftEndMinutes

  // For check-out: early means leaving before shift end, late means leaving after shift end
  if (diffMinutes < -earlyThresholdMinutes) {
    return "early" // Left too early (more than threshold minutes before shift end)
  } else if (diffMinutes > lateThresholdMinutes) {
    return "late" // Left late (more than threshold minutes after shift end)
  } else {
    return "on-time" // Left within acceptable time window
  }
}

/**
 * Format check-in status message
 */
export function formatCheckInStatusMessage(
  status: "early" | "on-time" | "late" | null,
  checkInTime: string,
  shiftStartTime?: string | null
): string {
  if (!status || !shiftStartTime) {
    return "Checked in"
  }

  switch (status) {
    case "early":
      return "Checked in early"
    case "late":
      return "Checked in late"
    case "on-time":
      return "Checked in on time"
    default:
      return "Checked in"
  }
}
