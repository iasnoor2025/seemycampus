/**
 * Web search utility for finding information not in database
 */

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  source?: string
}

/**
 * Search the web using DuckDuckGo Instant Answer API (free, no API key needed)
 * Falls back to HTML scraping if API doesn't return results
 */
export async function searchWeb(query: string, limit: number = 5): Promise<WebSearchResult[]> {
  try {
    // Try DuckDuckGo Instant Answer API first (simpler, more reliable)
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    
    try {
      const apiResponse = await fetch(apiUrl, {
        signal: AbortSignal.timeout(5000),
      })
      
      if (apiResponse.ok) {
        const data = await apiResponse.json()
        const results: WebSearchResult[] = []
        
        // Use AbstractText if available
        if (data.AbstractText) {
          results.push({
            title: data.Heading || query,
            url: data.AbstractURL || "",
            snippet: data.AbstractText,
            source: "duckduckgo-api",
          })
        }
        
        // Use RelatedTopics if available
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, limit - results.length)) {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text.split(" - ")[0] || topic.Text.substring(0, 100),
                url: topic.FirstURL,
                snippet: topic.Text,
                source: "duckduckgo-api",
              })
            }
          }
        }
        
        if (results.length > 0) {
          return results.slice(0, limit)
        }
      }
    } catch (apiError) {
      // Fall through to HTML scraping
      console.log("DuckDuckGo API failed, trying HTML scraping")
    }

    // Fallback: Use DuckDuckGo HTML search
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return []
    }

    const html = await response.text()
    const results: WebSearchResult[] = []

    // Parse HTML results - DuckDuckGo uses different class names
    // Try multiple patterns to find results
    const patterns = [
      /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="([^"]*)"[^>]*class="[^"]*result__a[^"]*"[^>]*>([^<]+)<\/a>/gi,
      /<a[^>]*href="([^"]*)"[^>]*>([^<]*college[^<]*|[^<]*university[^<]*|[^<]*institute[^<]*)<\/a>/gi,
    ]

    const titles: Array<{ url: string; title: string }> = []
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(html)) !== null && titles.length < limit) {
        const url = match[1]
        const title = match[2].trim()
        if (url && title && !url.includes("duckduckgo.com")) {
          titles.push({ url, title })
        }
      }
      if (titles.length > 0) break
    }

    // Extract snippets
    const snippetPatterns = [
      /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]+)<\/a>/gi,
      /<div[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]+)<\/div>/gi,
    ]

    const snippets: string[] = []
    for (const pattern of snippetPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null && snippets.length < limit) {
        snippets.push(match[1].trim())
      }
      if (snippets.length > 0) break
    }

    // Combine titles and snippets
    for (let i = 0; i < Math.min(titles.length, limit); i++) {
      results.push({
        title: titles[i].title,
        url: titles[i].url,
        snippet: snippets[i] || "",
        source: "duckduckgo-html",
      })
    }

    return results
  } catch (error) {
    console.error("Web search error:", error)
    return []
  }
}

/**
 * Search for college information on the web
 */
export async function searchCollegeInfo(collegeName: string, location?: string): Promise<WebSearchResult[]> {
  const query = location 
    ? `${collegeName} ${location} college university admission fees courses`
    : `${collegeName} college university India admission fees courses`
  
  return searchWeb(query, 5)
}

/**
 * Extract college data from web search results
 */
export function extractCollegeDataFromWeb(searchResults: WebSearchResult[]): {
  name?: string
  location?: string
  description?: string
  website?: string
  ranking?: number
} {
  const data: any = {}

  // Try to extract information from search results
  for (const result of searchResults) {
    // Extract website URL
    if (result.url && !data.website) {
      try {
        const url = new URL(result.url)
        if (url.hostname && !url.hostname.includes("duckduckgo")) {
          data.website = url.origin
        }
      } catch (e) {
        // Invalid URL
      }
    }

    // Extract description from snippets
    if (result.snippet && !data.description) {
      data.description = result.snippet.substring(0, 200)
    }

    // Try to extract ranking from title or snippet
    const rankingMatch = (result.title + " " + result.snippet).match(/rank[#\s]*(\d+)/i)
    if (rankingMatch && !data.ranking) {
      data.ranking = parseInt(rankingMatch[1])
    }
  }

  return data
}
