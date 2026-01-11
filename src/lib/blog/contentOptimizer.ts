/**
 * Blog Content Optimization Utilities
 * Functions to help optimize blog content for SEO
 */

import { baseUrl } from "@/lib/constants"

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, limit: number = 10): string[] {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]+>/g, " ").toLowerCase()
  
  // Common stop words to exclude
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would",
    "should", "could", "may", "might", "must", "can", "this", "that",
    "these", "those", "i", "you", "he", "she", "it", "we", "they", "what",
    "which", "who", "whom", "whose", "where", "when", "why", "how", "all",
    "each", "every", "both", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "just", "about", "into", "through", "during", "before", "after", "above",
    "below", "up", "down", "out", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all",
    "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  ])
  
  // Extract words
  const words = cleanText
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
  
  // Count frequency
  const wordCount: Record<string, number> = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

/**
 * Generate internal links for blog content
 */
export function addInternalLinks(
  content: string,
  links: Array<{ keyword: string; url: string; title?: string }>
): string {
  let optimizedContent = content
  
  // Sort links by keyword length (longer first) to avoid partial matches
  const sortedLinks = links.sort((a, b) => b.keyword.length - a.keyword.length)
  
  sortedLinks.forEach(({ keyword, url, title }) => {
    // Create regex to find keyword (case insensitive, whole word)
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
    
    // Check if link already exists
    const linkExists = new RegExp(`<a[^>]*>.*?${keyword}.*?</a>`, "i").test(optimizedContent)
    
    if (!linkExists) {
      // Replace first occurrence only
      optimizedContent = optimizedContent.replace(
        regex,
        (match, offset) => {
          // Check if we're inside an existing link
          const beforeMatch = optimizedContent.substring(0, offset)
          const openTags = (beforeMatch.match(/<a[^>]*>/g) || []).length
          const closeTags = (beforeMatch.match(/<\/a>/g) || []).length
          
          if (openTags > closeTags) {
            return match // Inside a link, don't replace
          }
          
          return `<a href="${url.startsWith("http") ? url : `${baseUrl}${url}`}" title="${title || keyword}" class="text-blue-600 hover:text-blue-800 hover:underline">${match}</a>`
        }
      )
    }
  })
  
  return optimizedContent
}

/**
 * Optimize meta description
 */
export function optimizeMetaDescription(text: string, maxLength: number = 160): string {
  // Remove HTML tags
  let description = text.replace(/<[^>]+>/g, " ").trim()
  
  // Remove extra whitespace
  description = description.replace(/\s+/g, " ")
  
  // Truncate if too long
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3)
    // Try to cut at sentence end
    const lastPeriod = description.lastIndexOf(".")
    const lastExclamation = description.lastIndexOf("!")
    const lastQuestion = description.lastIndexOf("?")
    const lastPunctuation = Math.max(lastPeriod, lastExclamation, lastQuestion)
    
    if (lastPunctuation > maxLength * 0.7) {
      description = description.substring(0, lastPunctuation + 1)
    } else {
      description += "..."
    }
  }
  
  return description
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Extract reading time estimate
 */
export function estimateReadingTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]+>/g, " ")
  
  // Count words (average reading speed: 200 words per minute)
  const words = text.trim().split(/\s+/).length
  const readingTime = Math.ceil(words / 200)
  
  return Math.max(1, readingTime) // Minimum 1 minute
}

/**
 * Generate table of contents from HTML content
 */
export function generateTableOfContents(content: string): Array<{ id: string; text: string; level: number }> {
  const headings = content.match(/<h([2-4])[^>]*>(.*?)<\/h[2-4]>/gi) || []
  
  return headings.map((heading, index) => {
    const levelMatch = heading.match(/<h([2-4])/)
    const level = levelMatch ? parseInt(levelMatch[1]) : 2
    
    const textMatch = heading.match(/>([^<]+)</)
    const text = textMatch ? textMatch[1].trim() : `Section ${index + 1}`
    
    const id = generateSlug(text)
    
    return { id, text, level }
  })
}

/**
 * Add IDs to headings in content
 */
export function addHeadingIds(content: string): string {
  return content.replace(
    /<h([2-4])[^>]*>(.*?)<\/h[2-4]>/gi,
    (match, level, text) => {
      const cleanText = text.replace(/<[^>]+>/g, "").trim()
      const id = generateSlug(cleanText)
      return `<h${level} id="${id}">${text}</h${level}>`
    }
  )
}

/**
 * Optimize images in content
 */
export function optimizeImages(content: string): string {
  return content.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Check if alt attribute exists
      if (!/alt\s*=/i.test(attributes)) {
        // Extract src to use as alt fallback
        const srcMatch = attributes.match(/src\s*=\s*["']([^"']+)["']/i)
        if (srcMatch) {
          const src = srcMatch[1]
          const alt = src.split("/").pop()?.replace(/\.[^.]*$/, "") || "Image"
          attributes += ` alt="${alt}"`
        }
      }
      
      // Add loading="lazy" if not present
      if (!/loading\s*=/i.test(attributes)) {
        attributes += ` loading="lazy"`
      }
      
      return `<img${attributes}>`
    }
  )
}

/**
 * Extract college names from content for internal linking
 */
export function extractCollegeNames(content: string): string[] {
  // This is a simplified version - can be enhanced with actual college database lookup
  const collegePatterns = [
    /IIT\s+[A-Z][a-z]+/g,
    /IIM\s+[A-Z][a-z]+/g,
    /NIT\s+[A-Z][a-z]+/g,
    /[A-Z][a-z]+\s+University/g,
    /[A-Z][a-z]+\s+Institute/g,
    /[A-Z][a-z]+\s+College/g,
  ]
  
  const colleges: string[] = []
  collegePatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      colleges.push(...matches)
    }
  })
  
  return [...new Set(colleges)] // Remove duplicates
}

/**
 * Generate related content suggestions
 */
export function generateRelatedContentSuggestions(
  title: string,
  content: string,
  tags: string[] = []
): string[] {
  const suggestions: string[] = []
  
  // Extract keywords
  const keywords = extractKeywords(content, 5)
  
  // Generate suggestions based on keywords and tags
  const allTerms = [...keywords, ...tags]
  
  allTerms.forEach(term => {
    if (term.length > 4) {
      suggestions.push(`Best ${term} colleges`)
      suggestions.push(`${term} admission guide`)
      suggestions.push(`Top ${term} courses`)
    }
  })
  
  return suggestions.slice(0, 5)
}

