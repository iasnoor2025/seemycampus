import { db } from "@/db"
import { colleges, courses } from "@/db/schema"
import { ilike, or, eq, and } from "drizzle-orm"

export interface AutocompleteSuggestion {
  id: string
  text: string
  type: "college" | "course" | "location" | "exam"
  slug?: string
  metadata?: Record<string, any>
}

/**
 * Get autocomplete suggestions for search queries
 * Searches across colleges, courses, locations, and exams
 */
export async function getAutocompleteSuggestions(
  query: string,
  limit: number = 10
): Promise<AutocompleteSuggestion[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = `%${query.trim()}%`
  const suggestions: AutocompleteSuggestion[] = []

  try {
    // Search colleges (only enabled ones)
    const collegeResults = await db
      .select({
        id: colleges.id,
        name: colleges.name,
        slug: colleges.slug,
        location: colleges.location,
        city: colleges.city,
        state: colleges.state,
      })
      .from(colleges)
      .where(
        and(
          eq(colleges.isEnabled, true),
          or(
            ilike(colleges.name, searchTerm),
            ilike(colleges.location, searchTerm),
            ilike(colleges.city, searchTerm)
          )!
        )
      )
      .limit(limit) // Show all matching colleges up to limit

    collegeResults.forEach((college) => {
      suggestions.push({
        id: `college-${college.id}`,
        text: college.name,
        type: "college",
        slug: college.slug,
        metadata: {
          location: college.location || college.city || college.state,
        },
      })
    })

    // Search courses (only if we have space after colleges) - only from enabled colleges
    const remainingLimit = limit - suggestions.length
    const courseResults = remainingLimit > 0 ? await db
      .select({
        id: courses.id,
        name: courses.name,
        slug: courses.slug,
        collegeId: courses.collegeId,
      })
      .from(courses)
      .innerJoin(colleges, eq(courses.collegeId, colleges.id))
      .where(
        and(
          eq(colleges.isEnabled, true),
          ilike(courses.name, searchTerm)
        )
      )
      .limit(Math.min(remainingLimit, Math.ceil(limit * 0.3))) // 30% from courses if space available
      : []

    courseResults.forEach((course) => {
      suggestions.push({
        id: `course-${course.id}`,
        text: course.name,
        type: "course",
        slug: course.slug,
        metadata: {
          collegeId: course.collegeId,
        },
      })
    })

    // Search unique locations (cities and states) - only if we have space (only from enabled colleges)
    const remainingLimitAfterCourses = limit - suggestions.length
    const locationResults = remainingLimitAfterCourses > 0 ? await db
      .selectDistinct({
        city: colleges.city,
        state: colleges.state,
        location: colleges.location,
      })
      .from(colleges)
      .where(
        and(
          eq(colleges.isEnabled, true),
          or(
            ilike(colleges.city, searchTerm),
            ilike(colleges.state, searchTerm),
            ilike(colleges.location, searchTerm)
          )!
        )
      )
      .limit(Math.min(remainingLimitAfterCourses, Math.ceil(limit * 0.2))) // 20% from locations if space available
      : []

    locationResults.forEach((loc) => {
      const locationText = loc.city || loc.state || loc.location
      if (locationText && !suggestions.some((s) => s.text === locationText && s.type === "location")) {
        suggestions.push({
          id: `location-${locationText}`,
          text: locationText,
          type: "location",
          metadata: {
            city: loc.city,
            state: loc.state,
          },
        })
      }
    })

    // Sort by relevance (exact matches first, then partial matches)
    suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase().startsWith(query.toLowerCase())
      const bExact = b.text.toLowerCase().startsWith(query.toLowerCase())
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return a.text.localeCompare(b.text)
    })

    return suggestions.slice(0, limit)
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error)
    return []
  }
}

/**
 * Get popular search suggestions (for empty query or trending searches)
 */
export async function getPopularSuggestions(limit: number = 5): Promise<AutocompleteSuggestion[]> {
  try {
    // Get popular colleges (can be enhanced with analytics data later) - only enabled ones
    const popularColleges = await db
      .select({
        id: colleges.id,
        name: colleges.name,
        slug: colleges.slug,
      })
      .from(colleges)
      .where(
        and(
          eq(colleges.isEnabled, true),
          eq(colleges.isAcademicAlliance, true)
        )
      ) // Use academic alliance as proxy for popularity
      .limit(limit)

    return popularColleges.map((college) => ({
      id: `college-${college.id}`,
      text: college.name,
      type: "college" as const,
      slug: college.slug,
    }))
  } catch (error) {
    console.error("Error fetching popular suggestions:", error)
    return []
  }
}

