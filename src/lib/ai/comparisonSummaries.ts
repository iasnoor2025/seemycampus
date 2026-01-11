/**
 * AI-Powered College Comparison Summaries
 * Generates comparison insights and recommendations
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
    console.error("Failed to initialize AI provider for comparisons:", error)
    return null
  }
}

export interface CollegeForComparison {
  name: string
  location?: string | null
  ranking?: number | null
  fees?: number | null
  averagePackage?: number | null
  accreditation?: string | null
  ownership?: string | null
  courses?: Array<{ name: string }> | null
}

export interface ComparisonSummary {
  summary: string
  keyDifferences: string[]
  pros: Record<string, string[]> // college name -> pros
  cons: Record<string, string[]> // college name -> cons
  recommendation?: string
}

export interface UserProfile {
  interests?: string[] | null
  budget?: { min?: number; max?: number } | null
  preferredLocation?: string | null
  priorities?: string[] // e.g., ["ranking", "fees", "placements"]
}

/**
 * Generate comparison summary for multiple colleges
 */
export async function generateComparisonSummary(
  colleges: CollegeForComparison[],
  useAI: boolean = true
): Promise<ComparisonSummary | null> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || colleges.length < 2) {
    return null
  }

  const provider = await getAIProvider()
  if (!provider) {
    return null
  }

  try {
    const collegesText = colleges
      .map((college, i) => {
        return `College ${i + 1}: ${college.name}
${college.location ? `- Location: ${college.location}` : ""}
${college.ranking ? `- Ranking: ${college.ranking}` : ""}
${college.fees ? `- Fees: ₹${college.fees.toLocaleString()}` : ""}
${college.averagePackage ? `- Average Package: ₹${college.averagePackage.toLocaleString()}` : ""}
${college.accreditation ? `- Accreditation: ${college.accreditation}` : ""}
${college.ownership ? `- Ownership: ${college.ownership}` : ""}
${college.courses && college.courses.length > 0 ? `- Courses: ${college.courses.slice(0, 3).map(c => c.name).join(", ")}` : ""}`
      })
      .join("\n\n")

    const prompt = `Compare these colleges and generate a comprehensive comparison summary.

${collegesText}

Return a JSON object with:
{
  "summary": "overall comparison summary (200-300 words)",
  "keyDifferences": ["difference1", "difference2", ...],
  "pros": {
    "${colleges[0].name}": ["pro1", "pro2", ...],
    "${colleges[1].name}": ["pro1", "pro2", ...]
  },
  "cons": {
    "${colleges[0].name}": ["con1", "con2", ...],
    "${colleges[1].name}": ["con1", "con2", ...]
  }
}

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert college counselor. Return only valid JSON responses.",
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
        summary: parsed.summary || "",
        keyDifferences: parsed.keyDifferences || [],
        pros: parsed.pros || {},
        cons: parsed.cons || {},
      }
    }

    return null
  } catch (error) {
    console.error("AI comparison summary generation failed:", error)
    return null
  }
}

/**
 * Recommend best fit college from comparison
 */
export async function recommendBestFit(
  colleges: CollegeForComparison[],
  userProfile: UserProfile,
  useAI: boolean = true
): Promise<string | null> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || colleges.length < 2) {
    return null
  }

  const provider = await getAIProvider()
  if (!provider) {
    return null
  }

  try {
    const collegesText = colleges
      .map((college) => {
        return `${college.name}:
${college.location ? `- Location: ${college.location}` : ""}
${college.ranking ? `- Ranking: ${college.ranking}` : ""}
${college.fees ? `- Fees: ₹${college.fees.toLocaleString()}` : ""}
${college.averagePackage ? `- Average Package: ₹${college.averagePackage.toLocaleString()}` : ""}`
      })
      .join("\n\n")

    const prompt = `Based on the user profile, recommend the best fit college from these options.

Colleges:
${collegesText}

User Profile:
${userProfile.interests ? `- Interests: ${userProfile.interests.join(", ")}` : ""}
${userProfile.preferredLocation ? `- Preferred Location: ${userProfile.preferredLocation}` : ""}
${userProfile.budget ? `- Budget: ₹${userProfile.budget.min?.toLocaleString() || "N/A"} - ₹${userProfile.budget.max?.toLocaleString() || "N/A"}` : ""}
${userProfile.priorities ? `- Priorities: ${userProfile.priorities.join(", ")}` : ""}

Return a JSON object with:
{
  "recommendedCollege": "college name",
  "reasoning": "detailed explanation (150-200 words) explaining why this college is the best fit"
}

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert college counselor. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return parsed.reasoning || null
    }

    return null
  } catch (error) {
    console.error("AI best fit recommendation failed:", error)
    return null
  }
}
