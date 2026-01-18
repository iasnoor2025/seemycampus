import crypto from "crypto"

/**
 * Generate daily QR code data
 * Returns a JSON string with date and validation token
 * This QR code is used by ALL employees for the day
 */
export function generateDailyQRCode(date: Date): { qrCode: string; token: string } {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  const token = crypto.randomBytes(32).toString("hex")
  
  const qrData = {
    type: "attendance",
    date: dateStr,
    token,
  }
  
  return {
    qrCode: JSON.stringify(qrData),
    token,
  }
}

/**
 * Validate daily QR code data
 */
export function validateDailyQRCode(qrCode: string, expectedDate: Date): boolean {
  try {
    const data = JSON.parse(qrCode)
    const expectedDateStr = expectedDate.toISOString().split('T')[0]
    
    return (
      data.type === "attendance" &&
      data.date === expectedDateStr &&
      data.token &&
      typeof data.token === "string"
    )
  } catch {
    return false
  }
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get end of day timestamp (23:59:59)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay
}

/**
 * Generate a default password for new employees
 * Returns a random 8-character password
 */
export function generateDefaultPassword(): string {
  return crypto.randomBytes(4).toString("hex")
}
