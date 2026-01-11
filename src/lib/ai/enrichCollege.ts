/**
 * AI-powered college enrichment utility
 * Uses the existing AI enrichment system to enrich college data from web search
 */

import { db } from "@/db"
import { colleges } from "@/db/schema"
import { eq, ilike } from "drizzle-orm"
import { OllamaProvider } from "./providers/ollama"
import { OpenAIProvider } from "./providers/openai"
import { OpenRouterProvider } from "./providers/openrouter"
import { CustomAIProvider } from "./providers/custom"
import type { AIProvider } from "./providers/base"
import { getAIConfig } from "./config"

// Helper function to parse JSON from AI response
function parseJsonFromAI(response: string): any {
  try {
    let jsonStr = response.trim()
    
    // Remove markdown code blocks
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }
    
    // Extract JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      jsonStr = objectMatch[0]
    }
    
    // Remove trailing commas
    jsonStr = jsonStr.replace(/,(\s*\})/g, '$1')
    
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error("JSON parsing error:", error)
    return {}
  }
}

// Get AI provider
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
    } else if (providerType === "custom") {
      const apiKey = config.customApiKey
      const apiUrl = config.customApiUrl
      if (!apiKey || !apiUrl) return null
      return new CustomAIProvider({
        apiKey,
        apiUrl,
        model: config.customModel || "default",
      })
    }
    
    return null
  } catch (error) {
    console.error("Failed to initialize AI provider:", error)
    return null
  }
}

/**
 * Enrich college data using AI based on web search results
 */
export async function enrichCollegeFromWebSearch(
  collegeName: string,
  webSearchResults: Array<{ title: string; url: string; snippet: string }>,
  existingData?: any
): Promise<Partial<any>> {
  try {
    const aiProvider = await getAIProvider()
    if (!aiProvider) {
      console.log("AI provider not available, skipping enrichment")
      return {}
    }

    // Build context from web search results
    const searchContext = webSearchResults
      .slice(0, 3)
      .map((result, idx) => `${idx + 1}. ${result.title}: ${result.snippet}`)
      .join("\n")

    const prompt = `You are a data enrichment assistant for Indian colleges. Based on the web search results below, extract and provide ACCURATE information about the college.

College Name: ${collegeName}
${existingData?.location ? `Location: ${existingData.location}` : ""}
${existingData?.city ? `City: ${existingData.city}` : ""}
${existingData?.website ? `Website: ${existingData.website}` : ""}

Web Search Results:
${searchContext}

Please provide a JSON object with the following fields (only include fields you can verify from the search results):
{
  "description": "Brief description of the college (2-3 sentences)",
  "ranking": 123,
  "establishedYear": 1990,
  "accreditation": "AICTE, UGC",
  "hostelFees": 120000,
  "averagePackage": 800000,
  "highestPackage": 1500000,
  "entranceExams": ["JEE", "NEET"],
  "ownership": "Private",
  "campusSize": "50 acres",
  "totalStudents": 5000,
  "website": "https://www.example.ac.in",
  "email": "info@example.ac.in",
  "phone": "+91-1234567890",
  "location": "City, State",
  "city": "City Name",
  "state": "State Name"
}

CRITICAL REQUIREMENTS:
- Extract information ONLY from the provided web search results
- For RANKING: Provide NIRF ranking if mentioned, or reasonable estimate
- For PHONE: Must be valid Indian phone number format: +91-XXXXXXXXXX
- For EMAIL: Must be valid email format
- For WEBSITE: Must be valid URL
- For ESTABLISHED YEAR: Must be realistic year (1800-2024)
- Use REALISTIC values based on the search results
- Fees should be in INR (no currency symbols)
- Entrance exams should be an array of strings
- Return ONLY valid JSON, no other text or markdown`

    const response = await aiProvider.chat([
      { role: "system", content: "You are a helpful assistant that extracts college information from web search results and returns only valid JSON." },
      { role: "user", content: prompt }
    ])

    const enrichedData = parseJsonFromAI(response)
    
    // Validate and clean the data
    const cleaned: any = {}
    
    // List of valid fields
    const validFields = [
      "description", "ranking", "establishedYear", "accreditation",
      "hostelFees", "averagePackage", "highestPackage", "entranceExams",
      "ownership", "campusSize", "totalStudents", "website", "email",
      "phone", "location", "city", "state"
    ]

    for (const field of validFields) {
      if (enrichedData[field] !== undefined && enrichedData[field] !== null) {
        // Type validation
        if (field === "ranking" && typeof enrichedData[field] === "number") {
          cleaned[field] = enrichedData[field]
        } else if (field === "establishedYear" && typeof enrichedData[field] === "number") {
          const year = enrichedData[field]
          if (year >= 1800 && year <= new Date().getFullYear()) {
            cleaned[field] = year
          }
        } else if (field === "hostelFees" || field === "averagePackage" || field === "highestPackage" || field === "totalStudents") {
          if (typeof enrichedData[field] === "number") {
            cleaned[field] = enrichedData[field]
          }
        } else if (field === "entranceExams" && Array.isArray(enrichedData[field])) {
          cleaned[field] = enrichedData[field]
        } else if (typeof enrichedData[field] === "string") {
          cleaned[field] = enrichedData[field].trim()
        }
      }
    }

    return cleaned
  } catch (error) {
    console.error("Error enriching college from web search:", error)
    return {}
  }
}

/**
 * Save and enrich college from web search
 */
export async function saveAndEnrichCollegeFromWeb(
  collegeName: string,
  webSearchResults: Array<{ title: string; url: string; snippet: string }>,
  extractedData: any
): Promise<void> {
  try {
    // Check if college already exists
    const existing = await db
      .select()
      .from(colleges)
      .where(ilike(colleges.name, `%${collegeName}%`))
      .limit(1)

    // Enrich data using AI
    const enrichedData = await enrichCollegeFromWebSearch(
      collegeName,
      webSearchResults,
      existing.length > 0 ? existing[0] : extractedData
    )

    // Merge extracted data with enriched data (enriched takes priority)
    const finalData = {
      ...extractedData,
      ...enrichedData,
    }

    if (existing.length > 0) {
      // Update existing college
      const updateData: any = {
        updatedAt: new Date(),
      }

      // Only update fields that are missing or if enriched data provides better info
      if (finalData.description && (!existing[0].description || existing[0].description.length < 50)) {
        updateData.description = finalData.description
      }
      if (finalData.website && !existing[0].website) {
        updateData.website = finalData.website
      }
      if (finalData.ranking && !existing[0].ranking) {
        updateData.ranking = finalData.ranking
      }
      if (finalData.location && !existing[0].location) {
        updateData.location = finalData.location
      }
      if (finalData.city && !existing[0].city) {
        updateData.city = finalData.city
      }
      if (finalData.state && !existing[0].state) {
        updateData.state = finalData.state
      }
      if (finalData.accreditation && !existing[0].accreditation) {
        updateData.accreditation = finalData.accreditation
      }
      if (finalData.establishedYear && !existing[0].establishedYear) {
        updateData.establishedYear = finalData.establishedYear
      }
      if (finalData.hostelFees && !existing[0].hostelFees) {
        updateData.hostelFees = finalData.hostelFees
      }
      if (finalData.averagePackage && !existing[0].averagePackage) {
        updateData.averagePackage = finalData.averagePackage
      }
      if (finalData.highestPackage && !existing[0].highestPackage) {
        updateData.highestPackage = finalData.highestPackage
      }
      if (finalData.entranceExams && Array.isArray(finalData.entranceExams)) {
        updateData.entranceExams = finalData.entranceExams
      }
      if (finalData.ownership && !existing[0].ownership) {
        updateData.ownership = finalData.ownership
      }
      if (finalData.campusSize && !existing[0].campusSize) {
        updateData.campusSize = finalData.campusSize
      }
      if (finalData.totalStudents && !existing[0].totalStudents) {
        updateData.totalStudents = finalData.totalStudents
      }
      if (finalData.email && !existing[0].email) {
        updateData.email = finalData.email
      }
      if (finalData.phone && !existing[0].phone) {
        updateData.phone = finalData.phone
      }

      if (Object.keys(updateData).length > 1) { // More than just updatedAt
        await db
          .update(colleges)
          .set(updateData)
          .where(eq(colleges.id, existing[0].id))
        console.log(`✅ Updated college from web search with AI enrichment: ${collegeName}`)
      }
    } else {
      // Create new college entry
      const slug = collegeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      
      // Check if slug already exists
      const existingSlug = await db
        .select()
        .from(colleges)
        .where(eq(colleges.slug, slug))
        .limit(1)

      const finalSlug = existingSlug.length > 0 ? `${slug}-${Date.now()}` : slug

      await db
        .insert(colleges)
        .values({
          name: collegeName,
          slug: finalSlug,
          description: finalData.description || `Information about ${collegeName} based on web search and AI enrichment.`,
          website: finalData.website || extractedData.website,
          location: finalData.location || extractedData.location,
          city: finalData.city || extractedData.location?.split(",")[0] || null,
          state: finalData.state || null,
          ranking: finalData.ranking || extractedData.ranking,
          accreditation: finalData.accreditation,
          establishedYear: finalData.establishedYear,
          hostelFees: finalData.hostelFees,
          averagePackage: finalData.averagePackage,
          highestPackage: finalData.highestPackage,
          entranceExams: finalData.entranceExams || [],
          ownership: finalData.ownership,
          campusSize: finalData.campusSize,
          totalStudents: finalData.totalStudents,
          email: finalData.email,
          phone: finalData.phone,
          isEnabled: false, // Disabled by default - needs admin review
          isAcademicAlliance: false,
        })
      console.log(`✅ Created new college from web search with AI enrichment: ${collegeName} (disabled, needs review)`)
    }
  } catch (error) {
    console.error("Error saving and enriching college from web search:", error)
    // Don't throw - this is a background operation
  }
}
