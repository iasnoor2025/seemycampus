import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { removeDuplicates } from "@/db/remove-duplicates"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Check authentication (admin only)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Run duplicate removal in background (don't await - return immediately)
    // This allows the API to return while the process runs
    removeDuplicates()
      .then((result) => {
        console.log("✅ Duplicate removal completed successfully")
        console.log(JSON.stringify(result, null, 2))
      })
      .catch((error) => {
        console.error("❌ Duplicate removal failed:", error)
      })
    
    return NextResponse.json({ 
      success: true, 
      message: "Duplicate removal started in background. Check server logs for progress." 
    })
  } catch (error: any) {
    console.error("Error starting duplicate removal:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start duplicate removal" 
    }, { status: 500 })
  }
}

// GET - Check status (for future use)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    return NextResponse.json({ 
      status: "ready",
      message: "Duplicate removal system is ready. Use POST to start removal."
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

