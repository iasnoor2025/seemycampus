/**
 * Admission Predictor Service
 * Predicts admission probability based on exam scores, ranks, and historical cutoff data
 */

import { db } from "@/db"
import { cutoffs, colleges } from "@/db/schema"
import { eq, and, gte, lte, sql, desc, isNotNull } from "drizzle-orm"

export interface PredictionInput {
  examName: string
  score?: number | null
  rank?: number | null
  category: string // General, OBC, SC, ST, EWS
  year?: number // Current year (defaults to latest)
  courseName?: string | null
  collegeId?: number | null // Optional: predict for specific college
}

export interface PredictionResult {
  collegeId: number
  collegeName: string
  collegeSlug: string
  courseName: string | null
  probability: number // 0-100
  confidence: "high" | "medium" | "low"
  predictedCutoff: {
    rank?: number | null
    score?: number | null
  }
  historicalData: {
    year: number
    closingRank: number | null
    closingScore: number | null
    category: string | null
  }[]
  reasoning: string
}

/**
 * Calculate admission probability for a given input
 */
export async function predictAdmission(
  input: PredictionInput
): Promise<PredictionResult[]> {
  const currentYear = input.year || new Date().getFullYear()
  const results: PredictionResult[] = []

  try {
    // Build query to find relevant cutoffs
    let query = db
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
      .where(
        and(
          eq(cutoffs.examName, input.examName),
          input.collegeId ? eq(cutoffs.collegeId, input.collegeId) : undefined,
          input.courseName ? eq(cutoffs.courseName, input.courseName) : undefined,
          eq(cutoffs.category, input.category)
        )
      )

    const cutoffData = await query.orderBy(desc(cutoffs.year), desc(cutoffs.round))

    if (cutoffData.length === 0) {
      return results
    }

    // Group by college
    const collegeMap = new Map<number, typeof cutoffData>()

    for (const item of cutoffData) {
      const collegeId = item.college.id
      if (!collegeMap.has(collegeId)) {
        collegeMap.set(collegeId, [])
      }
      collegeMap.get(collegeId)!.push(item)
    }

    // Calculate probability for each college
    for (const [collegeId, collegeCutoffs] of collegeMap.entries()) {
      const college = collegeCutoffs[0].college
      const latestCutoff = collegeCutoffs[0].cutoff

      // Get historical data (last 3 years)
      const historicalData = collegeCutoffs
        .slice(0, 3)
        .map((item) => ({
          year: item.cutoff.year,
          closingRank: item.cutoff.closingRank,
          closingScore: item.cutoff.closingScore,
          category: item.cutoff.category,
        }))

      // Calculate probability
      const prediction = calculateProbability(
        input,
        latestCutoff,
        historicalData
      )

      if (prediction.probability > 0) {
        results.push({
          collegeId: college.id,
          collegeName: college.name,
          collegeSlug: college.slug,
          courseName: latestCutoff.courseName,
          probability: prediction.probability,
          confidence: prediction.confidence,
          predictedCutoff: prediction.predictedCutoff,
          historicalData,
          reasoning: prediction.reasoning,
        })
      }
    }

    // Sort by probability (highest first)
    results.sort((a, b) => b.probability - a.probability)

    return results
  } catch (error) {
    console.error("Error predicting admission:", error)
    return results
  }
}

/**
 * Calculate admission probability based on input and historical data
 */
function calculateProbability(
  input: PredictionInput,
  latestCutoff: typeof cutoffs.$inferSelect,
  historicalData: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
    category: string | null
  }>
): {
  probability: number
  confidence: "high" | "medium" | "low"
  predictedCutoff: {
    rank?: number | null
    score?: number | null
  }
  reasoning: string
} {
  let probability = 0
  let confidence: "high" | "medium" | "low" = "low"
  let reasoning = ""

  // If we have rank, use rank-based prediction
  if (input.rank && latestCutoff.closingRank) {
    const rankDifference = latestCutoff.closingRank - input.rank
    const rankRatio = input.rank / latestCutoff.closingRank

    if (rankDifference > 0) {
      // Rank is better (lower number) than closing rank
      if (rankRatio < 0.7) {
        probability = 95
        confidence = "high"
        reasoning = `Your rank (${input.rank}) is significantly better than last year's closing rank (${latestCutoff.closingRank}). High chance of admission.`
      } else if (rankRatio < 0.9) {
        probability = 75
        confidence = "high"
        reasoning = `Your rank (${input.rank}) is better than last year's closing rank (${latestCutoff.closingRank}). Good chance of admission.`
      } else if (rankRatio <= 1.0) {
        probability = 50
        confidence = "medium"
        reasoning = `Your rank (${input.rank}) is close to last year's closing rank (${latestCutoff.closingRank}). Moderate chance of admission.`
      } else {
        probability = 25
        confidence = "low"
        reasoning = `Your rank (${input.rank}) is higher than last year's closing rank (${latestCutoff.closingRank}). Low chance of admission.`
      }
    } else {
      probability = 10
      confidence = "low"
      reasoning = `Your rank (${input.rank}) is significantly higher than last year's closing rank (${latestCutoff.closingRank}). Very low chance of admission.`
    }

    // Adjust based on historical trends
    if (historicalData.length >= 2) {
      const trend = calculateRankTrend(historicalData)
      if (trend === "increasing") {
        // Cutoffs are getting tougher (higher ranks)
        probability = Math.max(0, probability - 10)
        reasoning += " Note: Cutoffs have been increasing over recent years."
      } else if (trend === "decreasing") {
        // Cutoffs are getting easier (lower ranks)
        probability = Math.min(100, probability + 10)
        reasoning += " Note: Cutoffs have been decreasing over recent years."
      }
    }
  }
  // If we have score, use score-based prediction
  else if (input.score && latestCutoff.closingScore) {
    const scoreDifference = input.score - latestCutoff.closingScore
    const scoreRatio = input.score / latestCutoff.closingScore

    if (scoreDifference > 0) {
      // Score is better (higher) than closing score
      if (scoreRatio > 1.1) {
        probability = 95
        confidence = "high"
        reasoning = `Your score (${input.score}) is significantly higher than last year's closing score (${latestCutoff.closingScore}). High chance of admission.`
      } else if (scoreRatio > 1.05) {
        probability = 75
        confidence = "high"
        reasoning = `Your score (${input.score}) is higher than last year's closing score (${latestCutoff.closingScore}). Good chance of admission.`
      } else if (scoreRatio >= 1.0) {
        probability = 50
        confidence = "medium"
        reasoning = `Your score (${input.score}) is close to last year's closing score (${latestCutoff.closingScore}). Moderate chance of admission.`
      } else {
        probability = 25
        confidence = "low"
        reasoning = `Your score (${input.score}) is lower than last year's closing score (${latestCutoff.closingScore}). Low chance of admission.`
      }
    } else {
      probability = 10
      confidence = "low"
      reasoning = `Your score (${input.score}) is significantly lower than last year's closing score (${latestCutoff.closingScore}). Very low chance of admission.`
    }

    // Adjust based on historical trends
    if (historicalData.length >= 2) {
      const trend = calculateScoreTrend(historicalData)
      if (trend === "increasing") {
        // Cutoffs are getting tougher (higher scores)
        probability = Math.max(0, probability - 10)
        reasoning += " Note: Cutoffs have been increasing over recent years."
      } else if (trend === "decreasing") {
        // Cutoffs are getting easier (lower scores)
        probability = Math.min(100, probability + 10)
        reasoning += " Note: Cutoffs have been decreasing over recent years."
      }
    }
  } else {
    // No sufficient data
    probability = 0
    confidence = "low"
    reasoning = "Insufficient data to make a prediction. Please provide either rank or score."
  }

  // Predict next year's cutoff based on trends
  const predictedCutoff = predictNextCutoff(historicalData, latestCutoff)

  return {
    probability: Math.round(probability),
    confidence,
    predictedCutoff,
    reasoning,
  }
}

/**
 * Calculate rank trend from historical data
 */
function calculateRankTrend(
  historicalData: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
    category: string | null
  }>
): "increasing" | "decreasing" | "stable" {
  const ranks = historicalData
    .map((d) => d.closingRank)
    .filter((r): r is number => r !== null)
    .slice(0, 3)

  if (ranks.length < 2) return "stable"

  // Check if ranks are generally increasing (higher rank number = tougher)
  let increasing = 0
  let decreasing = 0

  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] > ranks[i - 1]) increasing++
    else if (ranks[i] < ranks[i - 1]) decreasing++
  }

  if (increasing > decreasing) return "increasing"
  if (decreasing > increasing) return "decreasing"
  return "stable"
}

/**
 * Calculate score trend from historical data
 */
function calculateScoreTrend(
  historicalData: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
    category: string | null
  }>
): "increasing" | "decreasing" | "stable" {
  const scores = historicalData
    .map((d) => d.closingScore)
    .filter((s): s is number => s !== null)
    .slice(0, 3)

  if (scores.length < 2) return "stable"

  // Check if scores are generally increasing (higher score = tougher)
  let increasing = 0
  let decreasing = 0

  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[i - 1]) increasing++
    else if (scores[i] < scores[i - 1]) decreasing++
  }

  if (increasing > decreasing) return "increasing"
  if (decreasing > increasing) return "decreasing"
  return "stable"
}

/**
 * Predict next year's cutoff based on trends
 */
function predictNextCutoff(
  historicalData: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
    category: string | null
  }>,
  latestCutoff: typeof cutoffs.$inferSelect
): {
  rank?: number | null
  score?: number | null
} {
  const predicted: { rank?: number | null; score?: number | null } = {}

  // Simple linear prediction based on trend
  if (historicalData.length >= 2 && latestCutoff.closingRank) {
    const ranks = historicalData
      .map((d) => d.closingRank)
      .filter((r): r is number => r !== null)
      .slice(0, 3)

    if (ranks.length >= 2) {
      const avgChange = (ranks[0] - ranks[ranks.length - 1]) / (ranks.length - 1)
      predicted.rank = Math.round(latestCutoff.closingRank + avgChange)
    } else {
      predicted.rank = latestCutoff.closingRank
    }
  } else {
    predicted.rank = latestCutoff.closingRank
  }

  if (historicalData.length >= 2 && latestCutoff.closingScore) {
    const scores = historicalData
      .map((d) => d.closingScore)
      .filter((s): s is number => s !== null)
      .slice(0, 3)

    if (scores.length >= 2) {
      const avgChange = (scores[0] - scores[scores.length - 1]) / (scores.length - 1)
      predicted.score = Math.round(latestCutoff.closingScore + avgChange)
    } else {
      predicted.score = latestCutoff.closingScore
    }
  } else {
    predicted.score = latestCutoff.closingScore
  }

  return predicted
}

/**
 * Get list of available exams for prediction
 */
export async function getAvailableExams(): Promise<string[]> {
  try {
    const exams = await db
      .selectDistinct({ examName: cutoffs.examName })
      .from(cutoffs)
      .where(isNotNull(cutoffs.examName))
      .orderBy(cutoffs.examName)

    const examNames = exams
      .map((e) => e.examName)
      .filter((name): name is string => name !== null && name.trim() !== "")

    console.log(`Found ${examNames.length} available exams:`, examNames)
    return examNames
  } catch (error) {
    console.error("Error fetching available exams:", error)
    return []
  }
}

/**
 * Get list of available categories for an exam
 */
export async function getAvailableCategories(examName: string): Promise<string[]> {
  try {
    const categories = await db
      .selectDistinct({ category: cutoffs.category })
      .from(cutoffs)
      .where(eq(cutoffs.examName, examName))
      .orderBy(cutoffs.category)

    return categories.map((c) => c.category).filter((cat): cat is string => cat !== null)
  } catch (error) {
    console.error("Error fetching available categories:", error)
    return []
  }
}

