import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employees } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET shift timing for an employee (admin only)
export async function GET(
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

    const [employee] = await db
      .select({
        id: employees.id,
        shiftStartTime: employees.shiftStartTime,
        shiftEndTime: employees.shiftEndTime,
        earlyThresholdMinutes: employees.earlyThresholdMinutes,
        lateThresholdMinutes: employees.lateThresholdMinutes,
      })
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1)

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      shiftTiming: {
        shiftStartTime: employee.shiftStartTime,
        shiftEndTime: employee.shiftEndTime,
        earlyThresholdMinutes: employee.earlyThresholdMinutes || 15,
        lateThresholdMinutes: employee.lateThresholdMinutes || 15,
      },
    })
  } catch (error: any) {
    console.error("Error fetching shift timing:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update shift timing for an employee (admin only)
export async function PUT(
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

    const body = await request.json()
    const {
      shiftStartTime,
      shiftEndTime,
      earlyThresholdMinutes,
      lateThresholdMinutes,
    } = body

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/
    
    if (shiftStartTime && !timeRegex.test(shiftStartTime)) {
      return NextResponse.json(
        { error: "Invalid shift start time format. Use HH:MM or HH:MM:SS" },
        { status: 400 }
      )
    }

    if (shiftEndTime && !timeRegex.test(shiftEndTime)) {
      return NextResponse.json(
        { error: "Invalid shift end time format. Use HH:MM or HH:MM:SS" },
        { status: 400 }
      )
    }

    // Validate threshold minutes
    if (
      earlyThresholdMinutes !== undefined &&
      (isNaN(earlyThresholdMinutes) || earlyThresholdMinutes < 0)
    ) {
      return NextResponse.json(
        { error: "Early threshold minutes must be a non-negative number" },
        { status: 400 }
      )
    }

    if (
      lateThresholdMinutes !== undefined &&
      (isNaN(lateThresholdMinutes) || lateThresholdMinutes < 0)
    ) {
      return NextResponse.json(
        { error: "Late threshold minutes must be a non-negative number" },
        { status: 400 }
      )
    }

    // Check if employee exists
    const [existing] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1)

    if (!existing) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // Update shift timing
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (shiftStartTime !== undefined) {
      updateData.shiftStartTime = shiftStartTime
    }
    if (shiftEndTime !== undefined) {
      updateData.shiftEndTime = shiftEndTime
    }
    if (earlyThresholdMinutes !== undefined) {
      updateData.earlyThresholdMinutes = earlyThresholdMinutes
    }
    if (lateThresholdMinutes !== undefined) {
      updateData.lateThresholdMinutes = lateThresholdMinutes
    }

    const [updated] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, employeeId))
      .returning()

    return NextResponse.json({
      success: true,
      message: "Shift timing updated successfully",
      shiftTiming: {
        shiftStartTime: updated.shiftStartTime,
        shiftEndTime: updated.shiftEndTime,
        earlyThresholdMinutes: updated.earlyThresholdMinutes || 15,
        lateThresholdMinutes: updated.lateThresholdMinutes || 15,
      },
    })
  } catch (error: any) {
    console.error("Error updating shift timing:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
