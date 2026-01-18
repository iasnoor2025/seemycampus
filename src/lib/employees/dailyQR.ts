import { db } from "@/db"
import { dailyQRCodes } from "@/db/schema"
import { eq, and, gte } from "drizzle-orm"
import { generateDailyQRCode, getDateString, getEndOfDay } from "./utils"

/**
 * Get or create today's QR code
 */
export async function getTodayQRCode() {
  const today = new Date()
  const dateStr = getDateString(today)
  const expiresAt = getEndOfDay(today)

  // Try to get existing QR code for today
  const [existing] = await db
    .select()
    .from(dailyQRCodes)
    .where(eq(dailyQRCodes.date, dateStr))
    .limit(1)

  if (existing) {
    // Check if expired (shouldn't happen, but just in case)
    if (new Date(existing.expiresAt) < new Date()) {
      // Generate new QR code
      const { qrCode, token } = generateDailyQRCode(today)
      
      const [updated] = await db
        .update(dailyQRCodes)
        .set({
          qrCode,
          token,
          expiresAt,
          createdAt: new Date(),
        })
        .where(eq(dailyQRCodes.date, dateStr))
        .returning()

      return updated
    }

    return existing
  }

  // Create new QR code for today
  const { qrCode, token } = generateDailyQRCode(today)

  const [newQR] = await db
    .insert(dailyQRCodes)
    .values({
      date: dateStr,
      qrCode,
      token,
      expiresAt,
    })
    .returning()

  return newQR
}

/**
 * Validate QR code for today
 */
export async function validateTodayQRCode(qrCodeData: string): Promise<boolean> {
  try {
    const data = JSON.parse(qrCodeData)
    const today = new Date()
    const dateStr = getDateString(today)

    // Check if QR code is for today
    if (data.date !== dateStr) {
      return false
    }

    // Verify token exists in database
    const [qrCode] = await db
      .select()
      .from(dailyQRCodes)
      .where(eq(dailyQRCodes.date, dateStr))
      .limit(1)

    if (!qrCode) {
      return false
    }

    // Verify token matches
    return qrCode.token === data.token && qrCode.qrCode === qrCodeData
  } catch {
    return false
  }
}

/**
 * Clean up expired QR codes (older than 7 days)
 * This can be run as a cron job
 */
export async function cleanupExpiredQRCodes() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const dateStr = getDateString(sevenDaysAgo)

  // Delete QR codes older than 7 days
  // Note: This is a simple implementation - can be enhanced with proper date comparison
  // For now, we'll keep all QR codes for historical purposes
  // Can be enhanced later with a cleanup job that compares dates properly
}
