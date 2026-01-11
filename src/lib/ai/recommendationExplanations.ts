/**
 * AI-Powered Recommendation Explanations
 * Generates personalized explanations for college recommendations
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
    console.error("Failed to initialize AI provider for recommendations:", error)
    return null
  }
}

export interface RecommendationContext {
  collegeName: string
  location?: string | null
  ranking?: number | null
  score: number
  matchReasons: string[]
  userProfile: {
    interests?: string[] | null
    preferredLocation?: string | null
    budgetMin?: number | null
    budgetMax?: number | null
    studyMode?: string | null
    academicLevel?: string | null
  }
  courses?: Array<{ name: string; fees?: number | null }> | null
  averagePackage?: number | null
  accreditation?: string | null
}

/**
 * Generate AI-powered explanation for why a college is recommended
 */
export async function generateRecommendationExplanation(
  context: RecommendationContext,
  useAI: boolean = true
): Promise<string> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return generateBasicExplanation(context)
  }

  const provider = await getAIProvider()
  if (!provider) {
    return generateBasicExplanation(context)
  }

  try {
    const prompt = `You are a college counseling expert. Generate a personalized explanation for why this college is recommended to a student.

College: ${context.collegeName}
${context.location ? `Location: ${context.location}` : ""}
${context.ranking ? `NIRF Ranking: ${context.ranking}` : ""}
${context.accreditation ? `Accreditation: ${context.accreditation}` : ""}
${context.averagePackage ? `Average Package: ₹${context.averagePackage.toLocaleString()}` : ""}

Student Profile:
${context.userProfile.interests ? `- Interests: ${context.userProfile.interests.join(", ")}` : ""}
${context.userProfile.preferredLocation ? `- Preferred Location: ${context.userProfile.preferredLocation}` : ""}
${context.userProfile.budgetMin && context.userProfile.budgetMax ? `- Budget: ₹${context.userProfile.budgetMin.toLocaleString()} - ₹${context.userProfile.budgetMax.toLocaleString()}` : ""}
${context.userProfile.studyMode ? `- Study Mode: ${context.userProfile.studyMode}` : ""}
${context.userProfile.academicLevel ? `- Academic Level: ${context.userProfile.academicLevel}` : ""}

Match Score: ${context.score}/100
Match Reasons: ${context.matchReasons.join(", ")}

${context.courses && context.courses.length > 0 ? `Available Courses: ${context.courses.slice(0, 5).map(c => c.name).join(", ")}${context.courses.length > 5 ? ` and ${context.courses.length - 5} more` : ""}` : ""}

Generate a compelling, personalized explanation (100-200 words) that:
1. Highlights why this college is a good fit for the student
2. Emphasizes the key match reasons naturally
3. Mentions location, courses, budget, or other relevant factors
4. Is encouraging and helps the student understand the recommendation
5. Uses natural, conversational language

Return ONLY the explanation text, no quotes or markdown formatting.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert college counselor. Generate personalized, helpful explanations for college recommendations.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    let cleaned = response.trim()
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }

    if (cleaned.length >= 50 && cleaned.length <= 400) {
      return cleaned
    }

    return generateBasicExplanation(context)
  } catch (error) {
    console.error("AI recommendation explanation failed:", error)
    return generateBasicExplanation(context)
  }
}

/**
 * Generate basic explanation as fallback
 */
function generateBasicExplanation(context: RecommendationContext): string {
  const parts: string[] = []
  
  parts.push(`${context.collegeName} is a great match for you`)
  
  if (context.matchReasons.length > 0) {
    parts.push(`because ${context.matchReasons[0].toLowerCase()}`)
    if (context.matchReasons.length > 1) {
      parts.push(`and ${context.matchReasons.slice(1).join(", ").toLowerCase()}`)
    }
  }
  
  if (context.location && context.userProfile.preferredLocation) {
    parts.push(`Located in ${context.location}, which matches your preference`)
  }
  
  if (context.courses && context.courses.length > 0) {
    parts.push(`Offers ${context.courses.length} courses including ${context.courses.slice(0, 2).map(c => c.name).join(" and ")}`)
  }
  
  return parts.join(". ") + "."
}
