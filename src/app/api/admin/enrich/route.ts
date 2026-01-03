import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { enrichAllColleges } from "@/db/ollama-enrich-data"

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
    
    // Get options from request body
    const body = await request.json().catch(() => ({}))
    const { discoverFirst = false, importLinkingsky = false } = body
    
    // Run enrichment in background (don't await - return immediately)
    // This allows the API to return while enrichment runs
    enrichAllColleges({ discoverFirst, importLinkingsky })
      .then(() => {
        console.log("✅ Enrichment completed successfully")
      })
      .catch((error) => {
        console.error("❌ Enrichment failed:", error)
      })
    
    return NextResponse.json({ 
      success: true, 
      message: "Enrichment started in background. Check server logs for progress." 
    })
  } catch (error: any) {
    console.error("Error starting enrichment:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start enrichment" 
    }, { status: 500 })
  }
}

// GET - Check enrichment status (for future use)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // For now, just return that enrichment can be triggered
    // In future, we could track enrichment status in database
    return NextResponse.json({ 
      status: "ready",
      message: "Enrichment system is ready. Use POST to start enrichment."
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

