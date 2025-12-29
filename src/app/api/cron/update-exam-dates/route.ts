import { NextResponse } from "next/server"
import { autoUpdateExamDates } from "@/db/auto-update-exam-dates"

/**
 * API endpoint for cron job to automatically update exam dates
 * 
 * This endpoint should be called periodically (e.g., monthly or when academic year changes)
 * 
 * Security: Add authentication/authorization in production
 * Example: Check for a secret token in headers or use a cron service like Vercel Cron
 * 
 * Usage with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-exam-dates",
 *     "schedule": "0 0 1 4 *" // Run on April 1st every year at midnight
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Optional: Add authentication check
    // const authHeader = request.headers.get("authorization")
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    console.log("🔄 Cron job triggered: Updating exam dates...")
    
    const result = await autoUpdateExamDates()
    
    return NextResponse.json({
      success: true,
      message: "Exam dates updated successfully",
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Cron job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update exam dates",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also support POST for cron services that use POST
export async function POST(request: Request) {
  return GET(request)
}

