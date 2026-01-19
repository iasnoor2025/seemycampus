import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import {
  getAllEmployees,
  createEmployee,
  type CreateEmployeeData,
} from "@/lib/employees"

// GET all employees (admin only)
export async function GET(request: NextRequest) {
  // Handle CORS for Flutter app
  const origin = request.headers.get('origin')
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Check for token-based auth (Flutter app) or session-based auth (web)
    const authHeader = request.headers.get("authorization")
    let userRole: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      // Token-based auth for Flutter app
      const email = request.headers.get("x-user-email")
      const role = request.headers.get("x-user-role")
      
      if (!email || role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }
      
      // Verify user exists and is admin
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      
      if (user.length === 0 || user[0].role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }
      
      userRole = "admin"
    } else {
      // Session-based auth for web
      const session = await auth()
      
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { 
            status: 401,
            headers: corsHeaders,
          }
        )
      }

      userRole = (session.user as any)?.role
      if (userRole !== "admin") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search") || undefined
    const isActiveParam = searchParams.get("isActive")
    const isActive = isActiveParam === null ? undefined : isActiveParam === "true"

    const result = await getAllEmployees({
      limit,
      offset,
      search,
      isActive,
    })

    return NextResponse.json({
      success: true,
        employees: result.employees.map((emp) => ({
          id: emp.id,
          name: emp.name,
          employeeId: emp.employeeId,
          email: emp.email,
          isActive: emp.isActive,
          shiftStartTime: emp.shiftStartTime,
          shiftEndTime: emp.shiftEndTime,
          earlyThresholdMinutes: emp.earlyThresholdMinutes,
          lateThresholdMinutes: emp.lateThresholdMinutes,
          deviceInfo: emp.deviceInfo,
          lastLogin: emp.lastLogin,
          createdAt: emp.createdAt,
          updatedAt: emp.updatedAt,
        })),
      total: result.total,
    }, {
      headers: corsHeaders,
    })
  } catch (error: any) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}

// POST create new employee (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, employeeId, email, password } = body

    if (!name || !employeeId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name, employeeId, and email are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const employeeData: CreateEmployeeData = {
      name,
      employeeId,
      email,
      password,
    }

    const newEmployee = await createEmployee(employeeData)

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        employee: {
          id: newEmployee.id,
          name: newEmployee.name,
          employeeId: newEmployee.employeeId,
          email: newEmployee.email,
          isActive: newEmployee.isActive,
          createdAt: newEmployee.createdAt,
          updatedAt: newEmployee.updatedAt,
        },
        // Include plain password only if auto-generated
        ...(newEmployee.plainPassword && {
          temporaryPassword: newEmployee.plainPassword,
          message: "Employee created. Temporary password generated.",
        }),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating employee:", error)

    // Handle specific errors
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
