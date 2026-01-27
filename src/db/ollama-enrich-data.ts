// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

// Create database connection directly to avoid import timing issues
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { eq } from "drizzle-orm"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

import { colleges, courses, collegeReviews, placementStats, applicationGuides } from "./schema"
import { OllamaProvider } from "@/lib/ai/providers/ollama"
import { removeDuplicates } from "./remove-duplicates"

const ollama = new OllamaProvider({})

// Helper function to parse JSON from Ollama response with error handling
function parseJsonFromOllama(response: string, expectedType: 'array' | 'object' = 'array'): any {
  try {
    let jsonStr = response.trim()

    // Remove markdown code blocks
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }

    // Try to extract JSON array or object
    if (expectedType === 'array') {
      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        jsonStr = arrayMatch[0]
      }
    } else {
      const objectMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (objectMatch) {
        jsonStr = objectMatch[0]
      }
    }

    // Try to fix common JSON issues
    // Remove trailing commas before closing brackets/braces
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')

    // Remove any text after the JSON structure
    if (expectedType === 'array') {
      const lastBracket = jsonStr.lastIndexOf(']')
      if (lastBracket > 0) {
        jsonStr = jsonStr.substring(0, lastBracket + 1)
      }
    } else {
      const lastBrace = jsonStr.lastIndexOf('}')
      if (lastBrace > 0) {
        jsonStr = jsonStr.substring(0, lastBrace + 1)
      }
    }

    // Try to parse
    return JSON.parse(jsonStr)
  } catch (error: any) {
    // Log the problematic response for debugging
    console.error(`⚠️  JSON parsing error. Response preview: ${response.substring(0, 500)}...`)
    console.error(`⚠️  Error details: ${error.message}`)

    // Try one more time with aggressive cleanup
    try {
      let cleaned = response.trim()

      // Extract just the JSON part more aggressively
      if (expectedType === 'array') {
        const startIdx = cleaned.indexOf('[')
        const endIdx = cleaned.lastIndexOf(']')
        if (startIdx >= 0 && endIdx > startIdx) {
          cleaned = cleaned.substring(startIdx, endIdx + 1)
          // Remove trailing commas
          cleaned = cleaned.replace(/,(\s*\])/g, '$1')
          return JSON.parse(cleaned)
        }
      } else {
        const startIdx = cleaned.indexOf('{')
        const endIdx = cleaned.lastIndexOf('}')
        if (startIdx >= 0 && endIdx > startIdx) {
          cleaned = cleaned.substring(startIdx, endIdx + 1)
          // Remove trailing commas
          cleaned = cleaned.replace(/,(\s*\})/g, '$1')
          return JSON.parse(cleaned)
        }
      }
    } catch (retryError) {
      // If all else fails, return empty array/object
      console.error(`❌ Failed to parse JSON after retry. Returning empty ${expectedType}.`)
      return expectedType === 'array' ? [] : {}
    }

    // Return empty array/object as fallback
    return expectedType === 'array' ? [] : {}
  }
}

// Function to check if college name needs correction
function needsNameCorrection(name: string): boolean {
  if (!name) return false

  // Check for common issues
  const hasTypo = /[a-z]{3,}[A-Z]/.test(name) // Mixed case in middle
  const hasAllCaps = name === name.toUpperCase() && name.length > 5 // All caps (except short acronyms)
  const hasAllLower = name === name.toLowerCase() && name.length > 5 // All lowercase
  const hasExtraSpaces = /\s{2,}/.test(name) // Multiple spaces
  const hasSpecialChars = /[^a-zA-Z0-9\s\-&.,()]/.test(name) // Unusual special characters

  return hasTypo || hasAllCaps || hasAllLower || hasExtraSpaces || hasSpecialChars
}

// Function to correct college name using Ollama
async function correctCollegeName(college: any): Promise<string | null> {
  // Skip if name looks correct
  if (!needsNameCorrection(college.name)) {
    return null
  }

  console.log(`  ✏️  Checking name for corrections: "${college.name}"`)

  const prompt = `Correct and standardize the following college name. Return ONLY the corrected official name, nothing else.

Current name: "${college.name}"
Location: ${college.city || ""}, ${college.state || ""}
${college.website ? `Website: ${college.website}` : ""}

Rules for correction:
1. Fix any typos or spelling errors
2. Use proper capitalization (Title Case for college names)
3. Remove extra spaces
4. Use official/standard name format
5. Keep abbreviations like "IIT", "IIM", "AIIMS" in uppercase
6. Keep "of", "and", "the" lowercase unless at start
7. Remove unusual special characters (keep only letters, numbers, spaces, hyphens, commas, parentheses, ampersands)

Examples:
- "iit delhi" → "IIT Delhi"
- "Indian Institute  of  Technology" → "Indian Institute of Technology"
- "GNIOT INSTITUTE" → "GNIOT Institute"
- "college of engineering & technology" → "College of Engineering and Technology"

Return ONLY the corrected name, no explanation, no quotes, no JSON, just the name.`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    let correctedName = response.trim()

    // Remove quotes if present
    correctedName = correctedName.replace(/^["']|["']$/g, "")

    // Remove any JSON formatting
    if (correctedName.includes("```")) {
      correctedName = correctedName.split("```")[1]?.split("```")[0] || correctedName
    }

    correctedName = correctedName.trim()

    // Only update if name actually changed and is valid
    if (correctedName && correctedName !== college.name && correctedName.length > 3) {
      // Normalize for comparison (ignore case and spacing)
      const normalizedOriginal = normalizeName(college.name)
      const normalizedCorrected = normalizeName(correctedName)

      // Only update if significantly different
      if (normalizedOriginal !== normalizedCorrected) {
        console.log(`    ✅ Corrected name: "${college.name}" → "${correctedName}"`)
        return correctedName
      }
    }

    return null
  } catch (error) {
    console.error(`    ⚠️  Error correcting name for ${college.name}:`, error)
    return null
  }
}

// Function to validate Indian phone number format
function isValidIndianPhone(phone: string | null | undefined): boolean {
  if (!phone) return false

  const cleaned = phone.replace(/[\s\-()]/g, "")
  // Indian phone numbers: +91 followed by 10 digits, or 10 digits starting with 6-9
  const patterns = [
    /^\+91[6-9]\d{9}$/, // +91XXXXXXXXXX
    /^91[6-9]\d{9}$/,   // 91XXXXXXXXXX
    /^0[6-9]\d{9}$/,    // 0XXXXXXXXXX
    /^[6-9]\d{9}$/      // XXXXXXXXXX
  ]

  return patterns.some(pattern => pattern.test(cleaned))
}

// Function to normalize Indian phone number
function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone

  let cleaned = phone.replace(/[\s\-()]/g, "")

  // Remove country code if present
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3)
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2)
  }

  // Remove leading 0 if present
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1)
  }

  // Format as +91-XXXXXXXXXX
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return `+91-${cleaned}`
  }

  return phone // Return original if can't normalize
}

// Function to check what data is missing or needs verification for a college
function getFieldsToCheck(college: any): { missing: string[]; needsVerification: string[] } {
  const missing: string[] = []
  const needsVerification: string[] = []

  // Check missing fields
  if (!college.description || college.description.trim() === "") missing.push("description")
  if (!college.ranking) missing.push("ranking")
  if (!college.establishedYear) missing.push("establishedYear")
  if (!college.accreditation) missing.push("accreditation")
  if (!college.hostelFees) missing.push("hostelFees")
  if (!college.averagePackage) missing.push("averagePackage")
  if (!college.highestPackage) missing.push("highestPackage")
  if (!college.entranceExams || (Array.isArray(college.entranceExams) && college.entranceExams.length === 0)) missing.push("entranceExams")
  if (!college.ownership) missing.push("ownership")
  if (!college.campusSize) missing.push("campusSize")
  if (!college.totalStudents) missing.push("totalStudents")
  if (!college.website) missing.push("website")
  if (!college.email) missing.push("email")
  if (!college.phone) missing.push("phone")

  // Check fields that need verification (even if they exist)
  if (college.ranking) {
    // Verify ranking is realistic (1-1000 for NIRF, or reasonable range)
    if (college.ranking < 1 || college.ranking > 10000) {
      needsVerification.push("ranking")
    }
  }

  if (college.phone) {
    // Verify phone number format
    if (!isValidIndianPhone(college.phone)) {
      needsVerification.push("phone")
    }
  }

  if (college.establishedYear) {
    // Verify established year is realistic (1800-2024)
    if (college.establishedYear < 1800 || college.establishedYear > new Date().getFullYear()) {
      needsVerification.push("establishedYear")
    }
  }

  if (college.email) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(college.email)) {
      needsVerification.push("email")
    }
  }

  if (college.website) {
    // Basic URL validation
    try {
      new URL(college.website)
    } catch {
      needsVerification.push("website")
    }
  }

  return { missing, needsVerification }
}

// Function to enrich and verify college data using Ollama
async function enrichCollegeData(college: any, missingFields: string[], needsVerification: string[]): Promise<Partial<any>> {
  const allFieldsToCheck = [...new Set([...missingFields, ...needsVerification])]

  if (allFieldsToCheck.length === 0) {
    return {}
  }

  const currentData: any = {}
  if (college.ranking) currentData.ranking = college.ranking
  if (college.phone) currentData.phone = college.phone
  if (college.email) currentData.email = college.email
  if (college.website) currentData.website = college.website
  if (college.establishedYear) currentData.establishedYear = college.establishedYear
  if (college.description) currentData.description = college.description.substring(0, 200)
  if (college.accreditation) currentData.accreditation = college.accreditation
  if (college.ownership) currentData.ownership = college.ownership

  const prompt = `You are a data verification and enrichment assistant for Indian colleges. Search the internet to find ACCURATE and VERIFIED information.

College Name: ${college.name}
Location: ${college.location || "Unknown"}
City: ${college.city || "Unknown"}
State: ${college.state || "Unknown"}
${college.website ? `Current Website: ${college.website}` : ""}

Fields to check/update: ${allFieldsToCheck.join(", ")}

${needsVerification.length > 0 ? `Current data that needs verification:
${needsVerification.map(field => {
    if (field === "ranking" && currentData.ranking) return `- Ranking: ${currentData.ranking} (verify if this is correct NIRF/other ranking)`
    if (field === "phone" && currentData.phone) return `- Phone: ${currentData.phone} (verify and correct format if needed)`
    if (field === "email" && currentData.email) return `- Email: ${currentData.email} (verify if this is the official email)`
    if (field === "website" && currentData.website) return `- Website: ${currentData.website} (verify if this is the official website)`
    if (field === "establishedYear" && currentData.establishedYear) return `- Established Year: ${currentData.establishedYear} (verify if this is correct)`
    return `- ${field}: ${currentData[field] || "N/A"} (verify and correct)`
  }).join("\n")}

IMPORTANT: Verify these fields by searching the internet. If the current data is WRONG, provide the CORRECTED value.` : ""}

Please provide a JSON object with ALL fields that need to be updated (missing or corrected). Use this exact format:
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
  "phone": "+91-1234567890"
}

CRITICAL REQUIREMENTS:
- Search the internet/college website to find OFFICIAL and ACCURATE information
- For RANKING: Provide NIRF ranking if available, or other official ranking. Must be a number between 1-1000 for top colleges, or reasonable range.
- For PHONE: Must be valid Indian phone number format: +91-XXXXXXXXXX (10 digits starting with 6-9). Verify from official website.
- For EMAIL: Must be valid email format from official college domain.
- For WEBSITE: Must be valid URL, preferably official college website (.ac.in, .edu.in, etc.)
- For ESTABLISHED YEAR: Must be realistic year (1800-2024)
- Only include fields that are in the list: ${allFieldsToCheck.join(", ")}
- Use REALISTIC values based on actual internet search
- Fees should be in INR (no currency symbols)
- Entrance exams should be an array of strings
- Return ONLY valid JSON, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim()
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }

    // Parse JSON with error handling
    const enrichedData = parseJsonFromOllama(response, 'object')

    // Validate that we got an object
    if (typeof enrichedData !== 'object' || Array.isArray(enrichedData)) {
      console.error(`⚠️  Expected object but got ${typeof enrichedData}. Returning empty object.`)
      return {}
    }

    // Validate and clean the data
    const cleaned: any = {}
    for (const field of allFieldsToCheck) {
      if (enrichedData[field] !== undefined && enrichedData[field] !== null) {
        // Type validation and correction
        if (field === "ranking") {
          const numValue = parseInt(enrichedData[field])
          if (!isNaN(numValue) && numValue > 0 && numValue <= 10000) {
            // Only update if significantly different or if current is invalid
            if (!college.ranking || Math.abs(college.ranking - numValue) > 10 || college.ranking < 1 || college.ranking > 10000) {
              cleaned[field] = numValue
            }
          }
        } else if (field === "phone") {
          const phoneStr = String(enrichedData[field]).trim()
          const normalized = normalizePhoneNumber(phoneStr)
          if (isValidIndianPhone(normalized)) {
            // Only update if current is invalid or significantly different
            if (!college.phone || !isValidIndianPhone(college.phone) || normalized !== college.phone) {
              cleaned[field] = normalized
            }
          }
        } else if (field === "email") {
          const emailStr = String(enrichedData[field]).trim()
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (emailRegex.test(emailStr)) {
            // Only update if current is invalid or different
            if (!college.email || !emailRegex.test(college.email) || emailStr !== college.email) {
              cleaned[field] = emailStr
            }
          }
        } else if (field === "website") {
          const websiteStr = String(enrichedData[field]).trim()
          try {
            const url = new URL(websiteStr)
            // Only update if current is invalid or different
            if (!college.website || websiteStr !== college.website) {
              cleaned[field] = websiteStr
            }
          } catch {
            // Invalid URL, skip
          }
        } else if (field === "establishedYear") {
          const numValue = parseInt(enrichedData[field])
          const currentYear = new Date().getFullYear()
          if (!isNaN(numValue) && numValue >= 1800 && numValue <= currentYear) {
            // Only update if current is invalid or significantly different
            if (!college.establishedYear || college.establishedYear < 1800 || college.establishedYear > currentYear ||
              Math.abs(college.establishedYear - numValue) > 5) {
              cleaned[field] = numValue
            }
          }
        } else if (field === "hostelFees" || field === "averagePackage" || field === "highestPackage" || field === "totalStudents") {
          const numValue = parseInt(enrichedData[field])
          if (!isNaN(numValue) && numValue > 0) {
            cleaned[field] = numValue
          }
        } else if (field === "entranceExams") {
          if (Array.isArray(enrichedData[field]) && enrichedData[field].length > 0) {
            cleaned[field] = enrichedData[field]
          }
        } else if (typeof enrichedData[field] === "string" && enrichedData[field].trim() !== "") {
          const strValue = enrichedData[field].trim()
          // Only update if field is missing or significantly different
          if (!college[field] || strValue !== college[field]) {
            cleaned[field] = strValue
          }
        }
      }
    }

    return cleaned
  } catch (error) {
    console.error(`Error enriching ${college.name}:`, error)
    return {}
  }
}

// Function to verify image URL is accessible
async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    const contentType = response.headers.get("content-type") || ""
    return response.ok && contentType.startsWith("image/")
  } catch {
    return false
  }
}

// Function to find logo and campus images using Ollama
async function findImagesWithOllama(college: any): Promise<{ logoUrl?: string; campusImages: string[] }> {
  const prompt = `Find image URLs for ${college.name} located in ${college.city || college.location || "India"}.

I need:
1. Official logo URL (preferably from the college website or official sources)
2. 3-5 campus image URLs (showing buildings, campus, facilities, etc.)

${college.website ? `College website: ${college.website} - check this website first for images.` : ""}

Return a JSON object with this exact format:
{
  "logoUrl": "https://example.com/logo.png",
  "campusImages": [
    "https://example.com/campus1.jpg",
    "https://example.com/campus2.jpg",
    "https://example.com/campus3.jpg"
  ]
}

Important:
- Logo URL should be the official college logo
- Campus images should show actual campus buildings, facilities, or infrastructure
- All URLs must be publicly accessible (https://)
- Prefer official college website URLs when available
- Return ONLY the JSON object, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Extract JSON from response
    let jsonStr = response.trim()
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }

    // Parse JSON with error handling
    const imageData = parseJsonFromOllama(response, 'object')

    // Validate that we got an object
    if (typeof imageData !== 'object' || Array.isArray(imageData)) {
      console.error(`⚠️  Expected object but got ${typeof imageData}. Returning empty object.`)
      return { campusImages: [] }
    }

    // Validate URLs
    const validLogo = imageData.logoUrl &&
      (imageData.logoUrl.startsWith("http://") || imageData.logoUrl.startsWith("https://"))
      ? imageData.logoUrl : undefined

    const validCampusImages = (imageData.campusImages || [])
      .filter((url: string) => url && (url.startsWith("http://") || url.startsWith("https://")))
      .slice(0, 5) // Limit to 5 images

    return {
      logoUrl: validLogo,
      campusImages: validCampusImages
    }
  } catch (error) {
    console.error(`Error finding images for ${college.name}:`, error)
    return { campusImages: [] }
  }
}

// Enhanced function to enrich images for a college
async function enrichCollegeImages(college: any): Promise<void> {
  // Check if college already has a logo (first image is typically the logo)
  const hasLogo = college.images &&
    Array.isArray(college.images) &&
    college.images.length > 0 &&
    college.images[0] &&
    (college.images[0].startsWith("http://") || college.images[0].startsWith("https://"))

  if (hasLogo) {
    console.log(`  ⏭️  College already has logo: ${college.images[0]}`)
    // Still check for additional campus images if we have less than 3
    const existingImages = college.images.filter((img: string) =>
      img && (img.startsWith("http://") || img.startsWith("https://"))
    )

    if (existingImages.length < 3) {
      console.log(`  🖼️  Finding additional campus images (have ${existingImages.length}, need more)...`)
      const imageData = await findImagesWithOllama(college)

      // Only add campus images, skip logo since we already have one
      const newCampusImages: string[] = []
      for (const campusImg of imageData.campusImages || []) {
        const isValid = await verifyImageUrl(campusImg)
        if (isValid && !existingImages.includes(campusImg)) {
          newCampusImages.push(campusImg)
          console.log(`    ✅ Found campus image: ${campusImg}`)
        }
        if (newCampusImages.length >= 3) break // Limit to 3 additional images
      }

      if (newCampusImages.length > 0) {
        // Add new campus images to existing ones (keep logo first)
        const allImages = [college.images[0], ...newCampusImages, ...existingImages.slice(1)]

        await db
          .update(colleges)
          .set({
            images: allImages,
            updatedAt: new Date()
          })
          .where(eq(colleges.id, college.id))

        console.log(`    ✅ Added ${newCampusImages.length} campus image(s)`)
      }
    }
    return
  }

  // No logo exists, find logo and campus images
  console.log(`  🖼️  Finding logo and campus images with Ollama...`)

  const imageData = await findImagesWithOllama(college)

  const imagesToAdd: string[] = []

  // Add logo first if found
  if (imageData.logoUrl) {
    const isValid = await verifyImageUrl(imageData.logoUrl)
    if (isValid) {
      imagesToAdd.push(imageData.logoUrl)
      console.log(`    ✅ Found logo: ${imageData.logoUrl}`)
    } else {
      console.log(`    ⚠️  Logo URL not accessible: ${imageData.logoUrl}`)
    }
  }

  // Add campus images
  for (const campusImg of imageData.campusImages || []) {
    const isValid = await verifyImageUrl(campusImg)
    if (isValid) {
      imagesToAdd.push(campusImg)
      console.log(`    ✅ Found campus image: ${campusImg}`)
    }
    if (imagesToAdd.length >= 6) break // Limit total images
  }

  if (imagesToAdd.length > 0) {
    // Merge with existing images (if any local paths exist)
    const existingImages = college.images && Array.isArray(college.images)
      ? college.images.filter((img: string) => !img.startsWith("http"))
      : []

    const allImages = [...imagesToAdd, ...existingImages]

    await db
      .update(colleges)
      .set({
        images: allImages,
        updatedAt: new Date()
      })
      .where(eq(colleges.id, college.id))

    console.log(`    ✅ Updated with ${imagesToAdd.length} new image(s)`)
  } else {
    console.log(`    ⚠️  No valid images found`)
  }
}

// Helper function to normalize name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// Helper function to normalize course name for comparison
function normalizeCourseName(name: string): string {
  return normalizeName(name)
}

// Function to convert long course names to short format (matching database format)
function normalizeCourseNameToShortFormat(name: string): string {
  if (!name) return name

  let normalized = name.trim()

  // Common patterns: convert long names to short abbreviations
  // Bachelor's degrees
  normalized = normalized.replace(/^Bachelor\s+of\s+Technology\s+in\s+/i, "B.Tech ")
  normalized = normalized.replace(/^Bachelor\s+of\s+Engineering\s+in\s+/i, "BE ")
  normalized = normalized.replace(/^Bachelor\s+of\s+Engineering\s*$/i, "BE")
  normalized = normalized.replace(/^Bachelor\s+of\s+Technology\s*$/i, "B.Tech")
  normalized = normalized.replace(/^Bachelor\s+of\s+Business\s+Administration\s*$/i, "BBA")
  normalized = normalized.replace(/^Bachelor\s+of\s+Business\s+Management\s*$/i, "BBM")
  normalized = normalized.replace(/^Bachelor\s+of\s+Commerce\s*$/i, "B.Com")
  normalized = normalized.replace(/^Bachelor\s+of\s+Arts\s*$/i, "BA")
  normalized = normalized.replace(/^Bachelor\s+of\s+Science\s*$/i, "B.Sc")
  normalized = normalized.replace(/^Bachelor\s+of\s+Computer\s+Applications\s*$/i, "BCA")
  normalized = normalized.replace(/^Bachelor\s+of\s+Design\s*$/i, "B.Des")
  normalized = normalized.replace(/^Bachelor\s+of\s+Architecture\s*$/i, "B.Arch")
  normalized = normalized.replace(/^Bachelor\s+of\s+Medicine\s+and\s+Bachelor\s+of\s+Surgery\s*$/i, "MBBS")

  // Master's degrees
  normalized = normalized.replace(/^Master\s+of\s+Technology\s+in\s+/i, "M.Tech ")
  normalized = normalized.replace(/^Master\s+of\s+Engineering\s+in\s+/i, "ME ")
  normalized = normalized.replace(/^Master\s+of\s+Engineering\s*$/i, "ME")
  normalized = normalized.replace(/^Master\s+of\s+Technology\s*$/i, "M.Tech")
  normalized = normalized.replace(/^Master\s+of\s+Business\s+Administration\s*$/i, "MBA")
  normalized = normalized.replace(/^Master\s+of\s+Business\s+Administration\s+in\s+/i, "MBA ")
  normalized = normalized.replace(/^Post\s+Graduate\s+Diploma\s+in\s+Management\s*$/i, "PGDM")
  normalized = normalized.replace(/^Post\s+Graduate\s+Program\s*$/i, "PGP")
  normalized = normalized.replace(/^Master\s+of\s+Commerce\s*$/i, "M.Com")
  normalized = normalized.replace(/^Master\s+of\s+Arts\s*$/i, "MA")
  normalized = normalized.replace(/^Master\s+of\s+Science\s*$/i, "M.Sc")
  normalized = normalized.replace(/^Master\s+of\s+Computer\s+Applications\s*$/i, "MCA")
  normalized = normalized.replace(/^Master\s+of\s+Design\s*$/i, "M.Des")
  normalized = normalized.replace(/^Master\s+of\s+Architecture\s*$/i, "M.Arch")
  normalized = normalized.replace(/^Master\s+of\s+Law\s*$/i, "LLM")
  normalized = normalized.replace(/^Master\s+of\s+Laws\s*$/i, "LLM")

  // Doctorate degrees
  normalized = normalized.replace(/^Doctor\s+of\s+Philosophy\s*$/i, "Ph.D")
  normalized = normalized.replace(/^Ph\.D\.?\s+in\s+/i, "Ph.D in ")
  normalized = normalized.replace(/^Master\s+of\s+Philosophy\s*$/i, "M.Phil")
  normalized = normalized.replace(/^M\.Phil\.?\s*\/\s*Ph\.D\.?\s+in\s+/i, "M.Phil/Ph.D in ")
  normalized = normalized.replace(/^M\.Phil\.?\s*\/\s*Ph\.D\.?\s*$/i, "M.Phil/Ph.D")

  // Combined formats
  normalized = normalized.replace(/^BE\s*\/\s*B\.Tech\s*$/i, "BE/B.Tech")
  normalized = normalized.replace(/^B\.Tech\s*\/\s*BE\s*$/i, "BE/B.Tech")
  normalized = normalized.replace(/^ME\s*\/\s*M\.Tech\s*$/i, "ME/M.Tech")
  normalized = normalized.replace(/^M\.Tech\s*\/\s*ME\s*$/i, "ME/M.Tech")
  normalized = normalized.replace(/^MBA\s*\/\s*PGDM\s*$/i, "MBA/PGDM")
  normalized = normalized.replace(/^PGDM\s*\/\s*MBA\s*$/i, "MBA/PGDM")
  normalized = normalized.replace(/^BBA\s*\/\s*BBM\s*$/i, "BBA/BBM")
  normalized = normalized.replace(/^BBM\s*\/\s*BBA\s*$/i, "BBA/BBM")

  // Clean up extra spaces
  normalized = normalized.replace(/\s+/g, " ").trim()

  // If no transformation happened and it's still a long name, try to extract key parts
  if (normalized === name && normalized.length > 30) {
    // Try to extract degree type and specialization
    const degreeMatch = normalized.match(/(Bachelor|Master|Doctor|B\.?Tech|M\.?Tech|MBA|BBA|BE|ME|Ph\.D)/i)
    if (degreeMatch) {
      const degree = degreeMatch[1]
      const specializationMatch = normalized.match(/in\s+([^,]+)/i)
      if (specializationMatch) {
        const specialization = specializationMatch[1].trim()
        // Convert degree to short form
        let shortDegree = degree
        if (/^Bachelor\s+of\s+Technology/i.test(degree)) shortDegree = "B.Tech"
        else if (/^Bachelor\s+of\s+Engineering/i.test(degree)) shortDegree = "BE"
        else if (/^Master\s+of\s+Technology/i.test(degree)) shortDegree = "M.Tech"
        else if (/^Master\s+of\s+Engineering/i.test(degree)) shortDegree = "ME"
        else if (/^Master\s+of\s+Business\s+Administration/i.test(degree)) shortDegree = "MBA"
        else if (/^Bachelor\s+of\s+Business\s+Administration/i.test(degree)) shortDegree = "BBA"

        normalized = `${shortDegree} ${specialization}`
      }
    }
  }

  return normalized || name
}

// Function to find and add missing courses for a college
async function enrichCoursesForCollege(college: any): Promise<void> {
  // Check if college has courses
  const existingCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.collegeId, college.id))

  // Create a set of normalized existing course names for quick lookup
  const existingCourseNames = new Set(
    existingCourses.map(c => normalizeCourseName(c.name))
  )

  if (existingCourses.length > 0) {
    console.log(`  📚 College has ${existingCourses.length} courses, searching for additional courses...`)
  } else {
    console.log(`  📚 Finding courses with Ollama (college has none)...`)
  }

  // Get some example course names from database to show format
  const exampleCourses = await db
    .select({ name: courses.name })
    .from(courses)
    .limit(10)

  const exampleCourseNames = exampleCourses.map(c => c.name).filter(Boolean).slice(0, 5)

  const prompt = `List ALL the courses/programs offered by ${college.name} located in ${college.city || college.location || "India"}.

${college.website ? `College website: ${college.website} - check this website for complete course listings.` : ""}

${existingCourses.length > 0 ? `Note: The college already has these courses: ${existingCourses.map(c => c.name).join(", ")}. Please find ADDITIONAL courses that are not in this list.` : ""}

IMPORTANT - Course Name Format:
Use SHORT, STANDARDIZED course names (NOT long descriptive names). 

Examples from database:
${exampleCourseNames.length > 0 ? exampleCourseNames.map(name => `- "${name}"`).join("\n") : `- "B.Tech Computer Science" (NOT "Bachelor of Technology in Computer Science")
- "MBA" (NOT "Master of Business Administration")
- "BBA/BBM" (NOT "Bachelor of Business Administration or Bachelor of Business Management")
- "BE/B.Tech" (NOT "Bachelor of Engineering or Bachelor of Technology")
- "M.Tech Mechanical Engineering" (NOT "Master of Technology in Mechanical Engineering")
- "M.Phil/Ph.D in Science" (NOT "Master of Philosophy or Doctor of Philosophy in Science")
- "Ph.D" (NOT "Doctor of Philosophy")`}

Common formats:
- Engineering: "B.Tech [Specialization]", "BE/B.Tech", "M.Tech [Specialization]", "ME/M.Tech"
- Management: "MBA", "MBA/PGDM", "BBA/BBM", "Executive MBA"
- Medical: "MBBS", "MD", "MS"
- Law: "LLB", "LLM"
- Design: "B.Des", "M.Des"
- Doctorate: "Ph.D", "M.Phil/Ph.D in [Field]"

Return a JSON array of courses with this exact format:
[
  {
    "name": "B.Tech Computer Science",
    "duration": "4 years",
    "fees": 200000,
    "level": "undergraduate",
    "studyMode": "offline"
  },
  {
    "name": "MBA",
    "duration": "2 years",
    "fees": 500000,
    "level": "graduate",
    "studyMode": "offline"
  }
]

Important:
- ${existingCourses.length > 0 ? "Include courses that are NOT already in the existing list above." : "Include at least 5-10 main courses."}
- Use SHORT course names matching the format shown above
- Search the internet/college website to find ALL available courses
- Use realistic fee amounts for Indian colleges (in INR, no currency symbols)
- Level should be: "undergraduate", "graduate", "diploma", or "certificate"
- Study mode should be: "offline", "online", or "hybrid"
- Duration should be in format like "4 years", "2 years", "1 year", etc.
- Return ONLY the JSON array, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Extract JSON array
    let jsonStr = response.trim()
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }

    // Parse JSON with error handling
    const coursesData = parseJsonFromOllama(response, 'array')

    // Validate that we got an array
    if (!Array.isArray(coursesData)) {
      console.error(`⚠️  Expected array but got ${typeof coursesData}. Returning empty array.`)
      return
    }

    let coursesAdded = 0
    let coursesSkipped = 0

    // Add courses to database
    for (const courseData of coursesData) {
      if (!courseData.name) continue

      // Normalize course name to short format (matching database format)
      const shortCourseName = normalizeCourseNameToShortFormat(courseData.name)

      // Normalize course name for comparison
      const normalizedName = normalizeCourseName(shortCourseName)

      // Skip if course already exists (by normalized name)
      if (existingCourseNames.has(normalizedName)) {
        coursesSkipped++
        continue
      }

      const slug = `${shortCourseName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${college.slug}`.substring(0, 255)

      try {
        // Double-check by slug to avoid duplicates
        const existing = await db
          .select()
          .from(courses)
          .where(eq(courses.slug, slug))
          .limit(1)

        if (existing.length > 0) {
          coursesSkipped++
          continue
        }

        await db.insert(courses).values({
          name: shortCourseName,
          slug: slug,
          collegeId: college.id,
          description: `${shortCourseName} program at ${college.name}`,
          duration: courseData.duration || "4 years",
          fees: courseData.fees ? parseInt(courseData.fees) : null,
          feesCurrency: "INR",
          level: courseData.level || "undergraduate",
          studyMode: courseData.studyMode || "offline",
        })
        console.log(`    ✅ Added course: ${shortCourseName}${shortCourseName !== courseData.name ? ` (normalized from: ${courseData.name})` : ""}`)
        coursesAdded++

        // Add to existing set to avoid duplicates in same batch
        existingCourseNames.add(normalizedName)
      } catch (error: any) {
        if (error?.code !== "23505") { // Ignore duplicate slug errors
          console.error(`    ❌ Error adding course ${courseData.name}:`, error.message)
        } else {
          coursesSkipped++
        }
      }
    }

    if (coursesAdded > 0) {
      console.log(`  ✅ Added ${coursesAdded} new course(s)${coursesSkipped > 0 ? `, skipped ${coursesSkipped} duplicate(s)` : ""}`)
    } else if (coursesSkipped > 0) {
      console.log(`  ⏭️  All found courses already exist (skipped ${coursesSkipped})`)
    } else {
      console.log(`  ⚠️  No courses found or added`)
    }
  } catch (error) {
    console.error(`Error enriching courses for ${college.name}:`, error)
  }
}

// Main enrichment function
async function enrichAllColleges(options: { discoverFirst?: boolean; importLinkingsky?: boolean } = {}) {
  const { discoverFirst = false, importLinkingsky = false } = options

  // Step 0: Discover/Import colleges first if requested
  if (importLinkingsky) {
    console.log("=".repeat(60))
    console.log("STEP 0: Importing Universities from Linkingsky")
    console.log("=".repeat(60))
    try {
      const linkingskyResult = await fetchUniversitiesFromLinkingsky()
      console.log(`✅ Imported ${linkingskyResult.added} universities from Linkingsky\n`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("⚠️  Linkingsky import failed, continuing with enrichment:", error)
    }
  }

  if (discoverFirst) {
    console.log("=".repeat(60))
    console.log("STEP 0: Discovering Missing Colleges")
    console.log("=".repeat(60))
    try {
      const discoveryResult = await discoverAndAddMissingColleges()
      console.log(`✅ Discovered and added ${discoveryResult.added} colleges\n`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("⚠️  Discovery failed, continuing with enrichment:", error)
    }
  }

  // Step 1: Remove duplicates before enrichment
  if (discoverFirst || importLinkingsky) {
    console.log("=".repeat(60))
    console.log("STEP 1: Removing Duplicate Colleges")
    console.log("=".repeat(60))
    try {
      const duplicateResult = await removeDuplicates(false) // Don't close connection
      console.log(`✅ Removed ${duplicateResult?.duplicatesRemoved || 0} duplicate colleges\n`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("⚠️  Duplicate removal failed, continuing with enrichment:", error)
    }
  }

  // Step 2: Enrichment process
  console.log("=".repeat(60))
  console.log("STEP 2: Enriching All Colleges")
  console.log("=".repeat(60))
  console.log("🤖 Starting AI-powered data enrichment and verification with Ollama...\n")
  console.log("⚠️  This will:")
  console.log("   - Correct college names (fix typos, capitalization)")
  console.log("   - Fill MISSING fields")
  console.log("   - VERIFY and CORRECT existing data (ranking, phone, email, website, etc.)")
  console.log("   - Add logos and campus images")
  console.log("   - Add courses")
  console.log("   - Add reviews and ratings")
  console.log("   - Search internet for accurate information\n")

  try {
    const allColleges = await db.select().from(colleges)
    console.log(`📊 Found ${allColleges.length} colleges to process\n`)

    let enrichedCount = 0
    let imagesAddedCount = 0
    let coursesAddedCount = 0
    let reviewsAddedCount = 0
    let cutoffsAddedCount = 0
    let placementsAddedCount = 0
    let guidesAddedCount = 0
    let skippedCount = 0

    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i]
      console.log(`\n[${i + 1}/${allColleges.length}] Processing: ${college.name}`)

      let collegeUpdated = false

      // 0. Correct college name if needed
      const correctedName = await correctCollegeName(college)
      if (correctedName) {
        // Generate new slug if name changed
        const newSlug = generateSlug(correctedName)

        // Check if new slug already exists
        const existingWithSlug = await db
          .select()
          .from(colleges)
          .where(eq(colleges.slug, newSlug))
          .limit(1)

        if (existingWithSlug.length === 0 || existingWithSlug[0].id === college.id) {
          await db
            .update(colleges)
            .set({
              name: correctedName,
              slug: newSlug,
              updatedAt: new Date()
            })
            .where(eq(colleges.id, college.id))

          console.log(`  ✅ Name corrected and slug updated`)
          collegeUpdated = true
        } else {
          console.log(`  ⚠️  Name corrected but slug conflict, keeping original slug`)
          await db
            .update(colleges)
            .set({
              name: correctedName,
              updatedAt: new Date()
            })
            .where(eq(colleges.id, college.id))

          collegeUpdated = true
        }

        // Update college object for rest of processing
        college.name = correctedName
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 1. Enrich and verify all data fields
      const { missing, needsVerification } = getFieldsToCheck(college)
      const allFieldsToCheck = [...new Set([...missing, ...needsVerification])]

      if (allFieldsToCheck.length > 0) {
        if (missing.length > 0) {
          console.log(`  📝 Missing fields: ${missing.join(", ")}`)
        }
        if (needsVerification.length > 0) {
          console.log(`  🔍 Fields needing verification: ${needsVerification.join(", ")}`)
        }
        console.log(`  🤖 Searching internet and verifying with Ollama...`)

        const enrichedData = await enrichCollegeData(college, missing, needsVerification)

        if (Object.keys(enrichedData).length > 0) {
          const updatedFields = Object.keys(enrichedData)
          await db
            .update(colleges)
            .set({
              ...enrichedData,
              updatedAt: new Date()
            })
            .where(eq(colleges.id, college.id))

          console.log(`  ✅ Updated ${updatedFields.length} field(s): ${updatedFields.join(", ")}`)

          // Log specific corrections
          if (enrichedData.ranking && needsVerification.includes("ranking")) {
            console.log(`    📊 Ranking corrected: ${college.ranking} → ${enrichedData.ranking}`)
          }
          if (enrichedData.phone && needsVerification.includes("phone")) {
            console.log(`    📞 Phone corrected: ${college.phone} → ${enrichedData.phone}`)
          }
          if (enrichedData.email && needsVerification.includes("email")) {
            console.log(`    📧 Email corrected: ${college.email} → ${enrichedData.email}`)
          }
          if (enrichedData.website && needsVerification.includes("website")) {
            console.log(`    🌐 Website corrected: ${college.website} → ${enrichedData.website}`)
          }

          enrichedCount++
          collegeUpdated = true
        } else {
          console.log(`  ⚠️  No data updates needed`)
        }

        // Small delay to avoid overwhelming Ollama
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.log(`  ✅ All data fields present and verified`)
      }

      // 2. Enrich images (logo + campus) - only if logo missing
      await enrichCollegeImages(college)
      imagesAddedCount++
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 3. Enrich courses - add if none exist, or add new ones if more are found
      await enrichCoursesForCollege(college)
      coursesAddedCount++
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 4. Enrich reviews and ratings - only if college has less than 5 reviews
      const existingReviewsBefore = await db
        .select()
        .from(collegeReviews)
        .where(eq(collegeReviews.collegeId, college.id))
      await enrichCollegeReviews(college)
      const existingReviewsAfter = await db
        .select()
        .from(collegeReviews)
        .where(eq(collegeReviews.collegeId, college.id))
      if (existingReviewsAfter.length > existingReviewsBefore.length) {
        reviewsAddedCount++
      }
      await new Promise(resolve => setTimeout(resolve, 2000))


      // 6. Enrich placement stats - only if college has less than 3 placement records
      const existingPlacementsBefore = await db
        .select()
        .from(placementStats)
        .where(eq(placementStats.collegeId, college.id))
      await enrichPlacementStats(college)
      const existingPlacementsAfter = await db
        .select()
        .from(placementStats)
        .where(eq(placementStats.collegeId, college.id))
      if (existingPlacementsAfter.length > existingPlacementsBefore.length) {
        placementsAddedCount++
      }
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 7. Enrich application guides - only if college has no guides
      const existingGuidesBefore = await db
        .select()
        .from(applicationGuides)
        .where(eq(applicationGuides.collegeId, college.id))
      await enrichApplicationGuides(college)
      const existingGuidesAfter = await db
        .select()
        .from(applicationGuides)
        .where(eq(applicationGuides.collegeId, college.id))
      if (existingGuidesAfter.length > existingGuidesBefore.length) {
        guidesAddedCount++
      }
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (!collegeUpdated && allFieldsToCheck.length === 0) {
        skippedCount++
      }

      // Small delay between colleges
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`\n✨ Enrichment completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Colleges with data enriched: ${enrichedCount}`)
    console.log(`   - Colleges processed for images: ${imagesAddedCount}`)
    console.log(`   - Colleges processed for courses: ${coursesAddedCount}`)
    console.log(`   - Colleges processed for reviews: ${reviewsAddedCount}`)
    console.log(`   - Colleges processed for cutoffs: ${cutoffsAddedCount}`)
    console.log(`   - Colleges processed for placements: ${placementsAddedCount}`)
    console.log(`   - Colleges processed for application guides: ${guidesAddedCount}`)
    console.log(`   - Colleges skipped (already complete): ${skippedCount}`)
    console.log(`   - Total colleges processed: ${allColleges.length}`)

    if (discoverFirst || importLinkingsky) {
      console.log(`\n${"=".repeat(60)}`)
      console.log("✨ Complete Process Finished!")
      console.log(`${"=".repeat(60)}`)
    }

  } catch (error) {
    console.error("❌ Enrichment failed:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly (from command line)
if (require.main === module) {
  enrichAllColleges()
    .then(() => {
      console.log("\n✅ Enrichment script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Enrichment script failed:", error)
      process.exit(1)
    })
}

// Function to generate slug from college name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 255)
}

// Function to discover and add missing Indian colleges
async function discoverAndAddMissingColleges(state?: string, city?: string, batchSize: number = 50): Promise<{ added: number; skipped: number }> {
  console.log("🔍 Starting discovery of missing Indian colleges...\n")

  if (state || city) {
    console.log(`📍 Searching for colleges in: ${city ? city + ", " : ""}${state || "India"}\n`)
  } else {
    console.log("📍 Searching for colleges across India\n")
  }

  // Get existing college names and slugs for comparison
  const existingColleges = await db.select({ name: colleges.name, slug: colleges.slug, city: colleges.city, state: colleges.state }).from(colleges)
  const existingNames = new Set(existingColleges.map(c => normalizeName(c.name)))
  const existingSlugs = new Set(existingColleges.map(c => c.slug))

  console.log(`📊 Found ${existingColleges.length} existing colleges in database\n`)

  const prompt = `List ALL colleges/universities in India${state ? ` in the state of ${state}` : ""}${city ? ` in the city of ${city}` : ""}.

Focus on ALL types of colleges:
- Engineering colleges (IITs, NITs, state engineering colleges, private engineering colleges, polytechnics)
- Management colleges (IIMs, top B-schools, private management institutes, business schools)
- Medical colleges (AIIMS, state medical colleges, private medical colleges, dental colleges, nursing colleges)
- Law colleges (NLUs, state law colleges, private law colleges)
- Arts, Science, Commerce colleges (degree colleges, autonomous colleges)
- Universities (central universities, state universities, private universities, deemed universities)
- Specialized colleges (pharmacy, architecture, design, agriculture, veterinary)
- Government and private colleges
- Both well-known and lesser-known but established colleges

For each college, provide:
- Full official name
- City
- State
- Type (Engineering, Management, Medical, Law, Arts, Science, Commerce, University, etc.)
- Website (if known)

Return a JSON array with this exact format:
[
  {
    "name": "Indian Institute of Technology Delhi",
    "city": "New Delhi",
    "state": "Delhi",
    "type": "Engineering",
    "website": "https://www.iitd.ac.in"
  },
  {
    "name": "Indian Institute of Management Ahmedabad",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "type": "Management",
    "website": "https://www.iima.ac.in"
  }
]

Important:
- Include ALL real, established colleges/universities (not just well-known ones)
- Include both government and private colleges
- Include colleges of all sizes and rankings
- Return at least ${batchSize} colleges per request (aim for comprehensive coverage)
- If state/city is specified, list ALL colleges in that location
- Search your knowledge base thoroughly - India has over 3,300 colleges
- Return ONLY the JSON array, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Parse JSON with error handling
    const collegesData = parseJsonFromOllama(response, 'array')

    // Validate that we got an array
    if (!Array.isArray(collegesData)) {
      console.error(`⚠️  Expected array but got ${typeof collegesData}. Returning empty array.`)
      return { added: 0, skipped: 0 }
    }

    // Check if we got any data
    if (collegesData.length === 0) {
      console.log(`\n⚠️  No colleges found in response. Ollama may have returned empty or invalid data.`)
      return { added: 0, skipped: 0 }
    }

    let added = 0
    let skipped = 0

    console.log(`\n📋 Found ${collegesData.length} colleges from Ollama\n`)

    // Process each college
    for (const collegeData of collegesData) {
      if (!collegeData.name) continue

      const normalizedName = normalizeName(collegeData.name)

      // Skip if college already exists
      if (existingNames.has(normalizedName)) {
        skipped++
        console.log(`  ⏭️  Skipped (already exists): ${collegeData.name}`)
        continue
      }

      // Generate slug
      let slug = generateSlug(collegeData.name)
      let slugCounter = 1
      while (existingSlugs.has(slug)) {
        slug = `${generateSlug(collegeData.name)}-${slugCounter}`
        slugCounter++
      }
      existingSlugs.add(slug)

      try {
        // Insert new college
        await db.insert(colleges).values({
          name: collegeData.name,
          slug: slug,
          city: collegeData.city || null,
          state: collegeData.state || null,
          country: "India",
          location: collegeData.city && collegeData.state
            ? `${collegeData.city}, ${collegeData.state}`
            : collegeData.city || collegeData.state || null,
          website: collegeData.website || null,
          description: `${collegeData.name}${collegeData.city ? ` located in ${collegeData.city}` : ""}${collegeData.state ? `, ${collegeData.state}` : ""}${collegeData.type ? ` - ${collegeData.type} college` : ""}`,
        })

        console.log(`  ✅ Added: ${collegeData.name}${collegeData.city ? ` (${collegeData.city}, ${collegeData.state || ""})` : ""}`)
        added++
        existingNames.add(normalizedName)

        // Small delay to avoid overwhelming database
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error: any) {
        if (error?.code === "23505") { // Duplicate slug
          skipped++
          console.log(`  ⏭️  Skipped (duplicate slug): ${collegeData.name}`)
        } else {
          console.error(`  ❌ Error adding ${collegeData.name}:`, error.message)
        }
      }
    }

    console.log(`\n✨ Discovery completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Colleges added: ${added}`)
    console.log(`   - Colleges skipped: ${skipped}`)

    return { added, skipped }
  } catch (error) {
    console.error("❌ Error discovering colleges:", error)
    throw error
  }
}

// Function to enrich reviews and ratings for a college
async function enrichCollegeReviews(college: any): Promise<void> {
  // Check if college already has reviews
  const existingReviews = await db
    .select()
    .from(collegeReviews)
    .where(eq(collegeReviews.collegeId, college.id))

  // Only add reviews if college has less than 5 reviews
  if (existingReviews.length >= 5) {
    console.log(`  ⏭️  College already has ${existingReviews.length} reviews`)
    return
  }

  const reviewsNeeded = 5 - existingReviews.length
  console.log(`  💬 Finding ${reviewsNeeded} review(s) with Ollama (college has ${existingReviews.length})...`)

  const prompt = `Find or generate realistic student reviews and ratings for ${college.name} located in ${college.city || college.location || "India"}.

${college.website ? `College website: ${college.website} - check this website for reviews if available.` : ""}
${college.description ? `College description: ${college.description.substring(0, 500)}` : ""}

Generate ${reviewsNeeded} diverse, realistic student reviews with the following characteristics:
- Mix of ratings (3-5 stars, with most being 4-5 stars for good colleges)
- Different aspects: academics, infrastructure, placements, campus life, faculty
- Different courses/programs
- Realistic batch years (2018-2024)
- Authentic student voice and language
- Specific details about the college

Return a JSON array with this exact format:
[
  {
    "reviewerName": "Rahul Sharma",
    "rating": 4,
    "title": "Great infrastructure and faculty",
    "review": "The college has excellent infrastructure with modern labs and library. Faculty members are experienced and supportive. Placements are decent with average package around 8 LPA. Campus life is vibrant with various clubs and activities.",
    "course": "B.Tech Computer Science",
    "batch": "2022",
    "category": "academics"
  },
  {
    "reviewerName": "Priya Patel",
    "rating": 5,
    "title": "Best decision of my life",
    "review": "Amazing college experience! The faculty is top-notch and always available for guidance. Infrastructure is world-class with state-of-the-art facilities. Placements are excellent with top companies visiting campus. Highly recommended!",
    "course": "MBA",
    "batch": "2023",
    "category": "placements"
  }
]

Important:
- Generate ${reviewsNeeded} reviews
- Rating should be between 1-5 (integer)
- Category should be one of: "academics", "infrastructure", "placements", "campus_life", "faculty"
- Reviews should be realistic and specific to the college
- Use Indian names for reviewers
- Batch should be a year between 2018-2024
- Course names should match the format: "B.Tech Computer Science", "MBA", "BBA", etc.
- Return ONLY the JSON array, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Parse JSON with error handling
    const reviewsData = parseJsonFromOllama(response, 'array')

    // Validate that we got an array
    if (!Array.isArray(reviewsData)) {
      console.error(`⚠️  Expected array but got ${typeof reviewsData}. Returning empty array.`)
      return
    }

    let reviewsAdded = 0

    // Add reviews to database
    for (let i = 0; i < reviewsData.length; i++) {
      const reviewData = reviewsData[i]
      if (!reviewData.review || !reviewData.rating) continue

      // Validate rating (1-5)
      const rating = Math.max(1, Math.min(5, parseInt(reviewData.rating) || 4))

      // Validate category
      const validCategories = ["academics", "infrastructure", "placements", "campus_life", "faculty"]
      const category = validCategories.includes(reviewData.category) ? reviewData.category : "academics"

      // Generate realistic review date based on batch year
      let reviewDate = new Date()
      const batchYear = reviewData.batch ? parseInt(reviewData.batch) : null

      if (batchYear && batchYear >= 2018 && batchYear <= 2024) {
        // Review date should be after graduation (batch year + course duration)
        // For B.Tech (4 years), MBA (2 years), etc.
        const courseDuration = reviewData.course?.toLowerCase().includes("m.tech") ||
          reviewData.course?.toLowerCase().includes("mba") ||
          reviewData.course?.toLowerCase().includes("m.") ? 2 : 4

        const graduationYear = batchYear + courseDuration
        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth()

        // Review can be from graduation year to current year
        // Spread reviews over time - some recent, some older
        const yearsSinceGraduation = Math.min(currentYear - graduationYear, 3) // Max 3 years after graduation
        const randomYearOffset = Math.floor(Math.random() * (yearsSinceGraduation + 1))
        const reviewYear = Math.min(graduationYear + randomYearOffset, currentYear)

        // Random month (1-12) and day (1-28 to avoid month-end issues)
        const randomMonth = Math.floor(Math.random() * 12)
        const randomDay = Math.floor(Math.random() * 28) + 1

        // If review year is current year, don't go beyond current month
        if (reviewYear === currentYear) {
          const maxMonth = Math.min(randomMonth, currentMonth)
          reviewDate = new Date(reviewYear, maxMonth, Math.min(randomDay, 28))
        } else {
          reviewDate = new Date(reviewYear, randomMonth, randomDay)
        }
      } else {
        // No batch year, generate random date in last 2 years
        const daysAgo = Math.floor(Math.random() * 730) // Random day in last 2 years
        reviewDate = new Date()
        reviewDate.setDate(reviewDate.getDate() - daysAgo)
      }

      // Add some variation to avoid all reviews on same day
      // Spread reviews over a few days/weeks
      const dayVariation = Math.floor(Math.random() * 30) - 15 // ±15 days
      reviewDate.setDate(reviewDate.getDate() + dayVariation)

      // Ensure date is not in the future
      if (reviewDate > new Date()) {
        reviewDate = new Date()
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 30))
      }

      try {
        await db.insert(collegeReviews).values({
          collegeId: college.id,
          reviewerName: reviewData.reviewerName || "Student",
          rating: rating,
          title: reviewData.title || null,
          review: reviewData.review,
          course: reviewData.course || null,
          batch: reviewData.batch || null,
          category: category,
          source: "internet",
          isApproved: true, // Auto-approve Ollama-generated reviews
          isVerified: false,
          externalDate: reviewDate, // Set realistic review date
          createdAt: reviewDate, // Also set createdAt to match
        })

        console.log(`    ✅ Added review: ${rating} stars - "${reviewData.title || reviewData.review.substring(0, 50)}..."`)
        reviewsAdded++
      } catch (error: any) {
        if (error?.code !== "23505") { // Ignore duplicate errors
          console.error(`    ❌ Error adding review:`, error.message)
        }
      }
    }

    if (reviewsAdded > 0) {
      console.log(`  ✅ Added ${reviewsAdded} review(s)`)
    } else {
      console.log(`  ⚠️  No reviews added`)
    }
  } catch (error) {
    console.error(`Error enriching reviews for ${college.name}:`, error)
  }
}

// Function to enrich reviews for all colleges
async function enrichAllCollegeReviews(): Promise<void> {
  console.log("💬 Starting review and rating enrichment with Ollama...\n")

  try {
    const allColleges = await db.select().from(colleges)
    console.log(`📊 Found ${allColleges.length} colleges to process\n`)

    let reviewsAddedCount = 0
    let skippedCount = 0

    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i]
      console.log(`\n[${i + 1}/${allColleges.length}] Processing: ${college.name}`)

      const existingReviews = await db
        .select()
        .from(collegeReviews)
        .where(eq(collegeReviews.collegeId, college.id))

      if (existingReviews.length >= 5) {
        console.log(`  ⏭️  College already has ${existingReviews.length} reviews`)
        skippedCount++
      } else {
        await enrichCollegeReviews(college)
        reviewsAddedCount++
      }

      // Small delay between colleges
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log(`\n✨ Review enrichment completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Colleges processed for reviews: ${reviewsAddedCount}`)
    console.log(`   - Colleges skipped (already have 5+ reviews): ${skippedCount}`)
    console.log(`   - Total colleges processed: ${allColleges.length}`)

  } catch (error) {
    console.error("❌ Review enrichment failed:", error)
    throw error
  } finally {
    await client.end()
  }
}


// Function to enrich placement stats for a college
async function enrichPlacementStats(college: any): Promise<void> {
  // Check if college already has placement stats
  const existingPlacements = await db
    .select()
    .from(placementStats)
    .where(eq(placementStats.collegeId, college.id))

  // Only add if college has less than 3 placement records
  if (existingPlacements.length >= 3) {
    console.log(`  ⏭️  College already has ${existingPlacements.length} placement records`)
    return
  }

  console.log(`  💼 Finding placement statistics (college has ${existingPlacements.length} records)...`)

  const prompt = `Find placement statistics for ${college.name} located in ${college.city || college.location || "India"}.

${college.website ? `College website: ${college.website} - check this website for placement data.` : ""}
${college.description ? `College description: ${college.description.substring(0, 500)}` : ""}
${college.averagePackage ? `Current average package: ₹${college.averagePackage.toLocaleString()}` : ""}
${college.highestPackage ? `Current highest package: ₹${college.highestPackage.toLocaleString()}` : ""}

Find placement statistics for recent years (2022-2024) including:
- Total students eligible for placement
- Number of students placed
- Placement percentage
- Average, median, highest, and lowest packages (in INR)
- Top recruiting companies
- Department-wise placement data (if available)

Return a JSON array with this exact format:
[
  {
    "year": 2024,
    "totalStudents": 500,
    "placedStudents": 450,
    "placementPercentage": 90,
    "averagePackage": 800000,
    "medianPackage": 750000,
    "highestPackage": 1500000,
    "lowestPackage": 400000,
    "topRecruiters": ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant"],
    "departmentWiseData": {
      "Computer Science": {
        "placedStudents": 120,
        "averagePackage": 1200000
      },
      "Mechanical": {
        "placedStudents": 80,
        "averagePackage": 700000
      }
    }
  }
]

Important:
- Include placement data for at least 1-2 recent years
- Use realistic package values based on college type and ranking
- Top recruiters should be real companies that recruit from Indian colleges
- Department-wise data is optional but valuable
- Packages should be in INR (no currency symbols)
- Return ONLY the JSON array, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Parse JSON with error handling
    const placementsData = parseJsonFromOllama(response, 'array')

    // Validate that we got an array
    if (!Array.isArray(placementsData)) {
      console.error(`⚠️  Expected array but got ${typeof placementsData}. Returning empty array.`)
      return
    }

    let placementsAdded = 0

    // Add placement stats to database
    for (const placementData of placementsData) {
      if (!placementData.year) continue

      // Validate year (2020-2024)
      const year = parseInt(placementData.year)
      if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) continue

      try {
        await db.insert(placementStats).values({
          collegeId: college.id,
          year: year,
          totalStudents: placementData.totalStudents ? parseInt(placementData.totalStudents) : null,
          placedStudents: placementData.placedStudents ? parseInt(placementData.placedStudents) : null,
          placementPercentage: placementData.placementPercentage ? parseInt(placementData.placementPercentage) : null,
          averagePackage: placementData.averagePackage ? parseInt(placementData.averagePackage) : null,
          medianPackage: placementData.medianPackage ? parseInt(placementData.medianPackage) : null,
          highestPackage: placementData.highestPackage ? parseInt(placementData.highestPackage) : null,
          lowestPackage: placementData.lowestPackage ? parseInt(placementData.lowestPackage) : null,
          topRecruiters: placementData.topRecruiters || [],
          departmentWiseData: placementData.departmentWiseData || {},
        })

        console.log(`    ✅ Added placement stats: ${year} (${placementData.placementPercentage || "N/A"}% placement)`)
        placementsAdded++
      } catch (error: any) {
        if (error?.code !== "23505") { // Ignore duplicate errors
          console.error(`    ❌ Error adding placement:`, error.message)
        }
      }
    }

    if (placementsAdded > 0) {
      console.log(`  ✅ Added ${placementsAdded} placement record(s)`)
    } else {
      console.log(`  ⚠️  No placement data found or added`)
    }
  } catch (error) {
    console.error(`Error enriching placement stats for ${college.name}:`, error)
  }
}

// Function to enrich application guides for a college
async function enrichApplicationGuides(college: any): Promise<void> {
  // Check if college already has application guides
  const existingGuides = await db
    .select()
    .from(applicationGuides)
    .where(eq(applicationGuides.collegeId, college.id))

  // Only add if college has no application guides
  if (existingGuides.length > 0) {
    console.log(`  ⏭️  College already has ${existingGuides.length} application guide(s)`)
    return
  }

  // Get college courses to create course-specific guides
  const collegeCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.collegeId, college.id))

  console.log(`  📝 Creating application guide (college has ${existingGuides.length} guides)...`)

  const prompt = `Create a comprehensive application guide for ${college.name} located in ${college.city || college.location || "India"}.

${college.website ? `College website: ${college.website} - check this website for application information.` : ""}
${college.description ? `College description: ${college.description.substring(0, 500)}` : ""}
${collegeCourses.length > 0 ? `College offers: ${collegeCourses.map(c => c.name).join(", ")}` : ""}
${college.entranceExams && Array.isArray(college.entranceExams) ? `Entrance exams: ${college.entranceExams.join(", ")}` : ""}

Create a detailed application guide including:
1. Step-by-step application process
2. Required documents list
3. Application fee information
4. Important deadlines (application start, end, document submission)
5. Form filling tips and common mistakes
6. Application URL (if available)
7. Contact information for application queries

Return a JSON object with this exact format:
{
  "guideContent": "Step 1: Visit the official website...\nStep 2: Register online...\nStep 3: Fill the application form...\nStep 4: Upload required documents...\nStep 5: Pay application fee...\nStep 6: Submit application...",
  "requiredDocs": ["10th mark sheet", "12th mark sheet", "Entrance exam scorecard", "Identity proof", "Passport size photos", "Category certificate (if applicable)"],
  "feeInfo": {
    "amount": 1000,
    "currency": "INR",
    "paymentMethods": ["Online", "Debit Card", "Credit Card", "Net Banking"],
    "paymentLink": "https://example.com/payment"
  },
  "deadlines": {
    "applicationStart": "2024-01-01",
    "applicationEnd": "2024-03-31",
    "documentSubmission": "2024-04-15",
    "admitCard": "2024-05-01",
    "examDate": "2024-05-15"
  },
  "tips": "1. Keep all documents ready before starting\n2. Double-check all information before submission\n3. Keep a copy of submitted application\n4. Note down application number for future reference",
  "applicationUrl": "https://example.com/apply",
  "contactInfo": {
    "email": "admissions@example.com",
    "phone": "+91-1234567890",
    "address": "College Address"
  }
}

Important:
- Make the guide comprehensive and helpful
- Include realistic deadlines (typically Jan-Mar for admissions)
- Application fee should be realistic (₹500-₹2000 for most colleges)
- Include all common required documents
- Provide clear step-by-step instructions
- Return ONLY the JSON object, no other text or markdown`

  try {
    const response = await ollama.chat([{
      role: "user",
      content: prompt
    }])

    // Parse JSON with error handling
    const guideData = parseJsonFromOllama(response, 'object')

    // Validate that we got an object
    if (typeof guideData !== 'object' || Array.isArray(guideData)) {
      console.error(`⚠️  Expected object but got ${typeof guideData}. Skipping guide creation.`)
      return
    }

    if (!guideData.guideContent) {
      console.log(`  ⚠️  No valid guide content found`)
      return
    }

    try {
      await db.insert(applicationGuides).values({
        collegeId: college.id,
        guideContent: guideData.guideContent,
        requiredDocs: guideData.requiredDocs || [],
        feeInfo: guideData.feeInfo || {},
        deadlines: guideData.deadlines || {},
        tips: guideData.tips || null,
        applicationUrl: guideData.applicationUrl || null,
        contactInfo: guideData.contactInfo || {},
      })

      console.log(`  ✅ Added application guide`)
    } catch (error: any) {
      if (error?.code !== "23505") { // Ignore duplicate errors
        console.error(`  ❌ Error adding application guide:`, error.message)
      }
    }
  } catch (error) {
    console.error(`Error enriching application guide for ${college.name}:`, error)
  }
}

// Function to correct all college names
async function correctAllCollegeNames(): Promise<{ corrected: number; skipped: number }> {
  console.log("✏️  Starting college name correction process...\n")

  try {
    const allColleges = await db.select().from(colleges)
    console.log(`📊 Found ${allColleges.length} colleges to check\n`)

    let corrected = 0
    let skipped = 0

    for (let i = 0; i < allColleges.length; i++) {
      const college = allColleges[i]

      if (!needsNameCorrection(college.name)) {
        skipped++
        continue
      }

      console.log(`\n[${i + 1}/${allColleges.length}] Checking: ${college.name}`)

      const correctedName = await correctCollegeName(college)

      if (correctedName) {
        // Generate new slug if name changed
        const newSlug = generateSlug(correctedName)

        // Check if new slug already exists
        const existingWithSlug = await db
          .select()
          .from(colleges)
          .where(eq(colleges.slug, newSlug))
          .limit(1)

        if (existingWithSlug.length === 0 || existingWithSlug[0].id === college.id) {
          await db
            .update(colleges)
            .set({
              name: correctedName,
              slug: newSlug,
              updatedAt: new Date()
            })
            .where(eq(colleges.id, college.id))

          console.log(`  ✅ Name and slug updated`)
          corrected++
        } else {
          console.log(`  ⚠️  Name corrected but slug conflict, keeping original slug`)
          await db
            .update(colleges)
            .set({
              name: correctedName,
              updatedAt: new Date()
            })
            .where(eq(colleges.id, college.id))

          corrected++
        }
      } else {
        skipped++
      }

      // Small delay between colleges
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    console.log(`\n✨ Name correction completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Names corrected: ${corrected}`)
    console.log(`   - Names skipped (already correct): ${skipped}`)
    console.log(`   - Total colleges processed: ${allColleges.length}`)

    return { corrected, skipped }
  } catch (error) {
    console.error("❌ Name correction failed:", error)
    throw error
  } finally {
    await client.end()
  }
}

// Main function to discover colleges, remove duplicates, and enrich
async function discoverEnrichAndCleanup(state?: string, city?: string) {
  console.log("🚀 Starting complete college discovery and enrichment process...\n")

  try {
    // Step 1: Discover and add missing colleges
    console.log("=".repeat(60))
    console.log("STEP 1: Discovering Missing Colleges")
    console.log("=".repeat(60))
    const discoveryResult = await discoverAndAddMissingColleges(state, city)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 2: Remove duplicates
    console.log("\n" + "=".repeat(60))
    console.log("STEP 2: Removing Duplicate Colleges")
    console.log("=".repeat(60))
    const duplicateResult = await removeDuplicates(false) // Don't close connection, enrichAllColleges needs it
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 3: Enrich all colleges
    console.log("\n" + "=".repeat(60))
    console.log("STEP 3: Enriching College Data")
    console.log("=".repeat(60))
    await enrichAllColleges()

    console.log("\n" + "=".repeat(60))
    console.log("✨ Complete Process Finished!")
    console.log("=".repeat(60))
    console.log(`📊 Final Summary:`)
    console.log(`   - Colleges discovered and added: ${discoveryResult.added}`)
    console.log(`   - Duplicates removed: ${duplicateResult?.duplicatesRemoved || 0}`)
    console.log(`   - Courses merged: ${duplicateResult?.coursesMerged || 0}`)

    return {
      discovery: discoveryResult,
      duplicates: duplicateResult,
    }
  } catch (error) {
    console.error("❌ Complete process failed:", error)
    throw error
  }
}

// Function to fetch and parse universities from linkingsky.com
async function fetchUniversitiesFromLinkingsky(): Promise<{ added: number; skipped: number }> {
  console.log("🌐 Fetching universities from linkingsky.com...\n")

  const url = "https://linkingsky.com/career-news/universities-list.html"

  try {
    // Fetch the webpage
    console.log(`📡 Fetching: ${url}`)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`✅ Fetched ${html.length} characters of HTML\n`)

    // Use Ollama to extract ALL university data from HTML
    // Send full HTML with clear instructions to extract everything
    console.log("🤖 Using Ollama to extract ALL universities from HTML...\n")
    console.log("⚠️  This may take a few minutes as we extract all 1198+ universities...\n")

    let universitiesData: any[] = []

    // Process HTML in smaller chunks by state sections to avoid timeout
    // Split by state headings (h2 or h3 with state names)
    const statePattern = /<h[23][^>]*>.*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\(?\d+\)?.*?<\/h[23]>/gi
    const stateMatches = [...html.matchAll(statePattern)]

    console.log(`📊 Found ${stateMatches.length} state sections in HTML\n`)
    console.log("🔄 Processing each state section separately to avoid timeout...\n")

    // Process each state section
    for (let i = 0; i < stateMatches.length; i++) {
      const match = stateMatches[i]
      const stateName = match[1]
      const startIndex = match.index || 0
      const endIndex = i < stateMatches.length - 1 ? (stateMatches[i + 1].index || html.length) : html.length
      const stateSection = html.substring(startIndex, Math.min(endIndex, startIndex + 50000)) // Limit to 50KB per section

      console.log(`  Processing state ${i + 1}/${stateMatches.length}: ${stateName}...`)

      const prompt = `Extract ALL universities/colleges from this HTML section for ${stateName} state.

The section contains universities organized by categories:
- Central Government
- State Government  
- Private
- Deemed (Private)
- Deemed (Government)
- Autonomous Higher Education Institutes
- Research Institutes
- Exam Conducting Agencies

Extract EVERY university with:
- Full official name
- State: "${stateName}"
- Category (from subheading)
- City (if mentioned)

HTML Section:
${stateSection}

Return JSON array:
[
  {"name": "University Name", "state": "${stateName}", "category": "Category", "city": "City or null"}
]

Extract ALL universities from this ${stateName} section.`

      try {
        const ollamaResponse = await ollama.chat([{
          role: "user",
          content: prompt
        }])

        // Extract JSON array from response
        let jsonStr = ollamaResponse.trim()
        if (jsonStr.includes("```json")) {
          jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
        } else if (jsonStr.includes("```")) {
          jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
        }

        // Parse JSON with error handling
        const stateUniversities = parseJsonFromOllama(ollamaResponse, 'array')

        // Validate that we got an array
        if (!Array.isArray(stateUniversities)) {
          console.error(`⚠️  Expected array but got ${typeof stateUniversities}. Skipping ${stateName}.`)
          continue
        }
        universitiesData = universitiesData.concat(stateUniversities)

        console.log(`    ✅ Extracted ${stateUniversities.length} universities from ${stateName}`)

        // Small delay between states
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (error) {
        console.error(`    ⚠️  Error processing ${stateName}:`, error)
        // Continue with next state
      }
    }

    // Remove duplicates based on normalized name
    const uniqueUniversities = new Map<string, any>()
    for (const uni of universitiesData) {
      if (!uni.name) continue
      const normalized = normalizeName(uni.name)
      if (!uniqueUniversities.has(normalized)) {
        uniqueUniversities.set(normalized, uni)
      }
    }

    universitiesData = Array.from(uniqueUniversities.values())

    console.log(`\n📋 Extracted ${universitiesData.length} unique universities from HTML\n`)

    // Get existing college names and slugs for comparison
    const existingColleges = await db.select({ name: colleges.name, slug: colleges.slug, city: colleges.city, state: colleges.state }).from(colleges)
    const existingNames = new Set(existingColleges.map(c => normalizeName(c.name)))
    const existingSlugs = new Set(existingColleges.map(c => c.slug))

    console.log(`📊 Found ${existingColleges.length} existing colleges in database\n`)

    let added = 0
    let skipped = 0

    // Process each university
    for (let i = 0; i < universitiesData.length; i++) {
      const universityData = universitiesData[i]
      if (!universityData.name) continue

      const normalizedName = normalizeName(universityData.name)

      // Skip if university already exists
      if (existingNames.has(normalizedName)) {
        skipped++
        if (i % 50 === 0) {
          console.log(`  ⏭️  Progress: ${i}/${universitiesData.length} (Skipped: ${skipped}, Added: ${added})`)
        }
        continue
      }

      // Generate slug
      let slug = generateSlug(universityData.name)
      let slugCounter = 1
      while (existingSlugs.has(slug)) {
        slug = `${generateSlug(universityData.name)}-${slugCounter}`
        slugCounter++
      }
      existingSlugs.add(slug)

      // Extract city from name or use state as fallback
      let city = universityData.city || null
      if (!city && universityData.name) {
        // Try to extract city from name (common patterns)
        const cityMatch = universityData.name.match(/(?:in|at|,)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
        if (cityMatch) {
          city = cityMatch[1].trim()
        }
      }

      try {
        // Insert new university/college
        await db.insert(colleges).values({
          name: universityData.name,
          slug: slug,
          city: city,
          state: universityData.state || null,
          country: "India",
          location: city && universityData.state
            ? `${city}, ${universityData.state}`
            : city || universityData.state || null,
          description: `${universityData.name}${universityData.state ? ` located in ${universityData.state}` : ""}${universityData.category ? ` - ${universityData.category}` : ""}`,
          ownership: universityData.category?.includes("Private") ? "Private" :
            universityData.category?.includes("Government") ? "Government" : null,
        })

        if (i % 10 === 0 || added < 20) {
          console.log(`  ✅ Added: ${universityData.name}${universityData.state ? ` (${universityData.state})` : ""}`)
        }
        added++
        existingNames.add(normalizedName)

        // Small delay to avoid overwhelming database
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error: any) {
        if (error?.code === "23505") { // Duplicate slug
          skipped++
          console.log(`  ⏭️  Skipped (duplicate slug): ${universityData.name}`)
        } else {
          console.error(`  ❌ Error adding ${universityData.name}:`, error.message)
        }
      }
    }

    console.log(`\n✨ Linkingsky import completed!`)
    console.log(`📊 Summary:`)
    console.log(`   - Universities added: ${added}`)
    console.log(`   - Universities skipped (already exist): ${skipped}`)
    console.log(`   - Total universities processed: ${universitiesData.length}`)

    return { added, skipped }
  } catch (error) {
    console.error("❌ Error fetching universities from linkingsky:", error)
    throw error
  } finally {
    // Don't close connection - API route may need it
    // await client.end()
  }
}

// Comprehensive discovery function that discovers colleges across all Indian states
async function discoverCollegesComprehensive(): Promise<{ added: number; skipped: number; statesProcessed: number }> {
  console.log("🚀 Starting comprehensive college discovery across all Indian states...\n")
  console.log("📊 This will discover colleges from all 28 states and 8 union territories\n")

  // All Indian states and union territories
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ]

  // Major cities for additional discovery
  const majorCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"
  ]

  let totalAdded = 0
  let totalSkipped = 0
  let statesProcessed = 0

  // Refresh existing colleges list periodically
  let existingColleges = await db.select({ name: colleges.name, slug: colleges.slug }).from(colleges)
  let existingNames = new Set(existingColleges.map(c => normalizeName(c.name)))
  let existingSlugs = new Set(existingColleges.map(c => c.slug))

  console.log(`📊 Starting with ${existingColleges.length} existing colleges\n`)

  // Discover by state
  for (let i = 0; i < indianStates.length; i++) {
    const state = indianStates[i]
    console.log(`\n${"=".repeat(60)}`)
    console.log(`[${i + 1}/${indianStates.length}] Processing State: ${state}`)
    console.log(`${"=".repeat(60)}`)

    try {
      // Discover colleges in this state (request larger batches)
      const result = await discoverAndAddMissingColleges(state, undefined, 100)
      totalAdded += result.added
      totalSkipped += result.skipped
      statesProcessed++

      // Refresh existing colleges list every 5 states to catch new additions
      if ((i + 1) % 5 === 0) {
        existingColleges = await db.select({ name: colleges.name, slug: colleges.slug }).from(colleges)
        existingNames = new Set(existingColleges.map(c => normalizeName(c.name)))
        existingSlugs = new Set(existingColleges.map(c => c.slug))
        console.log(`\n🔄 Refreshed existing colleges list (now ${existingColleges.length} colleges)`)
      }

      // Delay between states to avoid overwhelming Ollama
      await new Promise(resolve => setTimeout(resolve, 3000))
    } catch (error) {
      console.error(`❌ Error processing state ${state}:`, error)
      // Continue with next state
    }
  }

  // Also discover by major cities (to catch colleges that might be missed)
  console.log(`\n${"=".repeat(60)}`)
  console.log("Processing Major Cities for Additional Discovery")
  console.log(`${"=".repeat(60)}`)

  for (let i = 0; i < majorCities.length; i++) {
    const city = majorCities[i]
    console.log(`\n[${i + 1}/${majorCities.length}] Processing City: ${city}`)

    try {
      const result = await discoverAndAddMissingColleges(undefined, city, 50)
      totalAdded += result.added
      totalSkipped += result.skipped

      // Refresh existing colleges list every 5 cities
      if ((i + 1) % 5 === 0) {
        existingColleges = await db.select({ name: colleges.name, slug: colleges.slug }).from(colleges)
        existingNames = new Set(existingColleges.map(c => normalizeName(c.name)))
        existingSlugs = new Set(existingColleges.map(c => c.slug))
        console.log(`\n🔄 Refreshed existing colleges list (now ${existingColleges.length} colleges)`)
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`❌ Error processing city ${city}:`, error)
      // Continue with next city
    }
  }

  // Final count
  const finalColleges = await db.select().from(colleges)

  console.log(`\n${"=".repeat(60)}`)
  console.log("✨ Comprehensive Discovery Completed!")
  console.log(`${"=".repeat(60)}`)
  console.log(`📊 Final Summary:`)
  console.log(`   - States/UTs processed: ${statesProcessed}/${indianStates.length}`)
  console.log(`   - Cities processed: ${majorCities.length}`)
  console.log(`   - Total colleges added: ${totalAdded}`)
  console.log(`   - Total colleges skipped: ${totalSkipped}`)
  console.log(`   - Final college count: ${finalColleges.length}`)
  console.log(`   - New colleges discovered: ${finalColleges.length - existingColleges.length}`)

  return {
    added: totalAdded,
    skipped: totalSkipped,
    statesProcessed
  }
}

export { enrichAllColleges, enrichCollegeData, enrichCoursesForCollege, enrichCollegeImages, discoverAndAddMissingColleges, discoverEnrichAndCleanup, enrichCollegeReviews, enrichAllCollegeReviews, enrichPlacementStats, enrichApplicationGuides, correctCollegeName, correctAllCollegeNames, fetchUniversitiesFromLinkingsky, discoverCollegesComprehensive }

