import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendanceRecords, employees, users } from "@/db/schema"
import { eq, desc, and, gte, lte } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET today's attendance records (admin only)
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

    // Get today's date (YYYY-MM-DD format)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Fetch today's attendance records with employee information
    const todayRecords = await db
      .select({
        id: attendanceRecords.id,
        employeeId: attendanceRecords.employeeId,
        date: attendanceRecords.date,
        checkInTime: attendanceRecords.checkInTime,
        checkOutTime: attendanceRecords.checkOutTime,
        status: attendanceRecords.status,
        createdAt: attendanceRecords.createdAt,
        employeeName: employees.name,
        employeeEmail: employees.email,
        employeeEmployeeId: employees.employeeId,
        isActive: employees.isActive,
      })
      .from(attendanceRecords)
      .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .where(eq(attendanceRecords.date, todayStr))
      .orderBy(desc(attendanceRecords.checkInTime))

    // Get all active employees
    const allEmployees = await db
      .select({
        id: employees.id,
        employeeId: employees.employeeId,
        name: employees.name,
        email: employees.email,
        isActive: employees.isActive,
      })
      .from(employees)
      .where(eq(employees.isActive, true))

    // Create a map of employee ID to attendance record
    const attendanceMap = new Map()
    todayRecords.forEach(record => {
      const empId = record.employeeId?.toString()
      if (empId) {
        attendanceMap.set(empId, record)
      }
    })

    // Build response with all employees and their today's status
    const employeesStatus = allEmployees.map(emp => {
      const record = attendanceMap.get(emp.id.toString())
      
      let dateString: string = today.toISOString().split("T")[0]
      if (record?.date) {
        if (record.date instanceof Date) {
          dateString = record.date.toISOString().split("T")[0]
        } else if (typeof record.date === "string") {
          dateString = record.date
        } else {
          dateString = String(record.date)
        }
      }

      return {
        employeeId: emp.employeeId,
        employeeName: emp.name || "Unknown",
        employeeEmail: emp.email || "N/A",
        isPresent: record != null,
        hasCheckedIn: record?.checkInTime != null,
        hasCheckedOut: record?.checkOutTime != null,
        checkInTime: record?.checkInTime || null,
        checkOutTime: record?.checkOutTime || null,
        status: record?.status || "absent",
        date: dateString,
      }
    })

    // Sort: Present first, then absent
    employeesStatus.sort((a, b) => {
      if (a.isPresent && !b.isPresent) return -1
      if (!a.isPresent && b.isPresent) return 1
      return 0
    })

    console.log(`[Today's Attendance API] Found ${employeesStatus.length} employees, ${employeesStatus.filter(e => e.isPresent).length} present today`)

    return NextResponse.json({
      success: true,
      date: today.toISOString().split("T")[0],
      employees: employeesStatus,
      summary: {
        total: employeesStatus.length,
        present: employeesStatus.filter(e => e.isPresent).length,
        absent: employeesStatus.filter(e => !e.isPresent).length,
        checkedOut: employeesStatus.filter(e => e.hasCheckedOut).length,
      },
    }, {
      headers: corsHeaders,
    })

  } catch (error: any) {
    console.error("Error fetching today's attendance:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
