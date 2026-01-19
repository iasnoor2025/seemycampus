import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employees, users } from "@/db/schema"
import { eq } from "drizzle-orm"

// GET check if employee session is valid
// Used by Flutter app to verify session on startup/periodically
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
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const email = searchParams.get('email') // Optional: for users table lookup

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // First try to find in employees table by employeeId
    let employee = await db
      .select({
        lastLogin: employees.lastLogin,
        lastLogout: employees.lastLogout,
        isActive: employees.isActive,
      })
      .from(employees)
      .where(eq(employees.employeeId, employeeId))
      .limit(1)

    // If not found and email provided, try to find via users table
    if (employee.length === 0 && email) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (user.length > 0 && user[0].role === 'employee') {
        // Find employee record by email
        employee = await db
          .select({
            lastLogin: employees.lastLogin,
            lastLogout: employees.lastLogout,
            isActive: employees.isActive,
          })
          .from(employees)
          .where(eq(employees.email, email))
          .limit(1)
      }
    }

    if (employee.length === 0) {
      return NextResponse.json(
        { 
          valid: false,
          error: "Employee not found",
          requiresReauth: true,
        },
        { 
          status: 200,
          headers: corsHeaders,
        }
      )
    }

    const emp = employee[0]

    // Check if employee is active
    if (!emp.isActive) {
      return NextResponse.json(
        { 
          valid: false,
          error: "Employee account is inactive",
          requiresReauth: true,
        },
        { 
          status: 200,
          headers: corsHeaders,
        }
      )
    }

    // Check if session is valid
    let isValid = true
    
    // If lastLogout exists, session is invalid (admin logged them out)
    if (emp.lastLogout) {
      // If lastLogin exists, check if it's after lastLogout
      if (emp.lastLogin) {
        isValid = emp.lastLogin > emp.lastLogout
      } else {
        // If lastLogout exists but no lastLogin, session is invalid
        isValid = false
      }
    }

    console.log(`[Session Check] Employee: ${employeeId}, Email: ${email}, Valid: ${isValid}, LastLogin: ${emp.lastLogin?.toISOString() || 'null'}, LastLogout: ${emp.lastLogout?.toISOString() || 'null'}`)

    return NextResponse.json(
      {
        valid: isValid,
        requiresReauth: !isValid,
        message: isValid ? "Session is valid" : "Session expired. Please login again.",
      },
      {
        headers: corsHeaders,
      }
    )
  } catch (error: any) {
    console.error("Error checking session:", error)
    return NextResponse.json(
      { 
        valid: false,
        error: error.message || "Internal server error",
        requiresReauth: true,
      },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
