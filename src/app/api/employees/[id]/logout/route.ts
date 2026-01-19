import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { employees } from "@/db/schema"
import { eq } from "drizzle-orm"

// POST logout employee (admin only)
// Clears device info and last login to force re-login
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const employeeId = parseInt(id)

    if (isNaN(employeeId)) {
      return NextResponse.json(
        { error: "Invalid employee ID" },
        { status: 400 }
      )
    }

    // Check if employee exists
    const employee = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1)

    if (employee.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // Clear device info, set lastLogout timestamp to invalidate session
    // IMPORTANT: Set lastLogout to current time to invalidate any existing session
    const logoutTime = new Date();
    await db
      .update(employees)
      .set({
        deviceInfo: null,
        lastLogout: logoutTime, // Set logout timestamp to invalidate session
        updatedAt: new Date(),
      })
      .where(eq(employees.id, employeeId))

    console.log(`[Admin Logout] Employee ${employee[0].employeeId} logged out at ${logoutTime.toISOString()}, lastLogin was: ${employee[0].lastLogin?.toISOString() || 'null'}`)

    return NextResponse.json({
      success: true,
      message: "Employee logged out successfully. They will need to login again.",
      logoutTime: logoutTime.toISOString(),
    })
  } catch (error: any) {
    console.error("Error logging out employee:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
