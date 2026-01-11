/**
 * AI-Powered Admission Predictor Reasoning
 * Generates personalized, detailed explanations for admission predictions
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
    console.error("Failed to initialize AI provider for admission reasoning:", error)
    return null
  }
}

export interface AdmissionReasoningContext {
  examName: string
  score?: number | null
  rank?: number | null
  category: string
  collegeName: string
  courseName?: string | null
  probability: number
  confidence: "high" | "medium" | "low"
  latestCutoff: {
    rank?: number | null
    score?: number | null
  }
  historicalData: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
  }>
  baseReasoning: string
}

/**
 * Generate AI-powered detailed reasoning for admission prediction
 */
export async function generateAIReasoning(
  context: AdmissionReasoningContext,
  useAI: boolean = true
): Promise<string> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return context.baseReasoning
  }

  const provider = await getAIProvider()
  if (!provider) {
    return context.baseReasoning
  }

  try {
    const historicalTrend = context.historicalData.length >= 2
      ? analyzeTrend(context.historicalData, context.latestCutoff)
      : "insufficient data"

    const prompt = `You are an expert college admission counselor. Generate a detailed, personalized explanation for an admission prediction.

Student Details:
- Exam: ${context.examName}
- Category: ${context.category}
${context.rank ? `- Rank: ${context.rank}` : ""}
${context.score ? `- Score: ${context.score}` : ""}

College: ${context.collegeName}
${context.courseName ? `Course: ${context.courseName}` : ""}

Prediction:
- Admission Probability: ${context.probability}%
- Confidence Level: ${context.confidence}
- Last Year's Cutoff: ${context.latestCutoff.rank ? `Rank ${context.latestCutoff.rank}` : context.latestCutoff.score ? `Score ${context.latestCutoff.score}` : "N/A"}
- Historical Trend: ${historicalTrend}

Current Reasoning: ${context.baseReasoning}

Generate a comprehensive, personalized explanation (150-250 words) that:
1. Explains the probability in clear, understandable terms
2. Provides context about competition and trends
3. Offers actionable advice based on the prediction
4. Mentions what factors influence the admission chances
5. Is encouraging but realistic
6. Uses natural, conversational language

Return ONLY the explanation text, no quotes or markdown formatting.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert college admission counselor specializing in Indian entrance exams. Provide clear, helpful, and encouraging guidance to students.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    let cleaned = response.trim()
    // Remove quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }

    // Validate length and quality
    if (cleaned.length >= 100 && cleaned.length <= 500) {
      return cleaned
    }

    return context.baseReasoning
  } catch (error) {
    console.error("AI reasoning generation failed:", error)
    return context.baseReasoning
  }
}

/**
 * Analyze historical trend for admission cutoffs
 */
function analyzeTrend(
  historicalData: Array<{ year: number; closingRank: number | null; closingScore: number | null }>,
  latestCutoff: { rank?: number | null; score?: number | null }
): string {
  if (historicalData.length < 2) return "insufficient data"

  const hasRank = latestCutoff.rank && historicalData.some((d) => d.closingRank !== null)
  const hasScore = latestCutoff.score && historicalData.some((d) => d.closingScore !== null)

  if (hasRank) {
    const ranks = historicalData
      .map((d) => d.closingRank)
      .filter((r): r is number => r !== null)
      .slice(0, 3)

    if (ranks.length >= 2) {
      const trend = ranks[0] > ranks[ranks.length - 1] ? "increasing" : ranks[0] < ranks[ranks.length - 1] ? "decreasing" : "stable"
      return `Cutoff ranks are ${trend} (${trend === "increasing" ? "getting tougher" : trend === "decreasing" ? "getting easier" : "stable"})`
    }
  }

  if (hasScore) {
    const scores = historicalData
      .map((d) => d.closingScore)
      .filter((s): s is number => s !== null)
      .slice(0, 3)

    if (scores.length >= 2) {
      const trend = scores[0] > scores[scores.length - 1] ? "increasing" : scores[0] < scores[scores.length - 1] ? "decreasing" : "stable"
      return `Cutoff scores are ${trend} (${trend === "increasing" ? "getting tougher" : trend === "decreasing" ? "getting easier" : "stable"})`
    }
  }

  return "stable trend"
}
