import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { trainAIWithDatabaseKnowledge, generateEnhancedSystemPrompt } from "@/lib/ai/training"

/**
 * POST /api/ai/train
 * Train AI with database knowledge
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Check authentication (admin only)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Run training in background
    trainAIWithDatabaseKnowledge()
      .then((result) => {
        console.log("✅ AI Training completed:", result.message)
      })
      .catch((error) => {
        console.error("❌ AI Training failed:", error)
      })

    return NextResponse.json({
      success: true,
      message: "AI training started in background. Check server logs for progress.",
    })
  } catch (error: any) {
    console.error("Error starting AI training:", error)
    return NextResponse.json(
      { error: error.message || "Failed to start training" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/train
 * Get enhanced system prompt with training data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    // Check authentication (admin only)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enhancedPrompt = await generateEnhancedSystemPrompt()

    return NextResponse.json({
      success: true,
      systemPrompt: enhancedPrompt,
      length: enhancedPrompt.length,
    })
  } catch (error: any) {
    console.error("Error generating enhanced system prompt:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate system prompt" },
      { status: 500 }
    )
  }
}
