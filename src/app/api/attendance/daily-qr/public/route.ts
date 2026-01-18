import { NextRequest, NextResponse } from "next/server"
import { getTodayQRCode } from "@/lib/employees/dailyQR"

// GET current day's QR code (Public - no authentication required)
export async function GET(request: NextRequest) {
  try {
    const qrCode = await getTodayQRCode()

    return NextResponse.json({
      success: true,
      qrCode: qrCode.qrCode,
      date: qrCode.date,
      expiresAt: qrCode.expiresAt,
    })
  } catch (error: any) {
    console.error("Error fetching daily QR code:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
