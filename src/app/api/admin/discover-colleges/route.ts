import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { discoverAndAddMissingColleges, discoverEnrichAndCleanup, discoverCollegesComprehensive } from "@/db/ollama-enrich-data"

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
    
    // Get optional state and city from request body
    const body = await request.json().catch(() => ({}))
    const { state, city, fullProcess, comprehensive } = body
    
    // Run discovery in background (don't await - return immediately)
    if (comprehensive) {
      // Comprehensive discovery: discover across all states and cities
      discoverCollegesComprehensive()
        .then((result) => {
          console.log("✅ Comprehensive college discovery completed successfully")
          console.log(JSON.stringify(result, null, 2))
        })
        .catch((error) => {
          console.error("❌ Comprehensive discovery failed:", error)
        })
      
      return NextResponse.json({ 
        success: true, 
        message: "Comprehensive college discovery started in background. This will discover colleges across all 28 states + 8 UTs and major cities. Check server logs for progress. This may take several hours." 
      })
    } else if (fullProcess) {
      // Full process: discover, remove duplicates, and enrich
      discoverEnrichAndCleanup(state, city)
        .then((result) => {
          console.log("✅ Complete discovery and enrichment process completed successfully")
          console.log(JSON.stringify(result, null, 2))
        })
        .catch((error) => {
          console.error("❌ Complete process failed:", error)
        })
      
      return NextResponse.json({ 
        success: true, 
        message: "Complete discovery, duplicate removal, and enrichment process started in background. Check server logs for progress." 
      })
    } else {
      // Just discover and add colleges
      discoverAndAddMissingColleges(state, city)
        .then((result) => {
          console.log("✅ College discovery completed successfully")
          console.log(JSON.stringify(result, null, 2))
        })
        .catch((error) => {
          console.error("❌ College discovery failed:", error)
        })
      
      return NextResponse.json({ 
        success: true, 
        message: "College discovery started in background. Check server logs for progress." 
      })
    }
  } catch (error: any) {
    console.error("Error starting college discovery:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to start college discovery" 
    }, { status: 500 })
  }
}

