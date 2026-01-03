import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { removeDuplicateCourses } from "@/db/remove-duplicate-courses"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Check authentication (admin only)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Run duplicate course removal in background (don't await - return immediately)
    removeDuplicateCourses()
      .then((result) => {
        console.log("✅ Duplicate course removal completed successfully")
        console.log(JSON.stringify(result, null, 2))
      })
      .catch((error) => {
        console.error("❌ Duplicate course removal failed:", error)
      })
    
    return NextResponse.json({ 
      success: true, 
      message: "Duplicate course removal started in background. Check server logs for progress." 
    })
  } catch (error: any) {
    console.error("Error starting duplicate course removal:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start duplicate course removal" 
    }, { status: 500 })
  }
}

