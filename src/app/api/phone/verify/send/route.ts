import { NextRequest, NextResponse } from "next/server"
import { generateOTP, sendOTP, storeOTP } from "@/lib/sms/otp"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    // Validate phone format (10 digits, Indian format)
    const phoneDigits = phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()

    // Store OTP in database
    await storeOTP(phoneDigits, otp)

    // Send OTP via SMS
    const sent = await sendOTP(phoneDigits, otp)

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}

