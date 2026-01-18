import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getTodayQRCode } from "@/lib/employees/dailyQR"

// GET current day's QR code
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Allow both employees and admins to get the QR code
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const isEmployee = userRole === "employee"
    const isAdmin = userRole === "admin"

    if (!isEmployee && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

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
