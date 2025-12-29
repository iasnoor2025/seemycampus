/**
 * Cutoff Trends Analysis Service
 * Analyzes cutoff trends over years and provides insights
 */

import { db } from "@/db"
import { cutoffs, colleges } from "@/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"

export interface CutoffTrend {
  year: number
  closingRank: number | null
  closingScore: number | null
  openingRank: number | null
  openingScore: number | null
  round: number | null
}

export interface TrendAnalysis {
  collegeId: number
  collegeName: string
  collegeSlug: string
  examName: string
  courseName: string | null
  category: string | null
  trends: CutoffTrend[]
  analysis: {
    rankTrend: "increasing" | "decreasing" | "stable" | "insufficient"
    scoreTrend: "increasing" | "decreasing" | "stable" | "insufficient"
    rankChange: number | null // Percentage change
    scoreChange: number | null // Percentage change
    predictedNextYear: {
      rank?: number | null
      score?: number | null
    }
    volatility: "high" | "medium" | "low" // How much cutoffs fluctuate
  }
}

/**
 * Get cutoff trends for a specific college, exam, and category
 */
export async function getCutoffTrends(
  collegeId: number,
  examName: string,
  category?: string | null,
  courseName?: string | null
): Promise<TrendAnalysis | null> {
  try {
    const conditions = [
      eq(cutoffs.collegeId, collegeId),
      eq(cutoffs.examName, examName),
    ]

    if (category) {
      conditions.push(eq(cutoffs.category, category))
    }
    if (courseName) {
      conditions.push(eq(cutoffs.courseName, courseName))
    }

    const cutoffData = await db
      .select({
        cutoff: cutoffs,
        college: {
          id: colleges.id,
          name: colleges.name,
          slug: colleges.slug,
        },
      })
      .from(cutoffs)
      .innerJoin(colleges, eq(cutoffs.collegeId, colleges.id))
      .where(and(...conditions))
      .orderBy(desc(cutoffs.year), desc(cutoffs.round))

    if (cutoffData.length === 0) {
      return null
    }

    const college = cutoffData[0].college
    const latestCutoff = cutoffData[0].cutoff

    // Group by year and get latest round for each year
    const trendsByYear = new Map<number, CutoffTrend>()

    for (const item of cutoffData) {
      const year = item.cutoff.year
      if (!trendsByYear.has(year) || (item.cutoff.round || 0) > (trendsByYear.get(year)?.round || 0)) {
        trendsByYear.set(year, {
          year: item.cutoff.year,
          closingRank: item.cutoff.closingRank,
          closingScore: item.cutoff.closingScore,
          openingRank: item.cutoff.openingRank,
          openingScore: item.cutoff.openingScore,
          round: item.cutoff.round,
        })
      }
    }

    const trends = Array.from(trendsByYear.values()).sort((a, b) => a.year - b.year)

    // Analyze trends
    const analysis = analyzeTrends(trends)

    return {
      collegeId: college.id,
      collegeName: college.name,
      collegeSlug: college.slug,
      examName: latestCutoff.examName,
      courseName: latestCutoff.courseName,
      category: latestCutoff.category,
      trends,
      analysis,
    }
  } catch (error) {
    console.error("Error fetching cutoff trends:", error)
    return null
  }
}

/**
 * Compare cutoff trends across multiple colleges
 */
export async function compareCutoffTrends(
  collegeIds: number[],
  examName: string,
  category?: string | null,
  courseName?: string | null
): Promise<TrendAnalysis[]> {
  const results: TrendAnalysis[] = []

  for (const collegeId of collegeIds) {
    const trend = await getCutoffTrends(collegeId, examName, category, courseName)
    if (trend) {
      results.push(trend)
    }
  }

  return results
}

/**
 * Analyze trends and provide insights
 */
function analyzeTrends(trends: CutoffTrend[]): TrendAnalysis["analysis"] {
  if (trends.length < 2) {
    return {
      rankTrend: "insufficient",
      scoreTrend: "insufficient",
      rankChange: null,
      scoreChange: null,
      predictedNextYear: {},
      volatility: "low",
    }
  }

  // Analyze rank trends
  const ranks = trends
    .map((t) => t.closingRank)
    .filter((r): r is number => r !== null)
    .reverse() // Oldest to newest

  let rankTrend: "increasing" | "decreasing" | "stable" = "stable"
  let rankChange: number | null = null

  if (ranks.length >= 2) {
    const firstRank = ranks[0]
    const lastRank = ranks[ranks.length - 1]
    rankChange = ((lastRank - firstRank) / firstRank) * 100

    // Count increases and decreases
    let increases = 0
    let decreases = 0

    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] > ranks[i - 1]) increases++
      else if (ranks[i] < ranks[i - 1]) decreases++
    }

    if (increases > decreases && Math.abs(rankChange) > 5) {
      rankTrend = "increasing" // Higher rank number = tougher
    } else if (decreases > increases && Math.abs(rankChange) > 5) {
      rankTrend = "decreasing" // Lower rank number = easier
    }
  }

  // Analyze score trends
  const scores = trends
    .map((t) => t.closingScore)
    .filter((s): s is number => s !== null)
    .reverse() // Oldest to newest

  let scoreTrend: "increasing" | "decreasing" | "stable" = "stable"
  let scoreChange: number | null = null

  if (scores.length >= 2) {
    const firstScore = scores[0]
    const lastScore = scores[scores.length - 1]
    scoreChange = ((lastScore - firstScore) / firstScore) * 100

    // Count increases and decreases
    let increases = 0
    let decreases = 0

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[i - 1]) increases++
      else if (scores[i] < scores[i - 1]) decreases++
    }

    if (increases > decreases && Math.abs(scoreChange) > 2) {
      scoreTrend = "increasing" // Higher score = tougher
    } else if (decreases > increases && Math.abs(scoreChange) > 2) {
      scoreTrend = "decreasing" // Lower score = easier
    }
  }

  // Calculate volatility (standard deviation)
  let volatility: "high" | "medium" | "low" = "low"
  if (ranks.length >= 3) {
    const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length
    const variance = ranks.reduce((sum, rank) => sum + Math.pow(rank - mean, 2), 0) / ranks.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = (stdDev / mean) * 100

    if (coefficientOfVariation > 20) {
      volatility = "high"
    } else if (coefficientOfVariation > 10) {
      volatility = "medium"
    }
  }

  // Predict next year
  const predictedNextYear = predictNextYearCutoff(trends)

  return {
    rankTrend,
    scoreTrend,
    rankChange: rankChange ? Math.round(rankChange * 10) / 10 : null,
    scoreChange: scoreChange ? Math.round(scoreChange * 10) / 10 : null,
    predictedNextYear,
    volatility,
  }
}

/**
 * Predict next year's cutoff based on trends
 */
function predictNextYearCutoff(trends: CutoffTrend[]): {
  rank?: number | null
  score?: number | null
} {
  const predicted: { rank?: number | null; score?: number | null } = {}

  // Simple linear regression for rank
  const ranks = trends
    .map((t) => ({ year: t.year, rank: t.closingRank }))
    .filter((d): d is { year: number; rank: number } => d.rank !== null)
    .sort((a, b) => a.year - b.year)

  if (ranks.length >= 2) {
    const n = ranks.length
    const sumX = ranks.reduce((sum, d) => sum + d.year, 0)
    const sumY = ranks.reduce((sum, d) => sum + d.rank, 0)
    const sumXY = ranks.reduce((sum, d) => sum + d.year * d.rank, 0)
    const sumX2 = ranks.reduce((sum, d) => sum + d.year * d.year, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const nextYear = Math.max(...ranks.map((d) => d.year)) + 1
    predicted.rank = Math.round(intercept + slope * nextYear)
  } else if (ranks.length === 1) {
    predicted.rank = ranks[0].rank
  }

  // Simple linear regression for score
  const scores = trends
    .map((t) => ({ year: t.year, score: t.closingScore }))
    .filter((d): d is { year: number; score: number } => d.score !== null)
    .sort((a, b) => a.year - b.year)

  if (scores.length >= 2) {
    const n = scores.length
    const sumX = scores.reduce((sum, d) => sum + d.year, 0)
    const sumY = scores.reduce((sum, d) => sum + d.score, 0)
    const sumXY = scores.reduce((sum, d) => sum + d.year * d.score, 0)
    const sumX2 = scores.reduce((sum, d) => sum + d.year * d.year, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const nextYear = Math.max(...scores.map((d) => d.year)) + 1
    predicted.score = Math.round((intercept + slope * nextYear) * 10) / 10
  } else if (scores.length === 1) {
    predicted.score = scores[0].score
  }

  return predicted
}

/**
 * Get all available exams for trend analysis
 */
export async function getExamsForTrends(): Promise<string[]> {
  try {
    const exams = await db
      .selectDistinct({ examName: cutoffs.examName })
      .from(cutoffs)
      .orderBy(cutoffs.examName)

    return exams.map((e) => e.examName)
  } catch (error) {
    console.error("Error fetching exams for trends:", error)
    return []
  }
}

