import { db } from "@/db"
import { phoneVerifications } from "@/db/schema"
import { eq, and, gt, gte } from "drizzle-orm"
import { getSMSConfig } from "./config"

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via SMS
 * Uses database configuration first, then falls back to environment variables
 */
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    const config = await getSMSConfig()
    const providerType = config.providerType

    // Demo mode - just log
    if (providerType === "demo") {
      console.log(`[SMS Demo] Sending OTP ${otp} to ${phone}`)
      return true
    }

    // Twilio
    if (providerType === "twilio") {
      const accountSid = config.twilioAccountSid
      const authToken = config.twilioAuthToken
      const fromNumber = config.twilioPhoneNumber

      if (!accountSid || !authToken || !fromNumber) {
        console.error("Twilio credentials not configured")
        return false
      }

      try {
        // Dynamic import to avoid bundling Twilio in client code
        const twilio = await import("twilio")
        const client = twilio.default(accountSid, authToken)

        await client.messages.create({
          body: `Your SeeMyCampus verification code is: ${otp}. Valid for 10 minutes.`,
          from: fromNumber,
          to: phone,
        })

        console.log(`[SMS Twilio] OTP sent to ${phone}`)
        return true
      } catch (error: any) {
        console.error("Twilio SMS error:", error)
        return false
      }
    }

    // MSG91
    if (providerType === "msg91") {
      const authKey = config.msg91AuthKey
      const senderId = config.msg91SenderId

      if (!authKey || !senderId) {
        console.error("MSG91 credentials not configured")
        return false
      }

      try {
        // MSG91 OTP API
        const response = await fetch(
          `https://api.msg91.com/api/v5/otp?template_id=YOUR_TEMPLATE_ID&mobile=${phone}&authkey=${authKey}&otp=${otp}`,
          {
            method: "GET",
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error("MSG91 SMS error:", errorText)
          return false
        }

        console.log(`[SMS MSG91] OTP sent to ${phone}`)
        return true
      } catch (error: any) {
        console.error("MSG91 SMS error:", error)
        return false
      }
    }

    // TextLocal
    if (providerType === "textlocal") {
      const apiKey = config.textlocalApiKey
      const senderId = config.textlocalSenderId

      if (!apiKey || !senderId) {
        console.error("TextLocal credentials not configured")
        return false
      }

      try {
        // TextLocal SMS API
        const response = await fetch("https://api.textlocal.in/send/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apikey: apiKey,
            numbers: phone,
            message: `Your SeeMyCampus verification code is: ${otp}. Valid for 10 minutes.`,
            sender: senderId,
          }),
        })

        const data = await response.json()

        if (data.status !== "success") {
          console.error("TextLocal SMS error:", data)
          return false
        }

        console.log(`[SMS TextLocal] OTP sent to ${phone}`)
        return true
      } catch (error: any) {
        console.error("TextLocal SMS error:", error)
        return false
      }
    }

    // Unknown provider
    console.warn(`Unknown SMS provider: ${providerType}, using demo mode`)
    console.log(`[SMS Demo] Sending OTP ${otp} to ${phone}`)
    return true
  } catch (error) {
    console.error("Error sending OTP:", error)
    return false
  }
}

/**
 * Store OTP in database
 */
export async function storeOTP(phone: string, otp: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10) // OTP valid for 10 minutes
  
  // Delete any existing unverified OTPs for this phone
  await db
    .delete(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, phone),
        eq(phoneVerifications.verified, false)
      )
    )
  
  // Insert new OTP
  await db.insert(phoneVerifications).values({
    phone,
    otp,
    expiresAt,
    verified: false,
  })
}

/**
 * Verify OTP
 */
export async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  const [verification] = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, phone),
        eq(phoneVerifications.otp, otp),
        eq(phoneVerifications.verified, false),
        gt(phoneVerifications.expiresAt, new Date())
      )
    )
    .limit(1)
  
  if (!verification) {
    return false
  }
  
  // Mark as verified
  await db
    .update(phoneVerifications)
    .set({ verified: true })
    .where(eq(phoneVerifications.id, verification.id))
  
  return true
}

/**
 * Check if phone is already verified
 */
export async function isPhoneVerified(phone: string): Promise<boolean> {
  const [verification] = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, phone),
        eq(phoneVerifications.verified, true)
      )
    )
    .limit(1)
  
  return !!verification
}

/**
 * Check if OTP can be sent (rate limiting)
 * Returns true if OTP can be sent, false if rate limited
 */
export async function canSendOTP(phone: string, maxAttempts: number = 3, windowMinutes: number = 15): Promise<boolean> {
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - windowMinutes)
  
  // Count OTPs sent in the time window
  const recentOTPs = await db
    .select()
    .from(phoneVerifications)
    .where(
      and(
        eq(phoneVerifications.phone, phone),
        gte(phoneVerifications.createdAt, windowStart)
      )
    )
  
  return recentOTPs.length < maxAttempts
}

/**
 * Get OTP statistics for a phone number
 */
export async function getOTPStats(phone: string) {
  const allOTPs = await db
    .select()
    .from(phoneVerifications)
    .where(eq(phoneVerifications.phone, phone))
    .orderBy(phoneVerifications.createdAt)
  
  const verified = allOTPs.filter(otp => otp.verified).length
  const total = allOTPs.length
  
  return {
    total,
    verified,
    unverified: total - verified,
    lastSent: allOTPs[allOTPs.length - 1]?.createdAt || null,
  }
}

