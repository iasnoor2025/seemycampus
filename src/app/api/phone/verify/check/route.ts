import { NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/sms/otp"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp } = body

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      )
    }

    // Clean phone number
    const phoneDigits = phone.replace(/\D/g, "")

    // Verify OTP
    const isValid = await verifyOTP(phoneDigits, otp)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new one." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}

