/**
 * AI-Powered Search Enhancement
 * Query understanding, expansion, and result ranking
 */

import { OllamaProvider } from "./providers/ollama"
import { OpenAIProvider } from "./providers/openai"
import { OpenRouterProvider } from "./providers/openrouter"
import { CustomAIProvider } from "./providers/custom"
import type { AIProvider } from "./providers/base"
import { isAIEnabled } from "./aiEnabled"
import { getAIConfig } from "./config"

async function getAIProvider(): Promise<AIProvider | null> {
  try {
    const config = await getAIConfig()
    const providerType = config.providerType

    if (providerType === "ollama") {
      return new OllamaProvider({
        apiUrl: config.ollamaApiUrl || "http://localhost:11434",
        model: config.ollamaModel || "llama3.2:latest",
      })
    } else if (providerType === "openrouter") {
      const apiKey = config.openrouterApiKey
      if (!apiKey) return null
      return new OpenRouterProvider({
        apiKey,
        model: config.openrouterModel || "openai/gpt-3.5-turbo",
      })
    } else if (providerType === "openai") {
      const apiKey = config.openaiApiKey
      if (!apiKey) return null
      return new OpenAIProvider({
        apiKey,
        model: config.openaiModel || "gpt-3.5-turbo",
      })
    } else {
      const apiKey = config.customApiKey
      const apiUrl = config.customApiUrl
      if (!apiKey || !apiUrl) return null
      return new CustomAIProvider({
        apiKey,
        apiUrl,
        model: config.customModel || "default",
      })
    }
  } catch (error) {
    console.error("Failed to initialize AI provider for search:", error)
    return null
  }
}

export interface SearchIntent {
  intent: "find_college" | "compare" | "get_info" | "find_course" | "find_location" | "other"
  entities: {
    collegeName?: string
    location?: string
    course?: string
    exam?: string
    filters?: Record<string, string>
  }
  confidence: number
}

export interface ExpandedQuery {
  original: string
  expanded: string[]
  corrected?: string
}

/**
 * Understand search query intent
 */
export async function understandQueryIntent(
  query: string,
  useAI: boolean = true
): Promise<SearchIntent> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return getBasicIntent(query)
  }

  const provider = await getAIProvider()
  if (!provider) {
    return getBasicIntent(query)
  }

  try {
    const prompt = `Analyze this search query and determine the user's intent.

Query: "${query}"

Return a JSON object with:
{
  "intent": "find_college" | "compare" | "get_info" | "find_course" | "find_location" | "other",
  "entities": {
    "collegeName": "extracted college name if present",
    "location": "extracted location if present",
    "course": "extracted course name if present",
    "exam": "extracted exam name if present",
    "filters": {"key": "value"} for any filters mentioned
  },
  "confidence": number between 0 and 1
}

Common intents:
- "find_college": User wants to find colleges (e.g., "best engineering colleges", "colleges in Delhi")
- "compare": User wants to compare (e.g., "IIT vs NIT")
- "get_info": User wants information (e.g., "admission process", "fee structure")
- "find_course": User wants to find courses (e.g., "MBA programs", "B.Tech Computer Science")
- "find_location": User wants colleges in a location (e.g., "colleges in Mumbai")

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a search query analysis expert. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        intent: parsed.intent || "other",
        entities: parsed.entities || {},
        confidence: parsed.confidence || 0.7,
      }
    }

    return getBasicIntent(query)
  } catch (error) {
    console.error("AI query intent understanding failed:", error)
    return getBasicIntent(query)
  }
}

/**
 * Expand search query with synonyms and related terms
 */
export async function expandQuery(
  query: string,
  useAI: boolean = true
): Promise<ExpandedQuery> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return { original: query, expanded: [query] }
  }

  const provider = await getAIProvider()
  if (!provider) {
    return { original: query, expanded: [query] }
  }

  try {
    const prompt = `Expand this search query with synonyms and related terms for better search results.

Query: "${query}"

Return a JSON object with:
{
  "original": "original query",
  "expanded": ["synonym1", "synonym2", "related term1", ...],
  "corrected": "corrected spelling if there are typos, otherwise same as original"
}

Focus on Indian education context. Include:
- Common abbreviations (e.g., "IIT" for "Indian Institute of Technology")
- Alternative spellings
- Related terms
- Location variations

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a search query expansion expert. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        original: parsed.original || query,
        expanded: parsed.expanded || [query],
        corrected: parsed.corrected || query,
      }
    }

    return { original: query, expanded: [query] }
  } catch (error) {
    console.error("AI query expansion failed:", error)
    return { original: query, expanded: [query] }
  }
}

/**
 * Correct typos in search query
 */
export async function correctQueryTypo(
  query: string,
  useAI: boolean = true
): Promise<string | null> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return null
  }

  const provider = await getAIProvider()
  if (!provider) {
    return null
  }

  try {
    const prompt = `Correct any typos in this search query. If there are no typos, return the same query.

Query: "${query}"

Return ONLY the corrected query, no other text. If no corrections needed, return the original query.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a spelling correction expert. Return only the corrected query.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const corrected = response.trim()
    if (corrected.toLowerCase() !== query.toLowerCase() && corrected.length > 0) {
      return corrected
    }

    return null
  } catch (error) {
    console.error("AI typo correction failed:", error)
    return null
  }
}

// Helper function for basic intent detection
function getBasicIntent(query: string): SearchIntent {
  const lowerQuery = query.toLowerCase()

  let intent: SearchIntent["intent"] = "other"
  const entities: SearchIntent["entities"] = {}

  if (lowerQuery.includes("compare") || lowerQuery.includes("vs") || lowerQuery.includes("versus")) {
    intent = "compare"
  } else if (lowerQuery.includes("college") || lowerQuery.includes("university") || lowerQuery.includes("institute")) {
    intent = "find_college"
  } else if (lowerQuery.includes("course") || lowerQuery.includes("program") || lowerQuery.includes("degree")) {
    intent = "find_course"
  } else if (lowerQuery.includes("in ") || lowerQuery.includes("near")) {
    intent = "find_location"
    const locationMatch = query.match(/in\s+([A-Za-z\s]+)/i) || query.match(/near\s+([A-Za-z\s]+)/i)
    if (locationMatch) {
      entities.location = locationMatch[1].trim()
    }
  } else {
    intent = "get_info"
  }

  return {
    intent,
    entities,
    confidence: 0.6,
  }
}
