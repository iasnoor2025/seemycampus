import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { enrichAllCollegeReviews } from "@/db/ollama-enrich-data"

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
    
    // Run review enrichment in background (don't await - return immediately)
    enrichAllCollegeReviews()
      .then(() => {
        console.log("✅ Review enrichment completed successfully")
      })
      .catch((error) => {
        console.error("❌ Review enrichment failed:", error)
      })
    
    return NextResponse.json({ 
      success: true, 
      message: "Review enrichment started in background. Check server logs for progress." 
    })
  } catch (error: any) {
    console.error("Error starting review enrichment:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start review enrichment" 
    }, { status: 500 })
  }
}

