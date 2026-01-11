import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAIConfig } from "@/lib/ai/config"
import { OllamaProvider } from "@/lib/ai/providers/ollama"
import { OpenAIProvider } from "@/lib/ai/providers/openai"
import { OpenRouterProvider } from "@/lib/ai/providers/openrouter"
import { CustomAIProvider } from "@/lib/ai/providers/custom"
import type { AIProvider } from "@/lib/ai/providers/base"

/**
 * POST /api/ai/test
 * Test AI provider connection
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await getAIConfig()
    let provider: AIProvider | null = null

    // Initialize provider based on config
    if (config.providerType === "ollama") {
      provider = new OllamaProvider({
        apiUrl: config.ollamaApiUrl || "http://localhost:11434",
        model: config.ollamaModel || "llama3.2:latest",
      })
    } else if (config.providerType === "openrouter") {
      if (!config.openrouterApiKey) {
        return NextResponse.json(
          { error: "OpenRouter API key is not configured" },
          { status: 400 }
        )
      }
      provider = new OpenRouterProvider({
        apiKey: config.openrouterApiKey,
        model: config.openrouterModel || "openai/gpt-3.5-turbo",
      })
    } else if (config.providerType === "openai") {
      if (!config.openaiApiKey) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured" },
          { status: 400 }
        )
      }
      provider = new OpenAIProvider({
        apiKey: config.openaiApiKey,
        model: config.openaiModel || "gpt-3.5-turbo",
      })
    } else {
      // Custom provider
      if (!config.customApiKey || !config.customApiUrl) {
        return NextResponse.json(
          { error: "Custom AI API key and URL are required" },
          { status: 400 }
        )
      }
      provider = new CustomAIProvider({
        apiKey: config.customApiKey,
        apiUrl: config.customApiUrl,
        model: config.customModel || "default",
      })
    }

    if (!provider) {
      return NextResponse.json(
        { error: "AI provider could not be initialized" },
        { status: 500 }
      )
    }

    // Test the connection with a simple message
    const testMessage = "Hello, this is a connection test. Please respond with 'OK' or 'Connected'."
    const response = await provider.chat([
      {
        role: "system",
        content: "You are a helpful assistant. Respond briefly to test messages.",
      },
      {
        role: "user",
        content: testMessage,
      },
    ])

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: "AI provider returned empty response" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      connected: true,
      message: "AI provider is connected and working",
      response: response.substring(0, 100), // First 100 chars of response
      provider: config.providerType,
    })
  } catch (error: any) {
    console.error("Error testing AI connection:", error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || "Failed to connect to AI provider",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
