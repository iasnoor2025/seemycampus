/**
 * AI-Powered Review Analysis
 * Sentiment analysis, summarization, and topic extraction for college reviews
 */

import { OllamaProvider } from "./providers/ollama"
import { OpenAIProvider } from "./providers/openai"
import { OpenRouterProvider } from "./providers/openrouter"
import { CustomAIProvider } from "./providers/custom"
import type { AIProvider } from "./providers/base"
import { isAIEnabled } from "./aiEnabled"
import { getAIConfig } from "./config"

async function getAIProvider(): Promise<AIProvider | null> {
  try {
    const config = await getAIConfig()
    const providerType = config.providerType

    if (providerType === "ollama") {
      return new OllamaProvider({
        apiUrl: config.ollamaApiUrl || "http://localhost:11434",
        model: config.ollamaModel || "llama3.2:latest",
      })
    } else if (providerType === "openrouter") {
      const apiKey = config.openrouterApiKey
      if (!apiKey) return null
      return new OpenRouterProvider({
        apiKey,
        model: config.openrouterModel || "openai/gpt-3.5-turbo",
      })
    } else if (providerType === "openai") {
      const apiKey = config.openaiApiKey
      if (!apiKey) return null
      return new OpenAIProvider({
        apiKey,
        model: config.openaiModel || "gpt-3.5-turbo",
      })
    } else {
      const apiKey = config.customApiKey
      const apiUrl = config.customApiUrl
      if (!apiKey || !apiUrl) return null
      return new CustomAIProvider({
        apiKey,
        apiUrl,
        model: config.customModel || "default",
      })
    }
  } catch (error) {
    console.error("Failed to initialize AI provider for review analysis:", error)
    return null
  }
}

export interface Review {
  id: number
  rating: number
  title?: string | null
  review: string
  category?: string | null
}

export interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  summary: string
}

export interface ReviewSummary {
  overallSentiment: "positive" | "negative" | "mixed"
  keyPoints: string[]
  strengths: string[]
  weaknesses: string[]
  summary: string
}

export interface TopicInsights {
  topics: Array<{
    topic: string
    sentiment: "positive" | "negative" | "neutral"
    mentions: number
    sampleQuotes: string[]
  }>
}

export interface ModerationResult {
  isAppropriate: boolean
  flags: string[]
  reason?: string
}

/**
 * Analyze sentiment of a single review
 */
export async function analyzeReviewSentiment(
  review: Review,
  useAI: boolean = true
): Promise<SentimentResult> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return getBasicSentiment(review)
  }

  const provider = await getAIProvider()
  if (!provider) {
    return getBasicSentiment(review)
  }

  try {
    const prompt = `Analyze the sentiment of this college review and provide a JSON response.

Review:
Rating: ${review.rating}/5
${review.title ? `Title: ${review.title}` : ""}
Content: ${review.review}

Return a JSON object with:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": number between 0 and 1,
  "summary": "brief one-sentence summary"
}

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a sentiment analysis expert. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    // Try to parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        sentiment: parsed.sentiment || getBasicSentiment(review).sentiment,
        confidence: parsed.confidence || 0.7,
        summary: parsed.summary || getBasicSentiment(review).summary,
      }
    }

    return getBasicSentiment(review)
  } catch (error) {
    console.error("AI sentiment analysis failed:", error)
    return getBasicSentiment(review)
  }
}

/**
 * Summarize multiple reviews
 */
export async function summarizeReviews(
  reviews: Review[],
  collegeName: string,
  useAI: boolean = true
): Promise<ReviewSummary> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || reviews.length === 0) {
    return getBasicSummary(reviews)
  }

  const provider = await getAIProvider()
  if (!provider) {
    return getBasicSummary(reviews)
  }

  try {
    const reviewsText = reviews
      .slice(0, 20) // Limit to 20 reviews for prompt size
      .map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.title || ""} ${r.review}`)
      .join("\n\n")

    const prompt = `Summarize these college reviews for ${collegeName}.

Reviews:
${reviewsText}

Return a JSON object with:
{
  "overallSentiment": "positive" | "negative" | "mixed",
  "keyPoints": ["point1", "point2", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "summary": "comprehensive summary paragraph (100-150 words)"
}

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a review analysis expert. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        overallSentiment: parsed.overallSentiment || "mixed",
        keyPoints: parsed.keyPoints || [],
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        summary: parsed.summary || getBasicSummary(reviews).summary,
      }
    }

    return getBasicSummary(reviews)
  } catch (error) {
    console.error("AI review summarization failed:", error)
    return getBasicSummary(reviews)
  }
}

/**
 * Extract topics from reviews
 */
export async function extractReviewTopics(
  reviews: Review[],
  useAI: boolean = true
): Promise<TopicInsights> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled || reviews.length === 0) {
    return { topics: [] }
  }

  const provider = await getAIProvider()
  if (!provider) {
    return { topics: [] }
  }

  try {
    const reviewsText = reviews
      .slice(0, 15)
      .map((r) => `${r.rating}/5: ${r.review}`)
      .join("\n")

    const prompt = `Extract key topics from these college reviews.

Reviews:
${reviewsText}

Return a JSON object with:
{
  "topics": [
    {
      "topic": "topic name (e.g., 'faculty', 'infrastructure', 'placements')",
      "sentiment": "positive" | "negative" | "neutral",
      "mentions": number,
      "sampleQuotes": ["quote1", "quote2"]
    }
  ]
}

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a topic extraction expert. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        topics: parsed.topics || [],
      }
    }

    return { topics: [] }
  } catch (error) {
    console.error("AI topic extraction failed:", error)
    return { topics: [] }
  }
}

/**
 * Moderate review content
 */
export async function moderateReview(
  review: string,
  useAI: boolean = true
): Promise<ModerationResult> {
  // Check feature flag first
  const aiEnabled = await isAIEnabled()
  if (!useAI || !aiEnabled) {
    return { isAppropriate: true, flags: [] }
  }

  const provider = await getAIProvider()
  if (!provider) {
    return { isAppropriate: true, flags: [] }
  }

  try {
    const prompt = `Moderate this college review for inappropriate content.

Review: ${review}

Return a JSON object with:
{
  "isAppropriate": boolean,
  "flags": ["flag1", "flag2"] or empty array,
  "reason": "brief reason if not appropriate"
}

Check for: spam, profanity, hate speech, personal attacks, fake reviews, off-topic content.

Return ONLY the JSON object, no other text.`

    const response = await provider.chat([
      {
        role: "system",
        content: "You are a content moderation expert. Return only valid JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        isAppropriate: parsed.isAppropriate !== false,
        flags: parsed.flags || [],
        reason: parsed.reason,
      }
    }

    return { isAppropriate: true, flags: [] }
  } catch (error) {
    console.error("AI review moderation failed:", error)
    return { isAppropriate: true, flags: [] }
  }
}

// Helper functions for fallback
function getBasicSentiment(review: Review): SentimentResult {
  if (review.rating >= 4) {
    return { sentiment: "positive", confidence: 0.8, summary: "Positive review" }
  } else if (review.rating <= 2) {
    return { sentiment: "negative", confidence: 0.8, summary: "Negative review" }
  }
  return { sentiment: "neutral", confidence: 0.6, summary: "Neutral review" }
}

function getBasicSummary(reviews: Review[]): ReviewSummary {
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const positiveCount = reviews.filter((r) => r.rating >= 4).length
  const negativeCount = reviews.filter((r) => r.rating <= 2).length

  let overallSentiment: "positive" | "negative" | "mixed" = "mixed"
  if (positiveCount > negativeCount * 2) overallSentiment = "positive"
  else if (negativeCount > positiveCount * 2) overallSentiment = "negative"

  return {
    overallSentiment,
    keyPoints: [`Average rating: ${avgRating.toFixed(1)}/5`, `${reviews.length} reviews`],
    strengths: [],
    weaknesses: [],
    summary: `Based on ${reviews.length} reviews, this college has an average rating of ${avgRating.toFixed(1)}/5.`,
  }
}
