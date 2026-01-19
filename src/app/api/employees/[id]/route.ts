import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  type UpdateEmployeeData,
} from "@/lib/employees"

// GET single employee by ID (admin only)
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

    const employee = await getEmployeeById(employeeId)

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        employeeId: employee.employeeId,
        email: employee.email,
        isActive: employee.isActive,
        shiftStartTime: employee.shiftStartTime,
        shiftEndTime: employee.shiftEndTime,
        earlyThresholdMinutes: employee.earlyThresholdMinutes,
        lateThresholdMinutes: employee.lateThresholdMinutes,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      },
    })
  } catch (error: any) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT update employee (admin only)
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
    const { name, email, password, isActive } = body

    const updateData: UpdateEmployeeData = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        )
      }
      updateData.email = email
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        )
      }
      updateData.password = password
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    const updated = await updateEmployee(employeeId, updateData)

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      employee: {
        id: updated.id,
        name: updated.name,
        employeeId: updated.employeeId,
        email: updated.email,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    })
  } catch (error: any) {
    console.error("Error updating employee:", error)

    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    if (error.message?.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE employee (admin only)
export async function DELETE(
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

    const result = await deleteEmployee(employeeId)

    // Check if it was a hard delete (result has 'deleted' property)
    const isHardDelete = "deleted" in result && result.deleted === true

    return NextResponse.json({
      success: true,
      message: isHardDelete
        ? "Employee deleted successfully"
        : "Employee deactivated successfully",
      employee: isHardDelete
        ? { id: result.id, deleted: true }
        : {
            id: result.id,
            name: (result as any).name,
            employeeId: (result as any).employeeId,
            email: (result as any).email,
            isActive: (result as any).isActive,
          },
    })
  } catch (error: any) {
    console.error("Error deleting employee:", error)

    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
