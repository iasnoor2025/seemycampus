import { NextRequest, NextResponse } from "next/server"
import { getAutocompleteSuggestions, getPopularSuggestions } from "@/lib/search/autocomplete"
import { searchCache, generateCacheKey } from "@/lib/search/cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "10", 10)

    // If query is empty or too short, return popular suggestions
    if (!query || query.trim().length < 2) {
      const cacheKey = generateCacheKey({ type: "popular", limit })
      const cached = searchCache.get<any>(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }

      const popular = await getPopularSuggestions(limit)
      const response = { suggestions: popular }
      searchCache.set(cacheKey, response, 10 * 60 * 1000) // Cache popular for 10 minutes
      return NextResponse.json(response)
    }

    // Check cache for autocomplete
    const cacheKey = generateCacheKey({ type: "autocomplete", q: query, limit })
    const cached = searchCache.get<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const suggestions = await getAutocompleteSuggestions(query, limit)
    const response = { suggestions }
    // Cache autocomplete for 5 minutes
    searchCache.set(cacheKey, response, 5 * 60 * 1000)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in autocomplete API:", error)
    return NextResponse.json(
      { error: "Failed to fetch autocomplete suggestions", suggestions: [] },
      { status: 500 }
    )
  }
}

