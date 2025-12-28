import { db } from "@/db"
import { phoneVerifications } from "@/db/schema"
import { eq, and, gt } from "drizzle-orm"

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via SMS
 * In production, integrate with SMS service like Twilio, MSG91, or TextLocal
 */
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  try {
    // TODO: Integrate with actual SMS service
    // For now, we'll log it and return true (demo mode)
    // In production, use a service like:
    // - Twilio: https://www.twilio.com/
    // - MSG91: https://msg91.com/ (Popular in India)
    // - TextLocal: https://www.textlocal.in/ (Popular in India)
    
    console.log(`[SMS] Sending OTP ${otp} to ${phone}`)
    
    // Example with Twilio (uncomment when configured):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio credentials not configured")
    }
    
    const client = require('twilio')(accountSid, authToken)
    
    await client.messages.create({
      body: `Your SeeMyCampus verification code is: ${otp}. Valid for 10 minutes.`,
      from: fromNumber,
      to: phone
    })
    */
    
    // Example with MSG91 (uncomment when configured):
    /*
    const authKey = process.env.MSG91_AUTH_KEY
    const senderId = process.env.MSG91_SENDER_ID
    
    if (!authKey || !senderId) {
      throw new Error("MSG91 credentials not configured")
    }
    
    const response = await fetch(`https://api.msg91.com/api/v5/otp?template_id=YOUR_TEMPLATE_ID&mobile=${phone}&authkey=${authKey}&otp=${otp}`)
    */
    
    // For demo/development: Always return true
    // In production, check the SMS service response
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

