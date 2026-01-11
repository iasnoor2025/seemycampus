import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { clearAIConfigCache } from "@/lib/ai/config"

/**
 * GET /api/ai/config
 * Get AI provider configuration (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get AI configuration from database
    const configKeys = [
      "ai_provider_type",
      "ai_api_key",
      "ai_api_url",
      "ai_model",
      "ollama_api_url",
      "ollama_model",
      "openrouter_api_key",
      "openrouter_model",
      "openai_api_key",
      "openai_model",
    ]

    // Better approach: get all settings and filter
    const allSettings = await db.select().from(siteSettings)
    const configMap: Record<string, string> = {}

    for (const key of configKeys) {
      const setting = allSettings.find((s) => s.key === key)
      if (setting) {
        configMap[key] = setting.value || ""
      }
    }

    // Determine current provider type (database or env)
    const providerType = configMap["ai_provider_type"] || process.env.AI_PROVIDER || "custom"
    let configured = false
    let provider = providerType

    // Check if provider is configured (either in DB or env)
    if (providerType === "ollama") {
      const apiUrl = configMap["ollama_api_url"] || process.env.OLLAMA_API_URL
      configured = !!apiUrl
      provider = "Ollama"
    } else if (providerType === "openrouter") {
      const apiKey = configMap["openrouter_api_key"] || process.env.OPENROUTER_API_KEY
      configured = !!apiKey
      provider = "OpenRouter"
    } else if (providerType === "openai") {
      const apiKey = configMap["openai_api_key"] || process.env.OPENAI_API_KEY
      configured = !!apiKey
      provider = "OpenAI"
    } else {
      const apiKey = configMap["ai_api_key"] || process.env.AI_API_KEY
      const apiUrl = configMap["ai_api_url"] || process.env.AI_API_URL
      configured = !!(apiKey && apiUrl)
      provider = "Custom"
    }

    return NextResponse.json({
      providerType,
      provider,
      configured,
      config: {
        // Only return non-sensitive config (not API keys)
        model: configMap["ai_model"] || process.env.AI_MODEL || "",
        ollamaApiUrl: configMap["ollama_api_url"] || process.env.OLLAMA_API_URL || "http://localhost:11434",
        ollamaModel: configMap["ollama_model"] || process.env.OLLAMA_MODEL || "llama3.2:latest",
        openrouterModel: configMap["openrouter_model"] || process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
        openaiModel: configMap["openai_model"] || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        customApiUrl: configMap["ai_api_url"] || process.env.AI_API_URL || "",
        // Show if API keys are set (but not the actual keys)
        hasCustomApiKey: !!(configMap["ai_api_key"] || process.env.AI_API_KEY),
        hasOpenrouterApiKey: !!(configMap["openrouter_api_key"] || process.env.OPENROUTER_API_KEY),
        hasOpenaiApiKey: !!(configMap["openai_api_key"] || process.env.OPENAI_API_KEY),
      },
    })
  } catch (error: any) {
    console.error("Error fetching AI config:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI configuration" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/ai/config
 * Update AI provider configuration (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      providerType,
      // Custom provider
      customApiKey,
      customApiUrl,
      customModel,
      // Ollama
      ollamaApiUrl,
      ollamaModel,
      // OpenRouter
      openrouterApiKey,
      openrouterModel,
      // OpenAI
      openaiApiKey,
      openaiModel,
    } = body

    if (!providerType) {
      return NextResponse.json({ error: "Provider type is required" }, { status: 400 })
    }

    // Prepare settings to update
    const settingsToUpdate: Array<{
      key: string
      value: string
      label: string
      category: string
    }> = []

    // Provider type
    settingsToUpdate.push({
      key: "ai_provider_type",
      value: providerType,
      label: "AI Provider Type",
      category: "ai",
    })

    // Custom provider settings
    if (providerType === "custom") {
      if (customApiKey) {
        settingsToUpdate.push({
          key: "ai_api_key",
          value: customApiKey,
          label: "Custom AI API Key",
          category: "ai",
        })
      }
      if (customApiUrl) {
        settingsToUpdate.push({
          key: "ai_api_url",
          value: customApiUrl,
          label: "Custom AI API URL",
          category: "ai",
        })
      }
      if (customModel) {
        settingsToUpdate.push({
          key: "ai_model",
          value: customModel,
          label: "Custom AI Model",
          category: "ai",
        })
      }
    }

    // Ollama settings
    if (providerType === "ollama") {
      if (ollamaApiUrl) {
        settingsToUpdate.push({
          key: "ollama_api_url",
          value: ollamaApiUrl,
          label: "Ollama API URL",
          category: "ai",
        })
      }
      if (ollamaModel) {
        settingsToUpdate.push({
          key: "ollama_model",
          value: ollamaModel,
          label: "Ollama Model",
          category: "ai",
        })
      }
    }

    // OpenRouter settings
    if (providerType === "openrouter") {
      if (openrouterApiKey) {
        settingsToUpdate.push({
          key: "openrouter_api_key",
          value: openrouterApiKey,
          label: "OpenRouter API Key",
          category: "ai",
        })
      }
      if (openrouterModel) {
        settingsToUpdate.push({
          key: "openrouter_model",
          value: openrouterModel,
          label: "OpenRouter Model",
          category: "ai",
        })
      }
    }

    // OpenAI settings
    if (providerType === "openai") {
      if (openaiApiKey) {
        settingsToUpdate.push({
          key: "openai_api_key",
          value: openaiApiKey,
          label: "OpenAI API Key",
          category: "ai",
        })
      }
      if (openaiModel) {
        settingsToUpdate.push({
          key: "openai_model",
          value: openaiModel,
          label: "OpenAI Model",
          category: "ai",
        })
      }
    }

    // Update or insert settings (upsert pattern)
    for (const setting of settingsToUpdate) {
      try {
        // Try to insert first
        await db.insert(siteSettings).values(setting)
      } catch (error: any) {
        // If duplicate key error (unique constraint violation), update instead
        if (error?.code === "23505" || error?.message?.includes("duplicate key") || error?.message?.includes("unique constraint")) {
          // Update existing record
          await db
            .update(siteSettings)
            .set({
              value: setting.value,
              updatedAt: new Date(),
            })
            .where(eq(siteSettings.key, setting.key))
        } else {
          // Re-throw if it's a different error
          throw error
        }
      }
    }

    // Clear config cache so new settings take effect immediately
    clearAIConfigCache()

    return NextResponse.json({
      success: true,
      message: "AI configuration updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating AI config:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update AI configuration" },
      { status: 500 }
    )
  }
}
