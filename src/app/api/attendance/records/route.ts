import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendanceRecords, employees, users } from "@/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { auth } from "@/lib/auth"

// GET all attendance records (admin only)
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
    let userId: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      // Token-based auth for Flutter app
      // Get user email and role from headers (sent by Flutter app)
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
      userId = user[0].id.toString()
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

    // Fetch all attendance records with employee information
    // Using leftJoin to include records even if employee is deleted
    const records = await db
      .select({
        id: attendanceRecords.id,
        employeeId: attendanceRecords.employeeId,
        date: attendanceRecords.date,
        checkInTime: attendanceRecords.checkInTime,
        checkOutTime: attendanceRecords.checkOutTime,
        status: attendanceRecords.status,
        checkInStatus: attendanceRecords.checkInStatus,
        checkOutStatus: attendanceRecords.checkOutStatus,
        syncedToSheets: attendanceRecords.syncedToSheets,
        createdAt: attendanceRecords.createdAt,
        updatedAt: attendanceRecords.updatedAt,
        employeeName: employees.name,
        employeeEmail: employees.email,
        employeeEmployeeId: employees.employeeId,
      })
      .from(attendanceRecords)
      .leftJoin(employees, eq(attendanceRecords.employeeId, employees.id))
      .orderBy(desc(attendanceRecords.date), desc(attendanceRecords.createdAt))

    console.log(`[Attendance Records API] Found ${records.length} records`)

    return NextResponse.json({
      success: true,
      records: records.map((record) => {
        // Handle date - PostgreSQL date type returns as string in YYYY-MM-DD format
        // But Drizzle might return it as Date object, so convert properly
        let dateString: string
        if (record.date instanceof Date) {
          dateString = record.date.toISOString().split("T")[0]
        } else if (typeof record.date === "string") {
          dateString = record.date
        } else {
          dateString = String(record.date)
        }

        return {
          id: record.id,
          employeeId: record.employeeId,
          employeeName: record.employeeName || "Unknown",
          employeeEmail: record.employeeEmail || "N/A",
          employeeEmployeeId: record.employeeEmployeeId || null,
          date: dateString,
          checkInTime: record.checkInTime, // Already in HH:MM:SS format from PostgreSQL time type
          checkOutTime: record.checkOutTime, // Already in HH:MM:SS format from PostgreSQL time type
          status: record.status,
          checkInStatus: record.checkInStatus || null,
          checkOutStatus: record.checkOutStatus || null,
          syncedToSheets: record.syncedToSheets,
          createdAt: record.createdAt instanceof Date 
            ? record.createdAt.toISOString() 
            : String(record.createdAt),
          updatedAt: record.updatedAt instanceof Date 
            ? record.updatedAt.toISOString() 
            : String(record.updatedAt),
        }
      }),
    }, {
      headers: corsHeaders,
    })
  } catch (error: any) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
