import { Metadata } from "next"
import { OllamaProvider } from "@/lib/ai/providers/ollama"
import { OpenAIProvider } from "@/lib/ai/providers/openai"
import { OpenRouterProvider } from "@/lib/ai/providers/openrouter"
import { CustomAIProvider } from "@/lib/ai/providers/custom"
import type { AIProvider } from "@/lib/ai/providers/base"
import { isAIEnabled } from "@/lib/ai/aiEnabled"
import { getAIConfig } from "@/lib/ai/config"
import { baseUrl } from "@/lib/constants"

/**
 * Get AI provider instance for SEO enhancements
 * Uses database config first, then falls back to environment variables
 */
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
    console.error("Failed to initialize AI provider for SEO:", error)
    return null
  }
}

/**
 * AI-powered description enhancement
 * Generates SEO-optimized, engaging descriptions
 */
async function enhanceDescriptionWithAI(
  baseDescription: string,
  context: {
    name: string
    location?: string | null
    type?: string
    additionalInfo?: string
  }
): Promise<string | null> {
  let provider: AIProvider | null = null
  try {
    provider = await getAIProvider()
    if (!provider) return null
  } catch (error) {
    // Provider initialization failed, fall back to database values
    return null
  }

  try {
    const prompt = `You are an SEO expert. Generate a compelling, SEO-optimized meta description (120-160 characters) for a college/university page.

College Name: ${context.name}
Location: ${context.location || "Not specified"}
Type: ${context.type || "Educational Institution"}
Current Description: ${baseDescription}
${context.additionalInfo ? `Additional Info: ${context.additionalInfo}` : ""}

Requirements:
- Must be 120-160 characters exactly
- Include the full college name early in the description
- Include location if available
- Be engaging and informative
- Include relevant keywords naturally
- Focus on what students search for (admission, courses, fees, placements)
- Return ONLY the description text, no quotes or explanations

Generate the optimized description:`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert SEO copywriter specializing in educational content. Generate concise, keyword-rich meta descriptions.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    // Clean up the response
    let cleaned = response.trim()
    // Remove quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1)
    }

    // Validate length
    if (cleaned.length >= 100 && cleaned.length <= 170) {
      return cleaned
    }

    return null
  } catch (error: any) {
    // Silently fail and fall back to database values
    // Only log unexpected errors (not service unavailable/timeout/connection issues)
    const errorMsg = (error?.message || error?.toString() || "").toLowerCase()
    const isExpectedError = 
      errorMsg.includes("service unavailable") || 
      errorMsg.includes("timed out") ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("cannot connect") ||
      errorMsg.includes("bad gateway") ||
      errorMsg.includes("connection") ||
      errorMsg.includes("econnrefused") ||
      error?.name === "AbortError"
    
    if (!isExpectedError) {
      console.error("AI description enhancement failed:", error?.message || error)
    }
    return null
  }
}

/**
 * AI-powered title optimization
 * Generates SEO-optimized titles with better keyword placement
 */
async function enhanceTitleWithAI(
  baseTitle: string,
  context: {
    name: string
    location?: string | null
    type?: string
  }
): Promise<string | null> {
  let provider: AIProvider | null = null
  try {
    provider = await getAIProvider()
    if (!provider) return null
  } catch (error) {
    // Provider initialization failed, fall back to database values
    return null
  }

  try {
    const prompt = `You are an SEO expert. Optimize this page title for better search rankings.

Current Title: ${baseTitle}
College Name: ${context.name}
Location: ${context.location || "Not specified"}
Type: ${context.type || "Educational Institution"}

Requirements:
- Keep it under 60 characters
- Put the college name first for exact match searches
- Include location if relevant
- Include key search terms (admission, courses, fees, placements)
- Use pipe (|) separator before brand name
- Return ONLY the title text, no quotes or explanations

Generate the optimized title:`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert SEO specialist. Generate optimized page titles for educational websites.",
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

    if (cleaned.length > 0 && cleaned.length <= 70) {
      return cleaned
    }

    return null
  } catch (error: any) {
    // Silently fail and fall back to database values
    // Only log unexpected errors (not service unavailable/timeout/connection issues)
    const errorMsg = (error?.message || error?.toString() || "").toLowerCase()
    const isExpectedError = 
      errorMsg.includes("service unavailable") || 
      errorMsg.includes("timed out") ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("cannot connect") ||
      errorMsg.includes("bad gateway") ||
      errorMsg.includes("connection") ||
      errorMsg.includes("econnrefused") ||
      error?.name === "AbortError"
    
    if (!isExpectedError) {
      console.error("AI title enhancement failed:", error?.message || error)
    }
    return null
  }
}

/**
 * AI-powered keyword generation
 * Generates relevant, long-tail keywords for better SEO
 */
async function generateKeywordsWithAI(
  baseKeywords: string[],
  context: {
    name: string
    location?: string | null
    courses?: Array<{ name: string }> | null
    ranking?: number | null
    accreditation?: string | null
  }
): Promise<string[] | null> {
  let provider: AIProvider | null = null
  try {
    provider = await getAIProvider()
    if (!provider) return null
  } catch (error) {
    // Provider initialization failed, fall back to database values
    return null
  }

  try {
    const courseNames = context.courses?.slice(0, 5).map((c) => c.name).join(", ") || "Not specified"
    const prompt = `You are an SEO expert. Generate 15-20 relevant, long-tail keywords for a college page.

College Name: ${context.name}
Location: ${context.location || "Not specified"}
Courses: ${courseNames}
Ranking: ${context.ranking || "Not specified"}
Accreditation: ${context.accreditation || "Not specified"}
Existing Keywords: ${baseKeywords.slice(0, 10).join(", ")}

Requirements:
- Generate 15-20 keywords
- Include long-tail keywords (e.g., "admission process", "fee structure", "placement record")
- Include location-based keywords if location is available
- Include course-specific keywords
- Include question-based keywords (e.g., "how to get admission", "is it good college")
- Return ONLY a comma-separated list of keywords, no explanations
- Each keyword should be 2-5 words

Generate the keywords:`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert SEO keyword researcher. Generate relevant, searchable keywords for educational content.",
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

    // Parse comma-separated keywords
    const keywords = cleaned
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0 && k.length <= 50)

    if (keywords.length >= 5) {
      return keywords
    }

    return null
  } catch (error: any) {
    // Silently fail and fall back to database values
    // Only log unexpected errors (not service unavailable/timeout/connection issues)
    const errorMsg = (error?.message || error?.toString() || "").toLowerCase()
    const isExpectedError = 
      errorMsg.includes("service unavailable") || 
      errorMsg.includes("timed out") ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("cannot connect") ||
      errorMsg.includes("bad gateway") ||
      errorMsg.includes("connection") ||
      errorMsg.includes("econnrefused") ||
      error?.name === "AbortError"
    
    if (!isExpectedError) {
      console.error("AI keyword generation failed:", error?.message || error)
    }
    return null
  }
}

/**
 * AI-powered FAQ answer enhancement
 * Makes FAQ answers more natural and comprehensive
 */
async function enhanceFAQAnswerWithAI(
  question: string,
  baseAnswer: string,
  context: {
    collegeName: string
    location?: string | null
    additionalContext?: string
  }
): Promise<string | null> {
  let provider: AIProvider | null = null
  try {
    provider = await getAIProvider()
    if (!provider) return null
  } catch (error) {
    // Provider initialization failed, fall back to database values
    return null
  }

  try {
    const prompt = `You are an educational content expert. Enhance this FAQ answer to be more natural, comprehensive, and helpful.

Question: ${question}
Current Answer: ${baseAnswer}
College Name: ${context.collegeName}
Location: ${context.location || "Not specified"}
${context.additionalContext ? `Additional Context: ${context.additionalContext}` : ""}

Requirements:
- Keep the answer accurate and factual
- Make it more natural and conversational
- Add helpful details without being verbose
- Keep it between 100-200 words
- Maintain all important information from the original answer
- Return ONLY the enhanced answer text, no quotes or explanations

Generate the enhanced answer:`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are an expert educational content writer. Create clear, helpful, and natural FAQ answers.",
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

    if (cleaned.length >= 50 && cleaned.length <= 300) {
      return cleaned
    }

    return null
  } catch (error: any) {
    // Silently fail and fall back to database values
    // Only log unexpected errors (not service unavailable/timeout/connection issues)
    const errorMsg = (error?.message || error?.toString() || "").toLowerCase()
    const isExpectedError = 
      errorMsg.includes("service unavailable") || 
      errorMsg.includes("timed out") ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("cannot connect") ||
      errorMsg.includes("bad gateway") ||
      errorMsg.includes("connection") ||
      errorMsg.includes("econnrefused") ||
      error?.name === "AbortError"
    
    if (!isExpectedError) {
      console.error("AI FAQ enhancement failed:", error?.message || error)
    }
    return null
  }
}

interface College {
  id: number
  name: string
  slug: string
  location?: string | null
  city?: string | null
  description?: string | null
  images?: string[] | null
  courses?: Array<{ name: string }> | null
}

interface Course {
  id: number
  name: string
  slug: string
  description?: string | null
  duration?: string | null
  fees?: number | null
  level?: string | null
}

interface CollegeForMeta extends College {
  ranking?: number | null
  establishedYear?: number | null
  accreditation?: string | null
  averagePackage?: number | null
  courses?: Array<{ name: string }> | null
}

export async function generateCollegeMeta(college: CollegeForMeta, useAI: boolean = true): Promise<Metadata> {
  const collegeName = college.name
  const location = college.location || college.city || ""
  const locationText = location ? ` in ${location}` : ""
  
  // Extract common abbreviations/alternative names for ALL colleges
  const alternativeNames: string[] = []
  const nameWords = collegeName.split(" ").filter(w => w.length > 0)
  
  // Strategy 1: Generate abbreviation from first letters (e.g., "JMI" from "Jamia Millia Islamia")
  if (nameWords.length >= 2) {
    // For 2+ word names, create abbreviation
    const abbreviation = nameWords.map(w => {
      // Skip common words like "of", "and", "the", "in", "at"
      const skipWords = ["of", "and", "the", "in", "at", "for", "to", "a", "an"]
      if (skipWords.includes(w.toLowerCase())) {
        return ""
      }
      return w[0].toUpperCase()
    }).join("")
    
    if (abbreviation.length >= 2 && abbreviation.length <= 6) {
      alternativeNames.push(abbreviation)
    }
  }
  
  // Strategy 2: Extract known abbreviations from name (e.g., "IIT" from "Indian Institute of Technology")
  const knownPatterns = [
    { pattern: /Indian Institute of Technology/i, abbrev: "IIT" },
    { pattern: /Indian Institute of Management/i, abbrev: "IIM" },
    { pattern: /All India Institute of Medical Sciences/i, abbrev: "AIIMS" },
    { pattern: /National Institute of Technology/i, abbrev: "NIT" },
    { pattern: /National Institute of Fashion Technology/i, abbrev: "NIFT" },
    { pattern: /National Institute of Design/i, abbrev: "NID" },
    { pattern: /Jamia Millia Islamia/i, abbrev: "JMI" },
    { pattern: /Delhi University/i, abbrev: "DU" },
    { pattern: /Jawaharlal Nehru University/i, abbrev: "JNU" },
    { pattern: /Banaras Hindu University/i, abbrev: "BHU" },
    { pattern: /Aligarh Muslim University/i, abbrev: "AMU" },
    { pattern: /University of Delhi/i, abbrev: "DU" },
    { pattern: /Birla Institute of Technology/i, abbrev: "BITS" },
    { pattern: /Vellore Institute of Technology/i, abbrev: "VIT" },
    { pattern: /Manipal Institute of Technology/i, abbrev: "MIT" },
    { pattern: /SRM Institute/i, abbrev: "SRM" },
    { pattern: /Amity University/i, abbrev: "Amity" },
    { pattern: /Lovely Professional University/i, abbrev: "LPU" },
    { pattern: /Symbiosis International/i, abbrev: "SIU" },
    { pattern: /Christ University/i, abbrev: "Christ" },
  ]
  
  for (const { pattern, abbrev } of knownPatterns) {
    if (pattern.test(collegeName) && !alternativeNames.includes(abbrev)) {
      alternativeNames.push(abbrev)
    }
  }
  
  // Strategy 3: Extract acronyms already in the name (e.g., if name contains "IIT Delhi", extract "IIT")
  const acronymMatch = collegeName.match(/\b[A-Z]{2,6}\b/g)
  if (acronymMatch) {
    acronymMatch.forEach(acronym => {
      // Only add if it's 2-6 letters and not already added
      if (acronym.length >= 2 && acronym.length <= 6 && !alternativeNames.includes(acronym)) {
        alternativeNames.push(acronym)
      }
    })
  }
  
  // Strategy 4: For single-word or short names, use first few letters if meaningful
  if (nameWords.length === 1 && collegeName.length > 4) {
    const shortName = collegeName.substring(0, 3).toUpperCase()
    if (!alternativeNames.includes(shortName)) {
      alternativeNames.push(shortName)
    }
  }
  
  // Build keyword-rich description with full college name emphasized
  let description = college.description || ""
  
  // If no description or short description, create a comprehensive one
  if (!description || description.length < 100) {
    const parts: string[] = []
    // Start with full college name for better SEO
    parts.push(`${collegeName}${locationText} is a prestigious institution`)
    
    if (college.ranking) {
      parts.push(`ranked ${college.ranking} by NIRF`)
    }
    
    if (college.establishedYear) {
      parts.push(`established in ${college.establishedYear}`)
    }
    
    if (college.accreditation) {
      parts.push(`${college.accreditation} accredited`)
    }
    
    parts.push(`${collegeName} offers comprehensive information about admission process, courses, fees, placements, cutoffs, and reviews`)
    
    if (college.courses && college.courses.length > 0) {
      const courseNames = college.courses.slice(0, 3).map(c => c.name).join(", ")
      parts.push(`${collegeName} offers ${courseNames}${college.courses.length > 3 ? ` and ${college.courses.length - 3} more courses` : ""}`)
    }
    
    description = parts.join(", ") + "."
  } else {
    // Enhance existing description - ensure full name appears early
    if (!description.toLowerCase().includes(collegeName.toLowerCase())) {
      description = `${collegeName}${locationText}. ${description}`
    }
    // Enhance with keywords
    if (!description.toLowerCase().includes("admission")) {
      description += ` Get ${collegeName} admission details, application process, and eligibility criteria.`
    }
    if (!description.toLowerCase().includes("course")) {
      description += ` Explore ${collegeName} courses, fees, and program details.`
    }
  }
  
  // Enhanced title with full college name first for better rankings
  // Put full name at the start for exact match searches
  let title = `${collegeName}${locationText ? ` - ${location}` : ""} | Admission 2025, Courses, Fees, Placements, Rankings, Cutoffs | SeeMyCampus`
  
  // Build comprehensive keywords array first (needed for AI enhancement)
  const keywords: string[] = [
    collegeName, // Full name first for exact match
    ...alternativeNames, // Add abbreviations (e.g., "JMI")
    `${collegeName} admission`,
    `${collegeName} admission 2025`,
    `${collegeName} courses`,
    `${collegeName} fees`,
    `${collegeName} placement`,
    `${collegeName} ranking`,
    `${collegeName} cutoffs`,
    `${collegeName} reviews`,
    `${collegeName} NIRF ranking`,
  ]
  
  // Add alternative name variations for ALL colleges (e.g., "JMI admission", "IIT courses")
  alternativeNames.forEach(altName => {
    keywords.push(
      `${altName} admission`,
      `${altName} admission 2025`,
      `${altName} courses`,
      `${altName} fees`,
      `${altName} ranking`,
      `${altName} cutoffs`,
      `${altName} placement`,
    )
    
    // Add location-specific variations if location exists
    if (location) {
      keywords.push(
        `${altName} ${location}`,
        `${altName} ${college.city || location}`,
      )
    }
  })
  
  if (location) {
    keywords.push(
      `${collegeName} ${location}`,
      `colleges in ${location}`,
      `best colleges in ${location}`,
      location
    )
  }
  
  if (college.city && college.city !== location) {
    keywords.push(`${collegeName} ${college.city}`, `colleges in ${college.city}`)
  }
  
  keywords.push(
    "college admission",
    "college courses",
    "college fees",
    "college placement",
    "college ranking",
    "education",
    "India colleges",
    "university",
    "institute"
  )
  
  if (college.accreditation) {
    keywords.push(`${college.accreditation} colleges`)
  }
  
  if (college.courses && college.courses.length > 0) {
    college.courses.slice(0, 5).forEach(course => {
      keywords.push(`${course.name} ${location || ""}`.trim())
    })
  }

  // AI-powered enhancements (optional, with fallback)
  // Run AI enhancements in parallel with timeout to avoid blocking page render
  let aiEnabled = false
  try {
    aiEnabled = await isAIEnabled()
  } catch (error) {
    // If AI check fails, continue without AI
    aiEnabled = false
  }
  
  // Run all AI enhancements in parallel with timeout to avoid blocking page render
  // Use Promise.race to timeout after 2 seconds max, ensuring fast page loads
  if (useAI && aiEnabled) {
    try {
      // Create a timeout promise that resolves to null after 2 seconds
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 2000)
      })
      
      // Run all AI enhancements in parallel
      const aiEnhancementsPromise = Promise.allSettled([
        enhanceDescriptionWithAI(description, {
          name: collegeName,
          location: location,
          type: "College/University",
          additionalInfo: `Ranking: ${college.ranking || "N/A"}, Established: ${college.establishedYear || "N/A"}, Accreditation: ${college.accreditation || "N/A"}`,
        }).catch(() => null),
        enhanceTitleWithAI(title, {
          name: collegeName,
          location: location,
          type: "College/University",
        }).catch(() => null),
        generateKeywordsWithAI(keywords, {
          name: collegeName,
          location: location,
          courses: college.courses || null,
          ranking: college.ranking || null,
          accreditation: college.accreditation || null,
        }).catch(() => null),
      ])
      
      // Race: either get results or timeout after 2 seconds
      const raceResult: PromiseSettledResult<string | string[] | null>[] | null = await Promise.race([
        aiEnhancementsPromise,
        timeoutPromise.then(() => null)
      ]) as PromiseSettledResult<string | string[] | null>[] | null
      
      // Process results if we got them before timeout
      if (raceResult && Array.isArray(raceResult)) {
        // Update description if AI enhancement succeeded
        if (raceResult[0]?.status === "fulfilled" && raceResult[0].value) {
          description = raceResult[0].value
        }
        // Update title if AI enhancement succeeded
        if (raceResult[1]?.status === "fulfilled" && raceResult[1].value) {
          title = raceResult[1].value
        }
        // Update keywords if AI enhancement succeeded
        if (raceResult[2]?.status === "fulfilled" && raceResult[2].value && Array.isArray(raceResult[2].value) && raceResult[2].value.length > 0) {
          raceResult[2].value.forEach((kw: string) => {
            if (!keywords.includes(kw)) {
              keywords.push(kw)
            }
          })
        }
      }
    } catch (error) {
      // Silently fail - use database values
    }
  }
  
  // Ensure description is between 120-160 characters for optimal SEO
  // But prioritize including full college name
  if (description.length > 160) {
    // Try to keep full name in first 160 chars
    const nameIndex = description.toLowerCase().indexOf(collegeName.toLowerCase())
    if (nameIndex > 0 && nameIndex < 50) {
      // Name appears early, truncate from end
      description = description.substring(0, 157) + "..."
    } else {
      // Name appears late, truncate but keep name
      const beforeName = description.substring(0, nameIndex)
      const nameAndAfter = description.substring(nameIndex)
      if (beforeName.length + nameAndAfter.length > 160) {
        description = beforeName.substring(0, Math.max(0, 160 - nameAndAfter.length - 3)) + "..." + nameAndAfter.substring(0, Math.min(nameAndAfter.length, 160 - beforeName.length))
      }
    }
  } else if (description.length < 120) {
    description += ` Find complete information about ${collegeName}${locationText} including admission, courses, fees, placements, and reviews.`
  }
  
  const imageUrl = college.images && Array.isArray(college.images) && college.images.length > 0 
    ? college.images[0] 
    : (typeof college.images === 'string' ? college.images : undefined)

  return {
    title,
    description,
    keywords: keywords.filter(Boolean).filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/colleges/${college.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: `${collegeName} - SeeMyCampus` }] : undefined,
      locale: "en_IN",
      siteName: "SeeMyCampus",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/colleges/${college.slug}`,
    },
  }
}

export async function generateCourseMeta(course: Course, college?: { name: string; slug: string } | null, useAI: boolean = true): Promise<Metadata> {
  let title = `${course.name}${college ? ` at ${college.name}` : ""} | SeeMyCampus`
  let description =
    course.description ||
    `Learn about ${course.name}${college ? ` at ${college.name}` : ""}. ${course.duration ? `Duration: ${course.duration}.` : ""} ${course.fees ? `Fees: ₹${course.fees.toLocaleString()}.` : ""} Find admission details and more.`

  // AI-powered enhancements for course meta
  const aiEnabled = await isAIEnabled()
  if (useAI && aiEnabled) {
    const aiDescription = await enhanceDescriptionWithAI(description, {
      name: course.name,
      location: college?.name || null,
      type: "Course/Program",
      additionalInfo: `Duration: ${course.duration || "N/A"}, Fees: ${course.fees ? `₹${course.fees.toLocaleString()}` : "N/A"}, Level: ${course.level || "N/A"}`,
    })
    if (aiDescription) {
      description = aiDescription
    }

    const aiTitle = await enhanceTitleWithAI(title, {
      name: course.name,
      location: college?.name || null,
      type: "Course",
    })
    if (aiTitle) {
      title = aiTitle
    }
  }

  return {
    title,
    description,
    keywords: [
      course.name,
      college?.name || "",
      course.level || "",
      "course",
      "admissions",
      "education",
      "college course",
      "India courses",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/courses/${course.slug}`,
      images: [
        {
          url: `${baseUrl}/main-logo-xxxx.png`,
          width: 1200,
          height: 630,
          alt: `${course.name} - SeeMyCampus`,
        },
      ],
      locale: "en_IN",
      siteName: "SeeMyCampus",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/main-logo-xxxx.png`],
    },
    alternates: {
      canonical: `${baseUrl}/courses/${course.slug}`,
    },
  }
}

interface CollegeWithDetails extends College {
  ranking?: number | null
  establishedYear?: number | null
  accreditation?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  averagePackage?: number | null
  highestPackage?: number | null
  ownership?: string | null
  campusSize?: string | null
  totalStudents?: number | null
  courses?: Array<{ name: string; slug: string; level?: string | null; description?: string | null }> | null
  entranceExams?: string[] | null
  reviewCount?: number | null // Number of approved reviews
  averageRating?: number | null // Average rating from reviews (1-5)
}

export function generateStructuredDataCollege(college: CollegeWithDetails) {
  // Extract alternative names for structured data (same logic as generateCollegeMeta)
  const alternativeNames: string[] = []
  const nameWords = college.name.split(" ").filter(w => w.length > 0)
  
  // Generate abbreviation from first letters
  if (nameWords.length >= 2) {
    const skipWords = ["of", "and", "the", "in", "at", "for", "to", "a", "an"]
    const abbreviation = nameWords.map(w => {
      if (skipWords.includes(w.toLowerCase())) return ""
      return w[0].toUpperCase()
    }).join("")
    
    if (abbreviation.length >= 2 && abbreviation.length <= 6) {
      alternativeNames.push(abbreviation)
    }
  }
  
  // Known patterns
  const knownPatterns = [
    { pattern: /Indian Institute of Technology/i, abbrev: "IIT" },
    { pattern: /Indian Institute of Management/i, abbrev: "IIM" },
    { pattern: /All India Institute of Medical Sciences/i, abbrev: "AIIMS" },
    { pattern: /National Institute of Technology/i, abbrev: "NIT" },
    { pattern: /Jamia Millia Islamia/i, abbrev: "JMI" },
    { pattern: /Delhi University/i, abbrev: "DU" },
    { pattern: /Jawaharlal Nehru University/i, abbrev: "JNU" },
    { pattern: /Banaras Hindu University/i, abbrev: "BHU" },
    { pattern: /Aligarh Muslim University/i, abbrev: "AMU" },
    { pattern: /Birla Institute of Technology/i, abbrev: "BITS" },
    { pattern: /Vellore Institute of Technology/i, abbrev: "VIT" },
  ]
  
  for (const { pattern, abbrev } of knownPatterns) {
    if (pattern.test(college.name) && !alternativeNames.includes(abbrev)) {
      alternativeNames.push(abbrev)
    }
  }
  
  // Extract acronyms from name
  const acronymMatch = college.name.match(/\b[A-Z]{2,6}\b/g)
  if (acronymMatch) {
    acronymMatch.forEach(acronym => {
      if (acronym.length >= 2 && acronym.length <= 6 && !alternativeNames.includes(acronym)) {
        alternativeNames.push(acronym)
      }
    })
  }
  
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college.name,
    url: `${baseUrl}/colleges/${college.slug}`,
  }
  
  // Add alternative names if available
  if (alternativeNames.length > 0) {
    structuredData.alternateName = alternativeNames
  }

  if (college.description) {
    structuredData.description = college.description
  }

  if (college.images && college.images.length > 0) {
    const imageUrl = Array.isArray(college.images) ? college.images[0] : college.images
    structuredData.image = {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    }
    structuredData.logo = {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    }
  }

  if (college.city || college.location) {
    structuredData.address = {
      "@type": "PostalAddress",
      addressLocality: college.city || college.location || "",
      addressRegion: college.location || "",
      addressCountry: "IN",
    }
  }

  if (college.website) {
    structuredData.sameAs = [college.website]
  }

  if (college.email) {
    structuredData.email = college.email
  }

  if (college.phone) {
    structuredData.telephone = college.phone
  }

  if (college.establishedYear) {
    structuredData.foundingDate = college.establishedYear.toString()
  }

  if (college.accreditation) {
    structuredData.accreditation = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: college.accreditation,
    }
  }

  // Add courses/programs offered
  if (college.courses && college.courses.length > 0) {
    structuredData.hasProgram = college.courses.map((course) => {
      const courseData: Record<string, any> = {
        "@type": "Course",
        name: course.name,
        url: `${baseUrl}/courses/${course.slug}`,
      }
      
      // Add description (required for rich results)
      if (course.description) {
        courseData.description = course.description
      } else {
        // Generate a basic description if missing
        courseData.description = `${course.name} program at ${college.name}${college.location ? ` in ${college.location}` : ""}. ${course.level ? `This is a ${course.level} level program.` : ""}`
      }
      
      // Add provider (college) - recommended for rich results
      courseData.provider = {
        "@type": "EducationalOrganization",
        name: college.name,
        url: `${baseUrl}/colleges/${college.slug}`,
      }
      
      // Add educational level if available
      if (course.level) {
        courseData.educationalLevel = course.level
      }
      
      return courseData
    })
  }

  // Add aggregate rating only if reviews exist (reviewCount must be > 0)
  // Note: This should be populated with actual review data when available
  // For now, we only include it if explicitly provided with valid review count
  if (college.reviewCount && college.reviewCount > 0 && college.averageRating) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: college.averageRating.toString(),
      reviewCount: college.reviewCount.toString(),
    }
  }

  // Add additional properties
  if (college.ranking) {
    structuredData.award = `Ranked ${college.ranking}`
  }

  if (college.totalStudents) {
    structuredData.numberOfStudents = college.totalStudents
  }

  if (college.ownership) {
    structuredData.ownership = college.ownership
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(structuredData).filter(([_, value]) => value !== undefined)
  )
}

// Generate FAQ structured data for colleges
export async function generateCollegeFAQStructuredData(college: CollegeWithDetails, useAI: boolean = true) {
  const faqs: Array<{ question: string; answer: string }> = []
  
  // Admission FAQ
  const admissionAnswer = `The admission process for ${college.name}${college.location ? ` in ${college.location}` : ""} typically involves${college.entranceExams && college.entranceExams.length > 0 ? ` entrance exams like ${college.entranceExams.slice(0, 3).join(", ")}` : " application submission"}. Visit the official website or contact the college directly for detailed admission requirements and deadlines.`
  
  let enhancedAdmissionAnswer = admissionAnswer
  let aiEnabled = false
  try {
    aiEnabled = await isAIEnabled()
  } catch (error) {
    // If AI check fails, continue without AI
    aiEnabled = false
  }
  
  if (useAI && aiEnabled) {
    try {
      // Add timeout to FAQ enhancement (1 second max)
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
      const aiAnswerPromise = enhanceFAQAnswerWithAI(
        `What is the admission process for ${college.name}?`,
        admissionAnswer,
        {
          collegeName: college.name,
          location: college.location || null,
          additionalContext: `Entrance Exams: ${college.entranceExams?.join(", ") || "Not specified"}`,
        }
      ).catch(() => null)
      
      const aiAnswer: string | null = await Promise.race([aiAnswerPromise, timeoutPromise]) as string | null
      if (aiAnswer) {
        enhancedAdmissionAnswer = aiAnswer
      }
    } catch (error) {
      // Silently fail - use database answer
    }
  }
  
  faqs.push({
    question: `What is the admission process for ${college.name}?`,
    answer: enhancedAdmissionAnswer,
  })
  
  // Fees FAQ
  const feesAnswer = `The fees for ${college.name}${college.location ? ` in ${college.location}` : ""} vary by course and program. ${college.courses && college.courses.length > 0 ? `The college offers ${college.courses.length} courses. ` : ""}For detailed fee structure, please visit the college website or contact the admissions office directly.`
  
  let enhancedFeesAnswer = feesAnswer
  if (useAI && aiEnabled) {
    try {
      // Add timeout to FAQ enhancement (1 second max)
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
      const aiAnswerPromise = enhanceFAQAnswerWithAI(
        `What are the fees for ${college.name}?`,
        feesAnswer,
        {
          collegeName: college.name,
          location: college.location || null,
          additionalContext: `Courses: ${college.courses?.length || 0} courses available`,
        }
      ).catch(() => null)
      
      const aiAnswer: string | null = await Promise.race([aiAnswerPromise, timeoutPromise]) as string | null
      if (aiAnswer) {
        enhancedFeesAnswer = aiAnswer
      }
    } catch (error) {
      // Silently fail - use database answer
    }
  }
  
  faqs.push({
    question: `What are the fees for ${college.name}?`,
    answer: enhancedFeesAnswer,
  })
  
  // Courses FAQ
  if (college.courses && college.courses.length > 0) {
    const courseNames = college.courses.slice(0, 5).map(c => c.name).join(", ")
    faqs.push({
      question: `What courses are offered at ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} offers various courses including ${courseNames}${college.courses.length > 5 ? ` and ${college.courses.length - 5} more courses` : ""}. Visit the college page to see all available courses and their details.`
    })
  }
  
  // Ranking FAQ
  if (college.ranking) {
    faqs.push({
      question: `What is the ranking of ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} is ranked ${college.ranking}. Rankings may vary by different ranking agencies and criteria.`
    })
  }
  
  // Placement FAQ
  if (college.averagePackage || college.highestPackage) {
    const placementInfo: string[] = []
    if (college.averagePackage) {
      placementInfo.push(`average package of ₹${college.averagePackage.toLocaleString()}`)
    }
    if (college.highestPackage) {
      placementInfo.push(`highest package of ₹${college.highestPackage.toLocaleString()}`)
    }
    faqs.push({
      question: `What are the placement opportunities at ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} offers good placement opportunities with ${placementInfo.join(" and ")}. The college has a dedicated placement cell that assists students in securing job opportunities.`
    })
  }
  
  // Accreditation FAQ
  if (college.accreditation) {
    faqs.push({
      question: `Is ${college.name} accredited?`,
      answer: `Yes, ${college.name}${college.location ? ` in ${college.location}` : ""} is accredited by ${college.accreditation}, which ensures quality education and recognition of degrees.`
    })
  }
  
  // Established year FAQ
  if (college.establishedYear) {
    faqs.push({
      question: `When was ${college.name} established?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} was established in ${college.establishedYear}, making it ${new Date().getFullYear() - college.establishedYear} years old.`
    })
  }
  
  // Admission process FAQ
  faqs.push({
    question: `How to get admission in ${college.name}?`,
    answer: `To get admission in ${college.name}${college.location ? ` in ${college.location}` : ""}, you need to ${college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0 ? `qualify in ${college.entranceExams.join(" or ")} entrance exam` : "meet the eligibility criteria"}. The admission process typically involves ${college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0 ? "entrance exam scores, " : ""}application submission, and selection based on merit. Visit the college website for detailed admission procedures.`
  })
  
  // Location FAQ
  if (college.location || college.city) {
    const state = (college as any).state
    faqs.push({
      question: `Where is ${college.name} located?`,
      answer: `${college.name} is located in ${college.location || college.city}${state ? `, ${state}` : ""}. ${college.city && college.location && college.city !== college.location ? `The city is ${college.city}.` : ""}`
    })
  }
  
  // Hostel FAQ
  const hostelFees = (college as any).hostelFees
  if (hostelFees) {
    faqs.push({
      question: `Does ${college.name} provide hostel facilities?`,
      answer: `Yes, ${college.name}${college.location ? ` in ${college.location}` : ""} provides hostel facilities. The hostel fees are approximately ₹${hostelFees.toLocaleString()} per year. Hostel availability may vary, so contact the college for more details.`
    })
  }
  
  // Entrance exam FAQ
  if (college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0) {
    faqs.push({
      question: `Which entrance exam is required for ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} accepts scores from ${college.entranceExams.length === 1 ? college.entranceExams[0] : college.entranceExams.slice(0, -1).join(", ") + (college.entranceExams.length > 1 ? `, or ${college.entranceExams[college.entranceExams.length - 1]}` : "")} entrance exam${college.entranceExams.length > 1 ? "s" : ""}. Check the college website for specific exam requirements and cutoff scores.`
    })
  }
  
  // Ownership FAQ
  if (college.ownership) {
    faqs.push({
      question: `Is ${college.name} a private or government college?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} is a ${college.ownership} college. ${college.ownership === "Government" || college.ownership === "Public" ? "Government colleges typically have lower fees and are funded by the government." : "Private colleges are independently funded and may have different fee structures."}`
    })
  }
  
  // Campus size FAQ
  if (college.campusSize) {
    faqs.push({
      question: `What is the campus size of ${college.name}?`,
      answer: `The campus of ${college.name}${college.location ? ` in ${college.location}` : ""} spans ${college.campusSize}, providing ample space for academic buildings, hostels, sports facilities, and other infrastructure.`
    })
  }
  
  // Total students FAQ
  if (college.totalStudents) {
    faqs.push({
      question: `How many students are enrolled at ${college.name}?`,
      answer: `${college.name}${college.location ? ` in ${college.location}` : ""} has approximately ${college.totalStudents.toLocaleString()} students enrolled across various programs and courses.`
    })
  }
  
  // Website FAQ
  if (college.website) {
    faqs.push({
      question: `What is the official website of ${college.name}?`,
      answer: `The official website of ${college.name}${college.location ? ` in ${college.location}` : ""} is ${college.website}. You can visit the website for detailed information about admission, courses, fees, and other college-related information.`
    })
  }
  
  // Contact FAQ
  if (college.phone || college.email) {
    const contactInfo: string[] = []
    if (college.phone) contactInfo.push(`phone: ${college.phone}`)
    if (college.email) contactInfo.push(`email: ${college.email}`)
    faqs.push({
      question: `How can I contact ${college.name}?`,
      answer: `You can contact ${college.name}${college.location ? ` in ${college.location}` : ""} through ${contactInfo.join(" or ")}. ${college.website ? `You can also visit their website at ${college.website} for more information.` : ""}`
    })
  }
  
  if (faqs.length === 0) {
    return null
  }
  
  return generateFAQStructuredData(faqs)
}

export function generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateReviewStructuredData(reviews: Array<{
  author: string
  rating: number
  reviewBody: string
  datePublished: string
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "CollegeOrUniversity",
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
  }
}

/**
 * Generate HowTo structured data for admission guides
 */
export function generateHowToStructuredData(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>,
  totalTime?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: step.image.startsWith("http") ? step.image : `${baseUrl}${step.image}`,
      }),
    })),
    ...(totalTime && { totalTime }),
  }
}

/**
 * Generate VideoObject structured data
 */
export function generateVideoObjectStructuredData(
  name: string,
  description: string,
  thumbnailUrl: string,
  contentUrl: string,
  uploadDate?: string,
  duration?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: thumbnailUrl.startsWith("http") ? thumbnailUrl : `${baseUrl}${thumbnailUrl}`,
    contentUrl: contentUrl.startsWith("http") ? contentUrl : `${baseUrl}${contentUrl}`,
    ...(uploadDate && { uploadDate }),
    ...(duration && { duration }),
  }
}

/**
 * Generate individual Review structured data (for single review)
 */
export function generateSingleReviewStructuredData(
  itemReviewed: { name: string; url: string },
  author: string,
  rating: number,
  reviewBody: string,
  datePublished: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "CollegeOrUniversity",
      name: itemReviewed.name,
      url: itemReviewed.url,
    },
    author: {
      "@type": "Person",
      name: author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody,
    datePublished,
  }
}

/**
 * Generate Article structured data for blog posts
 */
export function generateArticleStructuredData(
  title: string,
  description: string,
  author: string,
  publishedDate: string,
  modifiedDate?: string,
  imageUrl?: string,
  category?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "SeeMyCampus",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/main-logo-xxxx.png`,
      },
    },
    datePublished: publishedDate,
    ...(modifiedDate && { dateModified: modifiedDate }),
    ...(imageUrl && {
      image: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`,
    }),
    ...(category && { articleSection: category }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${title.toLowerCase().replace(/\s+/g, "-")}`,
    },
  }
}

/**
 * Generate BlogPosting structured data (more specific than Article)
 */
export function generateBlogPostingStructuredData(
  title: string,
  description: string,
  author: string,
  publishedDate: string,
  slug: string,
  modifiedDate?: string,
  imageUrl?: string,
  category?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "SeeMyCampus",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/main-logo-xxxx.png`,
      },
    },
    datePublished: publishedDate,
    ...(modifiedDate && { dateModified: modifiedDate }),
    ...(imageUrl && {
      image: imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`,
    }),
    ...(category && { articleSection: category }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`,
    },
    url: `${baseUrl}/blog/${slug}`,
  }
}

/**
 * Generate SiteNavigationElement structured data for sitelinks
 */
export function generateSiteNavigationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
  
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Main Navigation",
    url: baseUrl,
    hasPart: [
      {
        "@type": "SiteNavigationElement",
        name: "College Search",
        url: `${baseUrl}/colleges`,
        description: "Search and explore 60,000+ colleges and universities in India",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Admission Predictor",
        url: `${baseUrl}/admission-predictor`,
        description: "Predict your admission chances based on exam scores and rankings",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Compare Colleges",
        url: `${baseUrl}/compare`,
        description: "Compare multiple colleges side by side on fees, placements, and rankings",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Career Counseling",
        url: `${baseUrl}/career-counseling`,
        description: "Get expert career counseling and guidance for college admissions",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Scholarships",
        url: `${baseUrl}/scholarships`,
        description: "Find and apply for scholarships to fund your education",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Blog",
        url: `${baseUrl}/blog`,
        description: "Read articles about college admissions, courses, and career guidance",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Fee Calculator",
        url: `${baseUrl}/fee-calculator`,
        description: "Calculate total college fees including tuition, hostel, and other expenses",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Entrance Exams",
        url: `${baseUrl}/entrance-exams`,
        description: "Get information about entrance exam dates, syllabus, and preparation tips",
      },
    ],
  }
}

export function generateStructuredDataCourse(course: Course, college?: { name: string; slug: string } | null) {
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    courseCode: course.slug,
    url: `${baseUrl}/courses/${course.slug}`,
  }

  if (course.description) {
    structuredData.description = course.description
  }

  if (college) {
    structuredData.provider = {
      "@type": "EducationalOrganization",
      name: college.name,
      url: `${baseUrl}/colleges/${college.slug}`,
    }
  }

  if (course.level) {
    structuredData.educationalLevel = course.level
  }

  if (course.duration) {
    structuredData.timeRequired = course.duration
  }

  if (course.fees) {
    structuredData.offers = {
      "@type": "Offer",
      price: course.fees,
      priceCurrency: "INR",
    }
  }

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(structuredData).filter(([_, value]) => value !== undefined)
  )
}

