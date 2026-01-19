import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendanceRecords, employees, users } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { getDateString } from "@/lib/employees/utils"
import { calculateCheckInStatus, calculateCheckOutStatus } from "@/lib/employees/shiftTiming"

// GET current employee's today's attendance status
export async function GET(request: NextRequest) {
  // Handle CORS for Flutter app
  const origin = request.headers.get('origin')
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, x-user-role',
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
    let employeeId: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      // Token-based auth for Flutter app
      const email = request.headers.get("x-user-email")
      const role = request.headers.get("x-user-role")
      
      if (!email || role !== "employee") {
        return NextResponse.json(
          { error: "Forbidden - Employee access required" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }
      
      // Get employee ID from users table
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
      
      if (user.length === 0 || user[0].role !== "employee") {
        return NextResponse.json(
          { error: "Forbidden - Employee access required" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }

      // Get employee record to get employeeId
      const employee = await db
        .select()
        .from(employees)
        .where(eq(employees.email, email))
        .limit(1)

      if (employee.length === 0) {
        return NextResponse.json(
          { error: "Employee record not found" },
          { 
            status: 404,
            headers: corsHeaders,
          }
        )
      }

      employeeId = employee[0].id.toString()
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

      const userRole = (session.user as any)?.role
      if (userRole !== "employee") {
        return NextResponse.json(
          { error: "Forbidden - Employee access required" },
          { 
            status: 403,
            headers: corsHeaders,
          }
        )
      }

      // Get employee ID from session
      const sessionEmployeeId = (session.user as any)?.employeeId
      if (!sessionEmployeeId) {
        return NextResponse.json(
          { error: "Employee ID not found in session" },
          { 
            status: 400,
            headers: corsHeaders,
          }
        )
      }

      // Get employee record
      const employee = await db
        .select()
        .from(employees)
        .where(eq(employees.employeeId, sessionEmployeeId))
        .limit(1)

      if (employee.length === 0) {
        return NextResponse.json(
          { error: "Employee record not found" },
          { 
            status: 404,
            headers: corsHeaders,
          }
        )
      }

      employeeId = employee[0].id.toString()
    }

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID not found" },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Get today's date using the same utility function used throughout the codebase
    // This ensures consistency with how dates are stored in the database
    const todayStr = getDateString()

    // Get email from headers
    const email = request.headers.get("x-user-email")
    let records: any[] = []
    
    // Get all records for today, then filter by email
    const allTodayRecordsWithEmployees = await db
      .select({
        record: attendanceRecords,
        employeeEmail: employees.email,
        employeeId: employees.id,
        employeeIdString: employees.employeeId,
        employeeName: employees.name,
      })
      .from(attendanceRecords)
      .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .where(eq(attendanceRecords.date, todayStr))
    
    // Filter by email if provided
    if (email) {
      const normalizedEmail = email.trim().toLowerCase()
      const matchingRecords = allTodayRecordsWithEmployees.filter(r => {
        const recordEmail = r.employeeEmail?.trim().toLowerCase()
        return recordEmail === normalizedEmail
      })
      
      if (matchingRecords.length > 0) {
        records = [matchingRecords[0].record]
      }
    }
    
    // FALLBACK: If email filter didn't work, try by internal employeeId
    if (records.length === 0) {
      const recordsById = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.employeeId, parseInt(employeeId)),
            eq(attendanceRecords.date, todayStr)
          )
        )
        .limit(1)
      
      records = recordsById
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        hasRecord: false,
        checkedIn: false,
        checkedOut: false,
        checkInTime: null,
        checkOutTime: null,
        status: 'absent',
        date: todayStr,
      }, {
        headers: corsHeaders,
      })
    }

    const record = records[0]

    // Get employee's shift timing for calculating checkInStatus and checkOutStatus if missing
    const [employeeRecord] = await db
      .select({
        shiftStartTime: employees.shiftStartTime,
        shiftEndTime: employees.shiftEndTime,
        earlyThresholdMinutes: employees.earlyThresholdMinutes,
        lateThresholdMinutes: employees.lateThresholdMinutes,
      })
      .from(employees)
      .where(eq(employees.id, parseInt(employeeId)))
      .limit(1)
    
    let checkInStatus = record.checkInStatus
    let checkOutStatus = record.checkOutStatus
    
    if (employeeRecord) {
      const shiftStartTime = employeeRecord.shiftStartTime || "09:00:00"
      const shiftEndTime = employeeRecord.shiftEndTime || "17:00:00"
      const earlyThreshold = employeeRecord.earlyThresholdMinutes || 15
      const lateThreshold = employeeRecord.lateThresholdMinutes || 15
      
      // Calculate check-in status if missing
      if (!checkInStatus && record.checkInTime) {
        checkInStatus = calculateCheckInStatus(
          record.checkInTime,
          shiftStartTime,
          earlyThreshold,
          lateThreshold
        )
        
        // Update the record in database for future use
        try {
          await db
            .update(attendanceRecords)
            .set({ checkInStatus: checkInStatus })
            .where(eq(attendanceRecords.id, record.id))
        } catch (error) {
          console.error("Error updating checkInStatus:", error)
        }
      }
      
      // Calculate check-out status if missing
      if (!checkOutStatus && record.checkOutTime) {
        checkOutStatus = calculateCheckOutStatus(
          record.checkOutTime,
          shiftEndTime,
          earlyThreshold,
          lateThreshold
        )
        
        // Update the record in database for future use
        try {
          await db
            .update(attendanceRecords)
            .set({ checkOutStatus: checkOutStatus })
            .where(eq(attendanceRecords.id, record.id))
        } catch (error) {
          console.error("Error updating checkOutStatus:", error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      hasRecord: true,
      checkedIn: record.checkInTime != null,
      checkedOut: record.checkOutTime != null,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      status: record.status,
      checkInStatus: checkInStatus || null, // "early", "on-time", "late", or null
      checkOutStatus: checkOutStatus || null, // "early", "on-time", "late", or null
      date: todayStr, // Always return today's date, not the record's date
    }, {
      headers: corsHeaders,
    })

  } catch (error: any) {
    console.error("Error fetching employee's today status:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
