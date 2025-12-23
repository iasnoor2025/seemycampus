// Advanced logo finder using web search
// This script uses multiple strategies to find college logos online

import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })

interface LogoSearchResult {
  url: string | null
  source: string
  confidence: "high" | "medium" | "low"
}

/**
 * Search for college logo using multiple strategies
 */
export async function findCollegeLogoWeb(
  collegeName: string,
  website?: string | null,
  slug?: string
): Promise<LogoSearchResult> {
  const results: LogoSearchResult[] = []

  // Strategy 1: Check common logo paths on college website
  if (website) {
    try {
      const url = new URL(website.startsWith("http") ? website : `https://${website}`)
      const baseUrl = `${url.protocol}//${url.hostname}`
      
      const commonPaths = [
        "/logo.png",
        "/logo.jpg",
        "/logo.svg",
        "/images/logo.png",
        "/images/logo.jpg",
        "/images/logo.svg",
        "/assets/logo.png",
        "/assets/images/logo.png",
        "/wp-content/uploads/logo.png",
        "/wp-content/themes/logo.png",
        "/static/logo.png",
        "/public/logo.png",
      ]
      
      for (const path of commonPaths) {
        try {
          const logoUrl = `${baseUrl}${path}`
          const response = await fetch(logoUrl, { 
            method: "HEAD",
            signal: AbortSignal.timeout(3000) // 3 second timeout
          })
          if (response.ok && response.headers.get("content-type")?.startsWith("image/")) {
            results.push({
              url: logoUrl,
              source: "website-direct",
              confidence: "high"
            })
            break
          }
        } catch (e) {
          // Continue to next path
        }
      }
    } catch (e) {
      // Invalid URL, continue
    }
  }

  // Strategy 2: Use Google Custom Search API (if available)
  if (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID) {
    try {
      const searchQuery = website 
        ? `${collegeName} logo site:${website}`
        : `${collegeName} official logo`
      
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=3&imgSize=large&imgType=logo`
      
      const response = await fetch(searchUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          // Prefer results from the college's own website
          const ownSiteResult = data.items.find((item: any) => 
            website && item.link.includes(new URL(website.startsWith("http") ? website : `https://${website}`).hostname)
          )
          
          if (ownSiteResult) {
            results.push({
              url: ownSiteResult.link,
              source: "google-search-own-site",
              confidence: "high"
            })
          } else {
            results.push({
              url: data.items[0].link,
              source: "google-search",
              confidence: "medium"
            })
          }
        }
      }
    } catch (e) {
      console.error("Google Search API error:", e)
    }
  }

  // Strategy 3: Use DuckDuckGo Instant Answer (no API key needed)
  try {
    const searchQuery = `${collegeName} logo`
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`
    
    const response = await fetch(ddgUrl, { signal: AbortSignal.timeout(5000) })
    if (response.ok) {
      const data = await response.json()
      if (data.Image && data.Image.startsWith("http")) {
        results.push({
          url: data.Image,
          source: "duckduckgo",
          confidence: "medium"
        })
      }
    }
  } catch (e) {
    // DuckDuckGo API might not always work, continue
  }

  // Strategy 4: Use Wikipedia API to find logo
  try {
    const wikiQuery = collegeName.replace(/Institute|University|College/g, "").trim()
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`
    
    const response = await fetch(wikiUrl, { signal: AbortSignal.timeout(5000) })
    if (response.ok) {
      const data = await response.json()
      if (data.thumbnail && data.thumbnail.source) {
        // Convert thumbnail to full size
        const fullImageUrl = data.thumbnail.source.replace(/\/\d+px-/, "/800px-")
        results.push({
          url: fullImageUrl,
          source: "wikipedia",
          confidence: "medium"
        })
      }
    }
  } catch (e) {
    // Wikipedia might not have all colleges, continue
  }

  // Return the best result (prefer high confidence, then own-site results)
  if (results.length === 0) {
    return {
      url: null,
      source: "none",
      confidence: "low"
    }
  }

  // Sort by confidence and source preference
  results.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 }
    const sourceOrder = { "website-direct": 4, "google-search-own-site": 3, "google-search": 2, "wikipedia": 1, "duckduckgo": 1 }
    
    if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    }
    return (sourceOrder[b.source as keyof typeof sourceOrder] || 0) - (sourceOrder[a.source as keyof typeof sourceOrder] || 0)
  })

  return results[0]
}

/**
 * Batch find logos for multiple colleges
 */
export async function findLogosBatch(
  colleges: Array<{ name: string; website?: string | null; slug?: string }>,
  delayMs: number = 1000
): Promise<Map<string, LogoSearchResult>> {
  const results = new Map<string, LogoSearchResult>()
  
  for (let i = 0; i < colleges.length; i++) {
    const college = colleges[i]
    console.log(`[${i + 1}/${colleges.length}] Searching logo for: ${college.name}`)
    
    const result = await findCollegeLogoWeb(college.name, college.website, college.slug)
    results.set(college.slug || college.name, result)
    
    if (result.url) {
      console.log(`  ✅ Found: ${result.url} (${result.source}, ${result.confidence})`)
    } else {
      console.log(`  ❌ Not found`)
    }
    
    // Delay to avoid rate limiting
    if (i < colleges.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return results
}

// Export for use in other scripts
export type { LogoSearchResult }

