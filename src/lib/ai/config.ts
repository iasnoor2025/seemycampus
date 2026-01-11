/**
 * AI Configuration Utility
 * Gets AI provider configuration from database or environment variables
 */

import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface AIConfig {
  providerType: string
  // Custom provider
  customApiKey?: string
  customApiUrl?: string
  customModel?: string
  // Ollama
  ollamaApiUrl?: string
  ollamaModel?: string
  // OpenRouter
  openrouterApiKey?: string
  openrouterModel?: string
  // OpenAI
  openaiApiKey?: string
  openaiModel?: string
}

let configCache: { config: AIConfig | null; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get AI configuration from database or environment variables
 * Database settings take precedence over environment variables
 */
export async function getAIConfig(): Promise<AIConfig> {
  // Check cache first
  if (configCache && Date.now() - configCache.timestamp < CACHE_DURATION) {
    return configCache.config || getDefaultConfig()
  }

  try {
    // Get all AI-related settings from database
    const allSettings = await db.select().from(siteSettings)
    const configMap: Record<string, string> = {}

    const aiSettings = allSettings.filter((s) => s.category === "ai" || s.key.startsWith("ai_") || s.key.includes("ollama") || s.key.includes("openrouter") || s.key.includes("openai"))
    
    for (const setting of aiSettings) {
      configMap[setting.key] = setting.value || ""
    }

    const config: AIConfig = {
      providerType: configMap["ai_provider_type"] || process.env.AI_PROVIDER || "custom",
      // Custom provider
      customApiKey: configMap["ai_api_key"] || process.env.AI_API_KEY,
      customApiUrl: configMap["ai_api_url"] || process.env.AI_API_URL,
      customModel: configMap["ai_model"] || process.env.AI_MODEL,
      // Ollama
      ollamaApiUrl: configMap["ollama_api_url"] || process.env.OLLAMA_API_URL || "http://localhost:11434",
      ollamaModel: configMap["ollama_model"] || process.env.OLLAMA_MODEL || "llama3.2:latest",
      // OpenRouter
      openrouterApiKey: configMap["openrouter_api_key"] || process.env.OPENROUTER_API_KEY,
      openrouterModel: configMap["openrouter_model"] || process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
      // OpenAI
      openaiApiKey: configMap["openai_api_key"] || process.env.OPENAI_API_KEY,
      openaiModel: configMap["openai_model"] || process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    }

    // Cache the config
    configCache = { config, timestamp: Date.now() }
    return config
  } catch (error) {
    console.error("Error fetching AI config from database:", error)
    // Fall back to environment variables only
    const defaultConfig = getDefaultConfig()
    configCache = { config: defaultConfig, timestamp: Date.now() }
    return defaultConfig
  }
}

/**
 * Get default config from environment variables only
 */
function getDefaultConfig(): AIConfig {
  return {
    providerType: process.env.AI_PROVIDER || "custom",
    customApiKey: process.env.AI_API_KEY,
    customApiUrl: process.env.AI_API_URL,
    customModel: process.env.AI_MODEL,
    ollamaApiUrl: process.env.OLLAMA_API_URL || "http://localhost:11434",
    ollamaModel: process.env.OLLAMA_MODEL || "llama3.2:latest",
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  }
}

/**
 * Clear the AI config cache
 * Call this when AI settings are updated
 */
export function clearAIConfigCache(): void {
  configCache = null
}
