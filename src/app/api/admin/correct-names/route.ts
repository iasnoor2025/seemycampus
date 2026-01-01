import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { correctAllCollegeNames } from "@/db/ollama-enrich-data"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Check authentication (admin only)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if Ollama is configured
    if (process.env.AI_PROVIDER !== "ollama") {
      return NextResponse.json({ 
        error: "Ollama is not configured. Please set AI_PROVIDER=ollama in .env" 
      }, { status: 400 })
    }
    
    // Run name correction in background (don't await - return immediately)
    correctAllCollegeNames()
      .then((result) => {
        console.log("✅ Name correction completed successfully")
        console.log(JSON.stringify(result, null, 2))
      })
      .catch((error) => {
        console.error("❌ Name correction failed:", error)
      })
    
    return NextResponse.json({ 
      success: true, 
      message: "College name correction started in background. Check server logs for progress." 
    })
  } catch (error: any) {
    console.error("Error starting name correction:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start name correction" 
    }, { status: 500 })
  }
}

