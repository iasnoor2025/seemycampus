import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employees } from "@/db/schema"
import { auth } from "@/lib/auth"

// GET global shift timing settings (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get default shift timing from first employee (all should have same default)
    const [sampleEmployee] = await db
      .select({
        shiftStartTime: employees.shiftStartTime,
        shiftEndTime: employees.shiftEndTime,
        earlyThresholdMinutes: employees.earlyThresholdMinutes,
        lateThresholdMinutes: employees.lateThresholdMinutes,
      })
      .from(employees)
      .limit(1)

    return NextResponse.json({
      success: true,
      shiftTiming: {
        shiftStartTime: sampleEmployee?.shiftStartTime || "09:00:00",
        shiftEndTime: sampleEmployee?.shiftEndTime || "17:00:00",
        earlyThresholdMinutes: sampleEmployee?.earlyThresholdMinutes || 15,
        lateThresholdMinutes: sampleEmployee?.lateThresholdMinutes || 15,
      },
    })
  } catch (error: any) {
    console.error("Error fetching global shift timing:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update global shift timing for all employees (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    // Update all employees with the new shift timing
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

    // Update all employees
    await db.update(employees).set(updateData)

    return NextResponse.json({
      success: true,
      message: "Global shift timing updated for all employees",
      shiftTiming: {
        shiftStartTime: updateData.shiftStartTime || "09:00:00",
        shiftEndTime: updateData.shiftEndTime || "17:00:00",
        earlyThresholdMinutes: updateData.earlyThresholdMinutes || 15,
        lateThresholdMinutes: updateData.lateThresholdMinutes || 15,
      },
    })
  } catch (error: any) {
    console.error("Error updating global shift timing:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
