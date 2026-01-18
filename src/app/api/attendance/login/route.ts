import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users, employees } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { isAutoApproved, type UserRole } from "@/lib/roles"
import crypto from "crypto"

// POST login for Flutter app
export async function POST(request: NextRequest) {
  // Handle CORS for Flutter app
  const origin = request.headers.get('origin')
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // First, try to find in users table
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (user.length > 0) {
      const isValid = await bcrypt.compare(password, user[0].password || "")

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { 
            status: 401,
            headers: corsHeaders,
          }
        )
      }

      // Check if user is approved (auto-approved roles don't need approval)
      const userRole = (user[0].role || "student") as UserRole
      if (!isAutoApproved(userRole) && !user[0].isApproved) {
        return NextResponse.json(
          { error: "Account pending approval" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }

      // Check if user is an employee or admin
      if (userRole !== "employee" && userRole !== "admin") {
        return NextResponse.json(
          { error: "Only employees and admins can access this app" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }

      // If user is an employee, try to find their employeeId from employees table
      let employeeId: string | undefined
      if (userRole === "employee") {
        const employee = await db
          .select({ employeeId: employees.employeeId })
          .from(employees)
          .where(eq(employees.email, email))
          .limit(1)
        
        if (employee.length > 0) {
          employeeId = employee[0].employeeId
        }
      }

      // Generate a simple token for Flutter app
      // In production, use JWT or a proper token system
      const token = crypto
        .createHash("sha256")
        .update(`${user[0].id}-${user[0].email}-${Date.now()}`)
        .digest("hex")

      return NextResponse.json(
        {
          success: true,
          user: {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].name,
            role: user[0].role || "employee",
            employeeId: employeeId,
          },
          token,
        },
        {
          headers: corsHeaders,
        }
      )
    }

    // If not found in users, check employees table
    const employee = await db
      .select()
      .from(employees)
      .where(eq(employees.email, email))
      .limit(1)

    if (employee.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { 
          status: 401,
          headers: corsHeaders,
        }
      )
    }

    // Check if employee is active
    if (!employee[0].isActive) {
      return NextResponse.json(
        { error: "Employee account is inactive" },
        { 
          status: 403,
          headers: corsHeaders,
        }
      )
    }

    const isValid = await bcrypt.compare(password, employee[0].password || "")

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { 
          status: 401,
          headers: corsHeaders,
        }
      )
    }

    // Generate a simple token for Flutter app
    // In production, use JWT or a proper token system
    const token = crypto
      .createHash("sha256")
      .update(`${employee[0].id}-${employee[0].email}-${Date.now()}`)
      .digest("hex")

    // Return employee as user with "employee" role
    return NextResponse.json(
      {
        success: true,
        user: {
          id: `emp_${employee[0].id.toString()}`,
          email: employee[0].email,
          name: employee[0].name,
          employeeId: employee[0].employeeId,
          role: "employee",
        },
        token,
      },
      {
        headers: corsHeaders,
      }
    )
  } catch (error: any) {
    console.error("Error during login:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
