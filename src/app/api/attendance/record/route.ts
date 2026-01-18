import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { recordAttendance } from "@/lib/employees/attendance"

// POST record attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qrCodeData, scanTime, employeeId: bodyEmployeeId } = body

    // Check for token-based auth (Flutter app) or session-based auth (web)
    const authHeader = request.headers.get("authorization")
    let employeeId = bodyEmployeeId

    if (authHeader?.startsWith("Bearer ")) {
      // Token-based auth for Flutter app
      // In production, validate the token properly
      // For now, we trust the employeeId from the body if token is present
      if (!employeeId) {
        return NextResponse.json(
          { error: "Employee ID is required" },
          { status: 400 }
        )
      }
    } else {
      // Session-based auth for web
      const session = await auth()

      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const userRole = (session.user as any)?.role
      const isEmployee = userRole === "employee"
      const sessionEmployeeId = (session.user as any)?.employeeId

      if (!isEmployee) {
        return NextResponse.json(
          { error: "Only employees can record attendance" },
          { status: 403 }
        )
      }

      employeeId = sessionEmployeeId || bodyEmployeeId
    }

    if (!qrCodeData) {
      return NextResponse.json(
        { error: "QR code data is required" },
        { status: 400 }
      )
    }

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      )
    }

    const scanDateTime = scanTime ? new Date(scanTime) : new Date()

    const result = await recordAttendance({
      employeeId,
      qrCodeData,
      scanTime: scanDateTime,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      type: result.type,
      message: result.message,
      record: result.record,
    })
  } catch (error: any) {
    console.error("Error recording attendance:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
