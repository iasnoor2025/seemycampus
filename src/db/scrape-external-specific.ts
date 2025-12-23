// Load environment variables FIRST before any other imports
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

import * as cheerio from "cheerio"
import puppeteer, { Browser, Page } from "puppeteer"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { colleges, courses } from "./schema"
import { eq } from "drizzle-orm"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString)
const db = drizzle(client, { schema })

// Delay function to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// User agent to avoid blocking
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

interface CollegeData {
  name: string
  slug: string
  location?: string
  city?: string
  state?: string
  description?: string
  ranking?: number
  establishedYear?: number
  accreditation?: string
  ownership?: string
  campusSize?: string
  totalStudents?: number
  hostelFees?: number
  averagePackage?: number
  highestPackage?: number
  entranceExams?: string[]
  website?: string
  email?: string
  phone?: string
  logoUrl?: string
  images?: string[]
  courses?: CourseData[]
}

interface CourseData {
  name: string
  slug: string
  duration?: string
  fees?: number
  level?: string
  studyMode?: string
  description?: string
}

/**
 * Extract number from text (e.g., "₹ 2.5 Lakhs" -> 250000)
 */
function extractNumber(text: string | null | undefined): number | undefined {
  if (!text) return undefined
  
  // Remove currency symbols and text
  const cleaned = text
    .replace(/[₹,Rs]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
  
  // Handle "Lakhs" and "Crores"
  const lakhMatch = cleaned.match(/([\d.]+)\s*lakhs?/i)
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000)
  }
  
  const croreMatch = cleaned.match(/([\d.]+)\s*crores?/i)
  if (croreMatch) {
    return Math.round(parseFloat(croreMatch[1]) * 10000000)
  }
  
  // Try to extract plain number
  const numberMatch = cleaned.match(/[\d.]+/)
  if (numberMatch) {
    return Math.round(parseFloat(numberMatch[0]))
  }
  
  return undefined
}

/**
 * Extract year from text
 */
function extractYear(text: string | null | undefined): number | undefined {
  if (!text) return undefined
  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  return yearMatch ? parseInt(yearMatch[0]) : undefined
}

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Download image and save locally
 */
async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) return null
    
    const buffer = await response.arrayBuffer()
    const publicDir = join(process.cwd(), "public", "images", "colleges")
    
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true })
    }
    
    const filepath = join(publicDir, filename)
    await writeFile(filepath, Buffer.from(buffer))
    
    return `/images/colleges/${filename}`
  } catch (error) {
    console.error(`  ❌ Error downloading image ${url}:`, error)
    return null
  }
}

/**
 * Scrape college listing page from specific URL
 */
async function scrapeCollegeListings(url: string, page: Page): Promise<string[]> {
  try {
    console.log(`📋 Fetching college listings from: ${url}`)
    
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    })
    
    // Wait a bit for content to load
    await delay(3000)
    
    // Scroll to load lazy content
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
    await delay(2000)
    
    // Get all college links using JavaScript evaluation
    const collegeLinks = await page.evaluate(() => {
      const links: string[] = []
      const seen = new Set<string>()
      
      // Find all links that look like college detail pages
      document.querySelectorAll("a").forEach((a: HTMLAnchorElement) => {
        const href = a.href
        if (href && href.includes("/college/")) {
          // Filter out non-college pages and sub-pages
          const excludePatterns = [
            "/college-predictor", 
            "/college-finder", 
            "/compare", 
            "/admission", 
            "/exam",
            "/courses-fees",
            "/placement",
            "/reviews",
            "/ranking",
            "/cutoff",
            "/admission",
            "/facilities",
            "/gallery"
          ]
          const isExcluded = excludePatterns.some(pattern => href.includes(pattern))
          
          if (!isExcluded) {
            const cleanUrl = href.split("?")[0].split("#")[0]
            // Check if it looks like a college detail page (main page only)
            const urlParts = cleanUrl.split("/college/")[1]
            // Main college pages typically have format: number-college-name
            // Sub-pages have additional path segments
            if (urlParts && urlParts.match(/^\d+-/) && !urlParts.includes("/")) {
              if (!seen.has(cleanUrl)) {
                links.push(cleanUrl)
                seen.add(cleanUrl)
              }
            }
          }
        }
      })
      
      return links
    })
    
    console.log(`  ✅ Found ${collegeLinks.length} college links`)
    return collegeLinks
  } catch (error) {
    console.error(`  ❌ Error scraping listings:`, error)
    return []
  }
}

/**
 * Scrape individual college page
 */
async function scrapeCollegePage(url: string, page: Page): Promise<CollegeData | null> {
  try {
    await delay(1500) // Rate limiting
    
    console.log(`  🌐 Loading: ${url}`)
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    })
    
    // Wait for main content
    await delay(2000)
    
    // Get page content
    const html = await page.content()
    const $ = cheerio.load(html)
    
    // Extract college name
    let name = $("h1").first().text().trim() ||
               $(".college-name, .institute-name, .university-name").first().text().trim() ||
               $("[data-college-name]").first().text().trim() ||
               $("title").text().replace(/\s*-\s*External Source.*/i, "").replace(/\s*-\s*College.*/i, "").trim()
    
    name = name.replace(/\s+/g, " ").trim()
    
    if (!name || name.length < 3) {
      console.log(`  ⚠️  Could not extract college name`)
      return null
    }
    
    const slug = generateSlug(name)
    const collegeData: CollegeData = {
      name,
      slug,
      courses: []
    }
    
    // Extract location
    const locationText = $(".location, .address, [data-location], .college-location").first().text().trim() ||
                        $("text:contains('Location')").parent().next().text().trim()
    
    if (locationText) {
      const parts = locationText.split(",").map(s => s.trim()).filter(s => s.length > 0)
      if (parts.length >= 2) {
        collegeData.city = parts[0]
        collegeData.state = parts[parts.length - 1]
      } else if (parts.length === 1) {
        collegeData.city = parts[0]
      }
      collegeData.location = locationText
    }
    
    // Extract description
    collegeData.description = $(".description, .about, .overview").first().text().trim() ||
                              $("meta[name='description']").attr("content") ||
                              $("meta[property='og:description']").attr("content")
    
    // Extract ranking
    const rankingText = $(".ranking, .rank").first().text()
    const rankingMatch = rankingText.match(/#?(\d+)/)
    if (rankingMatch) {
      collegeData.ranking = parseInt(rankingMatch[1])
    }
    
    // Extract established year
    const establishedText = $(".established, .founded, .year-established").first().text()
    collegeData.establishedYear = extractYear(establishedText)
    
    // Extract accreditation
    const accreditationText = $(".accreditation, .approved-by").first().text().trim()
    const accreditations: string[] = []
    if (accreditationText.includes("AICTE")) accreditations.push("AICTE")
    if (accreditationText.includes("UGC")) accreditations.push("UGC")
    if (accreditationText.includes("NAAC")) accreditations.push("NAAC")
    if (accreditations.length > 0) {
      collegeData.accreditation = accreditations.join(", ")
    }
    
    // Extract ownership
    const ownershipText = $(".ownership, .type, .college-type").first().text().toLowerCase()
    if (ownershipText.includes("private")) {
      collegeData.ownership = "Private"
    } else if (ownershipText.includes("government") || ownershipText.includes("public")) {
      collegeData.ownership = "Government"
    }
    
    // Extract campus size
    const campusSizeText = $(".campus-size, .campus").first().text()
    const campusMatch = campusSizeText.match(/([\d.]+)\s*(acres?|sq\s*ft)/i)
    if (campusMatch) {
      collegeData.campusSize = campusMatch[0]
    }
    
    // Extract total students
    const studentsText = $(".students, .enrollment").first().text()
    const studentsMatch = studentsText.match(/([\d,]+)/)
    if (studentsMatch) {
      collegeData.totalStudents = parseInt(studentsMatch[1].replace(/,/g, ""))
    }
    
    // Extract fees and packages
    const hostelFeesText = $(".hostel-fees, .hostel").first().text()
    collegeData.hostelFees = extractNumber(hostelFeesText)
    
    const avgPackageText = $(".average-package, .avg-salary").first().text()
    collegeData.averagePackage = extractNumber(avgPackageText)
    
    const highestPackageText = $(".highest-package, .max-salary").first().text()
    collegeData.highestPackage = extractNumber(highestPackageText)
    
    // Extract entrance exams
    const examsText = $(".entrance-exams, .exams").first().text()
    const examList: string[] = []
    const examKeywords = ["JEE Advanced", "JEE Main", "CAT", "MAT", "CMAT", "NEET", "GATE", "GMAT", "XAT", "CLAT", 
                         "BITSAT", "VITEEE", "SRMJEE", "UPSEE", "WBJEE", "MHT CET", "KCET", "COMEDK"]
    examKeywords.forEach(exam => {
      if (examsText.includes(exam)) {
        examList.push(exam)
      }
    })
    if (examList.length > 0) {
      collegeData.entranceExams = examList
    }
    
    // Extract contact info
    collegeData.website = $("a[href*='http']:contains('Website'), .website a").first().attr("href") ||
                         $("a[href^='http']").filter((_, el) => {
                           const text = $(el).text().toLowerCase()
                           const href = $(el).attr("href") || ""
                           return (text.includes("website") || text.includes("visit")) &&
                                  !href.includes("external-source.com")
                         }).first().attr("href")
    
    const emailMatch = $("body").text().match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    if (emailMatch && !emailMatch[1].includes("external-source")) {
      collegeData.email = emailMatch[1]
    }
    
    const phoneMatch = $("body").text().match(/(\+91[\s-]?\d{10}|\d{10})/)
    if (phoneMatch) {
      collegeData.phone = phoneMatch[1].replace(/\s+/g, "")
    }
    
    // Extract logo
    let logoUrl = $(".logo img, .college-logo img, img[alt*='logo']").first().attr("src") ||
                  $("meta[property='og:image']").attr("content")
    
    if (!logoUrl) {
      logoUrl = $(".logo img, .college-logo img").first().attr("data-src")
    }
    
    if (logoUrl) {
      const fullLogoUrl = logoUrl.startsWith("http") ? logoUrl : `https://external-source.com${logoUrl}`
      collegeData.logoUrl = fullLogoUrl
      
      const logoExt = logoUrl.match(/\.(jpg|jpeg|png|svg|webp)$/i)?.[0] || ".jpg"
      const logoFilename = `${slug}-logo${logoExt}`
      const localLogoPath = await downloadImage(fullLogoUrl, logoFilename)
      if (localLogoPath) {
        collegeData.images = [localLogoPath]
      }
    }
    
    // Extract courses
    $(".course-item, .course-card, .program-item").each((_, el) => {
      let courseName = $(el).find(".course-name, .name, .program-name, h3, h4").first().text().trim() ||
                       $(el).text().split("\n")[0].trim()
      
      // Clean up course name - remove extra text and truncate if too long
      courseName = courseName
        .replace(/\s*Total Fees:.*/i, "")
        .replace(/\s*Check Detailed Fees.*/i, "")
        .replace(/\s*Eligibility:.*/i, "")
        .replace(/\s*Application Date:.*/i, "")
        .replace(/\s*Brochure.*/i, "")
        .replace(/\s*Apply Now.*/i, "")
        .replace(/\s*View \d+ Courses.*/i, "")
        .replace(/\s*#\d+.*/i, "")
        .replace(/\s*\(Based on.*\)/i, "")
        .replace(/\s*\d+ Students.*/i, "")
        .replace(/\s*\d+ Courses.*/i, "")
        .replace(/\s*\d+ Years?.*/i, "")
        .replace(/\s*Full Time.*/i, "")
        .replace(/\s*Part Time.*/i, "")
        .replace(/\s*by External Source.*/i, "")
        .replace(/\s*out of \d+.*/i, "")
        .trim()
      
      // Truncate to 255 characters if too long
      if (courseName.length > 255) {
        courseName = courseName.substring(0, 252) + "..."
      }
      
      if (courseName && courseName.length > 2) {
        const courseSlug = generateSlug(`${courseName}-${slug}`)
        const courseData: CourseData = {
          name: courseName,
          slug: courseSlug
        }
        
        const durationText = $(el).find(".duration, .period").first().text() ||
                            $(el).text().match(/(\d+\s*(years?|months?))/i)?.[0]
        if (durationText) {
          courseData.duration = durationText.trim()
        }
        
        const feesText = $(el).find(".fees, .fee").first().text() ||
                        $(el).text().match(/₹[\s\d.,]+(?:lakhs?)?/i)?.[0]
        courseData.fees = extractNumber(feesText)
        
        const levelText = $(el).text().toLowerCase()
        if (levelText.includes("diploma")) {
          courseData.level = "undergraduate"
        } else if (levelText.includes("bachelor") || levelText.includes("b.tech") || levelText.includes("b.e")) {
          courseData.level = "undergraduate"
        } else if (levelText.includes("master") || levelText.includes("m.tech") || levelText.includes("m.e")) {
          courseData.level = "graduate"
        }
        
        courseData.studyMode = levelText.includes("online") ? "online" : 
                              levelText.includes("hybrid") ? "hybrid" : "offline"
        
        collegeData.courses!.push(courseData)
      }
    })
    
    return collegeData
  } catch (error) {
    console.error(`  ❌ Error scraping college page:`, error)
    return null
  }
}

/**
 * Main scraping function for specific URL
 */
async function scrapeFromUrl(url: string, options: { maxColleges?: number } = {}) {
  const { maxColleges = 100 } = options
  
  console.log("🌐 Starting External Source scraper...\n")
  console.log(`📊 Configuration:`)
  console.log(`   - Source URL: ${url}`)
  console.log(`   - Max colleges: ${maxColleges}\n`)
  
  // Initialize browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  })
  
  try {
    const page = await browser.newPage()
    await page.setUserAgent(USER_AGENT)
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Scrape college listings
    const collegeLinks = await scrapeCollegeListings(url, page)
    
    // Limit to maxColleges
    const linksToScrape = collegeLinks.slice(0, maxColleges)
    console.log(`\n📚 Total colleges to scrape: ${linksToScrape.length}\n`)
    
    if (linksToScrape.length === 0) {
      console.log("⚠️  No college links found. The page structure may have changed.")
      return
    }
    
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    
    // Scrape each college
    for (let i = 0; i < linksToScrape.length; i++) {
      const link = linksToScrape[i]
      console.log(`\n[${i + 1}/${linksToScrape.length}] Scraping: ${link}`)
      
      const collegeData = await scrapeCollegePage(link, page)
      
      if (!collegeData) {
        errorCount++
        continue
      }
      
      try {
        // Check if college already exists
        const existing = await db
          .select()
          .from(colleges)
          .where(eq(colleges.slug, collegeData.slug))
          .limit(1)
        
        if (existing.length > 0) {
          // Update existing college
          await db
            .update(colleges)
            .set({
              name: collegeData.name,
              location: collegeData.location,
              city: collegeData.city,
              state: collegeData.state,
              description: collegeData.description,
              ranking: collegeData.ranking,
              establishedYear: collegeData.establishedYear,
              accreditation: collegeData.accreditation,
              ownership: collegeData.ownership,
              campusSize: collegeData.campusSize,
              totalStudents: collegeData.totalStudents,
              hostelFees: collegeData.hostelFees,
              averagePackage: collegeData.averagePackage,
              highestPackage: collegeData.highestPackage,
              entranceExams: collegeData.entranceExams || [],
              website: collegeData.website,
              email: collegeData.email,
              phone: collegeData.phone,
              images: collegeData.images || [],
              updatedAt: new Date()
            })
            .where(eq(colleges.slug, collegeData.slug))
          
          console.log(`  🔄 Updated: ${collegeData.name}`)
        } else {
          // Insert new college
          const [inserted] = await db
            .insert(colleges)
            .values({
              name: collegeData.name,
              slug: collegeData.slug,
              location: collegeData.location,
              city: collegeData.city,
              state: collegeData.state,
              country: "India",
              description: collegeData.description,
              ranking: collegeData.ranking,
              establishedYear: collegeData.establishedYear,
              accreditation: collegeData.accreditation,
              ownership: collegeData.ownership,
              campusSize: collegeData.campusSize,
              totalStudents: collegeData.totalStudents,
              hostelFees: collegeData.hostelFees,
              averagePackage: collegeData.averagePackage,
              highestPackage: collegeData.highestPackage,
              entranceExams: collegeData.entranceExams || [],
              website: collegeData.website,
              email: collegeData.email,
              phone: collegeData.phone,
              images: collegeData.images || []
            })
            .returning()
          
          console.log(`  ✅ Inserted: ${collegeData.name}`)
          
          // Insert courses
          if (collegeData.courses && collegeData.courses.length > 0 && inserted) {
            for (const courseData of collegeData.courses) {
              try {
                await db.insert(courses).values({
                  name: courseData.name,
                  slug: courseData.slug,
                  collegeId: inserted.id,
                  duration: courseData.duration,
                  fees: courseData.fees,
                  feesCurrency: "INR",
                  level: courseData.level,
                  studyMode: courseData.studyMode,
                  description: courseData.description
                })
                console.log(`    ✅ Course: ${courseData.name}`)
              } catch (error: any) {
                if (error?.code !== "23505") {
                  console.error(`    ❌ Error inserting course:`, error.message)
                }
              }
            }
          }
        }
        
        successCount++
      } catch (error: any) {
        if (error?.code === "23505") {
          skippedCount++
          console.log(`  ⏭️  Skipped (duplicate): ${collegeData.name}`)
        } else {
          errorCount++
          console.error(`  ❌ Error saving:`, error.message)
        }
      }
    }
    
    console.log("\n✨ Scraping completed!")
    console.log(`📊 Summary:`)
    console.log(`   - Successfully scraped: ${successCount}`)
    console.log(`   - Errors: ${errorCount}`)
    console.log(`   - Skipped: ${skippedCount}`)
    console.log(`   - Total processed: ${linksToScrape.length}`)
  } finally {
    await browser.close()
  }
}

// Run scraper
if (require.main === module) {
  const url = "https://external-source.com/engineering/diploma-colleges"
  scrapeFromUrl(url, { maxColleges: 50 })
    .then(() => {
      console.log("\n✅ Scraper completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Scraper failed:", error)
      process.exit(1)
    })
}

export { scrapeFromUrl }

