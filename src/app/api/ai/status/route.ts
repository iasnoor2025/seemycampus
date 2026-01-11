import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

/**
 * GET /api/ai/status
 * Get AI provider configuration status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const providerType = process.env.AI_PROVIDER || "custom"
    let configured = false
    let provider = providerType

    // Check if provider is configured
    if (providerType === "ollama") {
      const apiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434"
      configured = true // Ollama can work with default URL
      provider = "Ollama"
    } else if (providerType === "openrouter") {
      configured = !!process.env.OPENROUTER_API_KEY
      provider = "OpenRouter"
    } else if (providerType === "openai") {
      configured = !!process.env.OPENAI_API_KEY
      provider = "OpenAI"
    } else {
      // Custom provider
      configured = !!(process.env.AI_API_KEY && process.env.AI_API_URL)
      provider = "Custom"
    }

    return NextResponse.json({
      provider,
      configured,
      providerType,
    })
  } catch (error) {
    console.error("Error checking AI status:", error)
    return NextResponse.json(
      { error: "Failed to check AI status" },
      { status: 500 }
    )
  }
}
