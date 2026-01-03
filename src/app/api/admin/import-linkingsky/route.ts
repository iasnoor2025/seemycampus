import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { fetchUniversitiesFromLinkingsky } from "@/db/ollama-enrich-data"

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
    
    // Run import in background (don't await - return immediately)
    fetchUniversitiesFromLinkingsky()
      .then((result) => {
        console.log("✅ Linkingsky import completed successfully")
        console.log(JSON.stringify(result, null, 2))
      })
      .catch((error) => {
        console.error("❌ Linkingsky import failed:", error)
      })
    
    return NextResponse.json({ 
      success: true, 
      message: "Linkingsky university import started in background. Check server logs for progress." 
    })
  } catch (error: any) {
    console.error("Error starting linkingsky import:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start linkingsky import" 
    }, { status: 500 })
  }
}

