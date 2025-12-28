/**
 * Utility functions for adding contextual internal links to text content
 */

interface LinkableEntity {
  name: string
  slug: string
  type: "college" | "course" | "scholarship" | "exam"
}

/**
 * Finds mentions of entities in text and converts them to links
 */
export function addContextualLinks(
  text: string,
  entities: LinkableEntity[]
): string {
  if (!text || entities.length === 0) return text

  let result = text
  const usedEntities = new Set<string>()

  // Sort entities by name length (longer first) to match longer names first
  const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length)

  for (const entity of sortedEntities) {
    // Skip if already used (avoid double-linking)
    if (usedEntities.has(entity.name)) continue

    // Create regex to match the entity name (case-insensitive, word boundaries)
    const regex = new RegExp(`\\b${escapeRegex(entity.name)}\\b`, "gi")
    
    // Check if the entity name appears in the text
    if (regex.test(result)) {
      // Replace with link, but only if not already inside an anchor tag
      result = result.replace(regex, (match) => {
        // Check if already inside a link
        const beforeMatch = result.substring(0, result.indexOf(match))
        const afterMatch = result.substring(result.indexOf(match) + match.length)
        
        // Simple check: if there's an unclosed <a tag before, we're inside a link
        const openTags = (beforeMatch.match(/<a\s[^>]*>/gi) || []).length
        const closeTags = (beforeMatch.match(/<\/a>/gi) || []).length
        
        if (openTags > closeTags) {
          return match // Already inside a link, don't replace
        }

        const url = getEntityUrl(entity.type, entity.slug)
        return `<a href="${url}" class="text-blue-600 hover:text-blue-800 hover:underline font-medium">${match}</a>`
      })
      
      usedEntities.add(entity.name)
    }
  }

  return result
}

/**
 * Get URL for an entity type
 */
function getEntityUrl(type: LinkableEntity["type"], slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
  
  switch (type) {
    case "college":
      return `${baseUrl}/colleges/${slug}`
    case "course":
      return `${baseUrl}/courses/${slug}`
    case "scholarship":
      return `${baseUrl}/scholarships/${slug}`
    case "exam":
      return `${baseUrl}/entrance-exams/${slug}`
    default:
      return "#"
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Extract potential entity mentions from text
 * This is a simple implementation - can be enhanced with NLP
 */
export function extractPotentialMentions(text: string): string[] {
  if (!text) return []
  
  // Common patterns: "at [College Name]", "[College Name] offers", etc.
  const patterns = [
    /(?:at|from|in)\s+([A-Z][a-zA-Z\s&]+(?:University|College|Institute|School|Academy))/gi,
    /([A-Z][a-zA-Z\s&]+(?:University|College|Institute|School|Academy))/g,
  ]
  
  const mentions: string[] = []
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].length > 5) {
        mentions.push(match[1].trim())
      }
    }
  }
  
  return [...new Set(mentions)] // Remove duplicates
}

