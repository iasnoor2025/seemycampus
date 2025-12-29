/**
 * Search result ranking algorithm
 * Scores results based on relevance, popularity, and user preferences
 */

export interface RankingFactors {
  relevanceScore: number // 0-100, based on text match
  popularityScore: number // 0-100, based on views, saves, etc.
  ratingScore: number // 0-100, based on average rating
  recencyScore: number // 0-100, based on how recent the data is
}

export interface RankedResult {
  id: number
  score: number
  factors: RankingFactors
}

/**
 * Calculate relevance score based on search query match
 */
export function calculateRelevanceScore(
  query: string,
  text: string,
  field: "name" | "location" | "description" = "name"
): number {
  if (!query || !text) return 0

  const queryLower = query.toLowerCase().trim()
  const textLower = text.toLowerCase()

  // Exact match gets highest score
  if (textLower === queryLower) return 100

  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) {
    return field === "name" ? 90 : 70
  }

  // Contains query
  if (textLower.includes(queryLower)) {
    return field === "name" ? 70 : 50
  }

  // Word boundary match
  const words = queryLower.split(/\s+/)
  const matchedWords = words.filter((word) => textLower.includes(word))
  if (matchedWords.length > 0) {
    return (matchedWords.length / words.length) * 50
  }

  return 0
}

/**
 * Calculate popularity score (placeholder - can be enhanced with analytics)
 */
export function calculatePopularityScore(
  views?: number,
  saves?: number,
  isAcademicAlliance?: boolean
): number {
  let score = 50 // Base score

  // Academic alliance colleges get boost
  if (isAcademicAlliance) {
    score += 20
  }

  // Views boost (logarithmic scale)
  if (views) {
    score += Math.min(20, Math.log10(views + 1) * 5)
  }

  // Saves boost
  if (saves) {
    score += Math.min(10, saves * 2)
  }

  return Math.min(100, score)
}

/**
 * Calculate rating score from average rating
 */
export function calculateRatingScore(averageRating?: number): number {
  if (!averageRating) return 0
  // Convert 0-5 rating to 0-100 score
  return (averageRating / 5) * 100
}

/**
 * Calculate recency score based on data freshness
 */
export function calculateRecencyScore(updatedAt?: Date | string): number {
  if (!updatedAt) return 50

  const updateDate = typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt
  const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24)

  // Recent updates (within 30 days) get high score
  if (daysSinceUpdate < 30) return 100
  // Within 90 days
  if (daysSinceUpdate < 90) return 80
  // Within 180 days
  if (daysSinceUpdate < 180) return 60
  // Older
  return 40
}

/**
 * Calculate final ranking score with weighted factors
 */
export function calculateFinalScore(
  factors: RankingFactors,
  weights: {
    relevance?: number
    popularity?: number
    rating?: number
    recency?: number
  } = {}
): number {
  const defaultWeights = {
    relevance: 0.4,
    popularity: 0.2,
    rating: 0.3,
    recency: 0.1,
  }

  const finalWeights = { ...defaultWeights, ...weights }

  return (
    factors.relevanceScore * finalWeights.relevance +
    factors.popularityScore * finalWeights.popularity +
    factors.ratingScore * finalWeights.rating +
    factors.recencyScore * finalWeights.recency
  )
}

/**
 * Rank search results
 */
export function rankResults<T extends { id: number }>(
  results: T[],
  query: string,
  getText: (result: T) => string,
  getRating?: (result: T) => number | undefined,
  getUpdatedAt?: (result: T) => Date | string | undefined
): RankedResult[] {
  return results.map((result) => {
    const text = getText(result)
    const relevanceScore = calculateRelevanceScore(query, text, "name")
    const popularityScore = calculatePopularityScore()
    const ratingScore = calculateRatingScore(getRating?.(result))
    const recencyScore = calculateRecencyScore(getUpdatedAt?.(result))

    const factors: RankingFactors = {
      relevanceScore,
      popularityScore,
      ratingScore,
      recencyScore,
    }

    const score = calculateFinalScore(factors)

    return {
      id: result.id,
      score,
      factors,
    }
  })
}

