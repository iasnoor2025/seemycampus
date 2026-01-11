/**
 * AI-Powered Content Enhancement
 * College and course description generation
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
    console.error("Failed to initialize AI provider for content enhancement:", error)
    return null
  }
}

export interface CollegeContext {
  name: string
  location?: string | null
  city?: string | null
  ranking?: number | null
  establishedYear?: number | null
  accreditation?: string | null
  courses?: Array<{ name: string }> | null
  averagePackage?: number | null
  ownership?: string | null
  existingDescription?: string | null
}

export interface CourseContext {
  name: string
  collegeName: string
  duration?: string | null
  fees?: number | null
  level?: string | null
  description?: string | null
  collegeLocation?: string | null
}

/**
 * Generate comprehensive college description
 */
export async function generateCollegeDescription(
  context: CollegeContext,
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
    const prompt = `Generate a comprehensive, SEO-optimized description for a college.

College Name: ${context.name}
${context.location ? `Location: ${context.location}` : ""}
${context.city ? `City: ${context.city}` : ""}
${context.ranking ? `NIRF Ranking: ${context.ranking}` : ""}
${context.establishedYear ? `Established: ${context.establishedYear}` : ""}
${context.accreditation ? `Accreditation: ${context.accreditation}` : ""}
${context.ownership ? `Ownership: ${context.ownership}` : ""}
${context.averagePackage ? `Average Package: ₹${context.averagePackage.toLocaleString()}` : ""}
${context.courses && context.courses.length > 0 ? `Courses: ${context.courses.slice(0, 5).map(c => c.name).join(", ")}${context.courses.length > 5 ? ` and ${context.courses.length - 5} more` : ""}` : ""}
${context.existingDescription ? `Existing Description: ${context.existingDescription}` : ""}

Requirements:
1. Write a compelling 200-300 word description
2. Include key highlights (ranking, accreditation, courses, placements)
3. Mention location advantages if applicable
4. Use SEO-friendly language with relevant keywords
5. Be informative and engaging
6. Focus on what makes this college attractive to students
7. Include information about admission, courses, and career prospects

Return ONLY the description text, no quotes or markdown formatting.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert content writer specializing in educational content. Write compelling, SEO-optimized college descriptions.",
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

    if (cleaned.length >= 150 && cleaned.length <= 500) {
      return cleaned
    }

    return null
  } catch (error) {
    console.error("AI college description generation failed:", error)
    return null
  }
}

/**
 * Enhance existing college description
 */
export async function enhanceCollegeDescription(
  existing: string,
  context: CollegeContext,
  useAI: boolean = true
): Promise<string | null> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || !existing || existing.length < 50) {
    return null
  }

  const provider = await getAIProvider()
  if (!provider) {
    return null
  }

  try {
    const prompt = `Enhance and expand this college description to make it more comprehensive and SEO-friendly.

Existing Description:
${existing}

College Details:
${context.ranking ? `Ranking: ${context.ranking}` : ""}
${context.accreditation ? `Accreditation: ${context.accreditation}` : ""}
${context.averagePackage ? `Average Package: ₹${context.averagePackage.toLocaleString()}` : ""}
${context.courses && context.courses.length > 0 ? `Courses: ${context.courses.slice(0, 5).map(c => c.name).join(", ")}` : ""}

Requirements:
1. Keep all important information from the original
2. Add missing key details (ranking, accreditation, courses, placements)
3. Improve SEO with relevant keywords
4. Make it more engaging and comprehensive
5. Target length: 250-350 words
6. Maintain accuracy and factual information

Return ONLY the enhanced description, no quotes or markdown formatting.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert content editor. Enhance descriptions while maintaining accuracy.",
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

    if (cleaned.length > existing.length && cleaned.length <= 500) {
      return cleaned
    }

    return null
  } catch (error) {
    console.error("AI college description enhancement failed:", error)
    return null
  }
}

/**
 * Generate course description
 */
export async function generateCourseDescription(
  context: CourseContext,
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
    const prompt = `Generate a comprehensive description for a course.

Course: ${context.name}
College: ${context.collegeName}
${context.collegeLocation ? `Location: ${context.collegeLocation}` : ""}
${context.duration ? `Duration: ${context.duration}` : ""}
${context.level ? `Level: ${context.level}` : ""}
${context.fees ? `Fees: ₹${context.fees.toLocaleString()}` : ""}
${context.description ? `Existing Description: ${context.description}` : ""}

Requirements:
1. Write a 150-250 word description
2. Include course overview, career prospects, and key features
3. Mention industry relevance and opportunities
4. Include information about the college if relevant
5. Use SEO-friendly language
6. Be informative and engaging

Return ONLY the description text, no quotes or markdown formatting.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert educational content writer. Write comprehensive course descriptions.",
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

    if (cleaned.length >= 100 && cleaned.length <= 400) {
      return cleaned
    }

    return null
  } catch (error) {
    console.error("AI course description generation failed:", error)
    return null
  }
}
