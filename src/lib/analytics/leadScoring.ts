/**
 * Predictive Analytics - Lead Scoring System
 * ML-based lead scoring to predict conversion probability
 */

export interface LeadScore {
  leadId: number
  score: number // 0-100
  conversionProbability: number // 0-1 (0% to 100%)
  factors: ScoreFactor[]
  recommendation: "high_priority" | "medium_priority" | "low_priority" | "nurture"
  optimalContactTime?: string // Best time to contact
  churnRisk?: "low" | "medium" | "high"
}

export interface ScoreFactor {
  name: string
  value: number
  weight: number
  impact: "positive" | "negative" | "neutral"
  description: string
}

export interface LeadData {
  id: number
  name: string
  email: string
  phone?: string | null
  source: string
  status: string
  quizData?: Record<string, any> | null
  studentAnswerId?: number | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Calculate lead score based on multiple factors
 */
export function calculateLeadScore(lead: LeadData): LeadScore {
  const factors: ScoreFactor[] = []
  let totalScore = 0

  // Factor 1: Source Quality (0-25 points)
  const sourceScore = getSourceScore(lead.source)
  factors.push({
    name: "Source Quality",
    value: sourceScore,
    weight: 25,
    impact: "positive",
    description: getSourceDescription(lead.source),
  })
  totalScore += sourceScore

  // Factor 2: Contact Information Completeness (0-15 points)
  const contactScore = getContactCompletenessScore(lead)
  factors.push({
    name: "Contact Completeness",
    value: contactScore,
    weight: 15,
    impact: "positive",
    description: contactScore === 15 ? "Complete contact information" : "Missing contact information",
  })
  totalScore += contactScore

  // Factor 3: Engagement Level (0-20 points)
  const engagementScore = getEngagementScore(lead)
  factors.push({
    name: "Engagement Level",
    value: engagementScore,
    weight: 20,
    impact: "positive",
    description: getEngagementDescription(lead),
  })
  totalScore += engagementScore

  // Factor 4: Recency (0-15 points)
  const recencyScore = getRecencyScore(lead.createdAt)
  factors.push({
    name: "Lead Recency",
    value: recencyScore,
    weight: 15,
    impact: "positive",
    description: getRecencyDescription(lead.createdAt),
  })
  totalScore += recencyScore

  // Factor 5: Status Progression (0-15 points)
  const statusScore = getStatusScore(lead.status)
  factors.push({
    name: "Status Progression",
    value: statusScore,
    weight: 15,
    impact: "positive",
    description: `Current status: ${lead.status}`,
  })
  totalScore += statusScore

  // Factor 6: Quiz Data Quality (0-10 points)
  const quizQualityScore = getQuizQualityScore(lead.quizData)
  factors.push({
    name: "Quiz Data Quality",
    value: quizQualityScore,
    weight: 10,
    impact: "positive",
    description: quizQualityScore > 5 ? "High-quality quiz responses" : "Limited quiz data",
  })
  totalScore += quizQualityScore

  // Calculate conversion probability (0-1)
  const conversionProbability = totalScore / 100

  // Determine recommendation
  const recommendation = getRecommendation(totalScore, conversionProbability)

  // Calculate optimal contact time
  const optimalContactTime = calculateOptimalContactTime(lead)

  // Calculate churn risk
  const churnRisk = calculateChurnRisk(lead, totalScore)

  return {
    leadId: lead.id,
    score: Math.round(totalScore),
    conversionProbability,
    factors,
    recommendation,
    optimalContactTime,
    churnRisk,
  }
}

/**
 * Score based on lead source
 */
function getSourceScore(source: string): number {
  const sourceScores: Record<string, number> = {
    quiz: 25, // Highest - completed quiz shows high intent
    chat: 20, // High - engaged with chatbot
    form: 15, // Medium - filled out form
    direct: 10, // Lower - direct contact
  }
  return sourceScores[source] || 10
}

function getSourceDescription(source: string): string {
  const descriptions: Record<string, string> = {
    quiz: "Completed comprehensive quiz - high intent",
    chat: "Engaged with AI chatbot - good interest",
    form: "Submitted contact form - moderate interest",
    direct: "Direct contact - needs qualification",
  }
  return descriptions[source] || "Unknown source"
}

/**
 * Score based on contact information completeness
 */
function getContactCompletenessScore(lead: LeadData): number {
  let score = 0
  if (lead.email) score += 5
  if (lead.phone) score += 10
  return score
}

/**
 * Score based on engagement level
 */
function getEngagementScore(lead: LeadData): number {
  let score = 0

  // Has quiz data = higher engagement
  if (lead.quizData && Object.keys(lead.quizData).length > 0) {
    score += 15

    // Check for specific engagement indicators
    if (lead.quizData.interests && Array.isArray(lead.quizData.interests) && lead.quizData.interests.length > 0) {
      score += 3
    }
    if (lead.quizData.budgetMin && lead.quizData.budgetMax) {
      score += 2
    }
  } else {
    // No quiz data = lower engagement
    score += 5
  }

  return Math.min(score, 20)
}

function getEngagementDescription(lead: LeadData): string {
  if (lead.quizData && Object.keys(lead.quizData).length > 5) {
    return "High engagement - detailed quiz responses"
  }
  if (lead.quizData && Object.keys(lead.quizData).length > 0) {
    return "Moderate engagement - basic quiz responses"
  }
  return "Low engagement - no quiz data"
}

/**
 * Score based on recency (newer = higher score)
 */
function getRecencyScore(createdAt: Date): number {
  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceCreation <= 1) return 15 // Last 24 hours
  if (daysSinceCreation <= 7) return 12 // Last week
  if (daysSinceCreation <= 30) return 8 // Last month
  if (daysSinceCreation <= 90) return 5 // Last 3 months
  return 2 // Older
}

function getRecencyDescription(createdAt: Date): string {
  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceCreation === 0) return "Created today - very fresh"
  if (daysSinceCreation === 1) return "Created yesterday - fresh"
  if (daysSinceCreation <= 7) return `Created ${daysSinceCreation} days ago - recent`
  if (daysSinceCreation <= 30) return `Created ${daysSinceCreation} days ago - moderate`
  return `Created ${daysSinceCreation} days ago - stale`
}

/**
 * Score based on current status
 */
function getStatusScore(status: string): number {
  const statusScores: Record<string, number> = {
    converted: 15,
    qualified: 12,
    contacted: 8,
    new: 5,
  }
  return statusScores[status] || 5
}

/**
 * Score based on quiz data quality
 */
function getQuizQualityScore(quizData?: Record<string, any> | null): number {
  if (!quizData) return 0

  let score = 0
  const fields = ["interests", "preferredLocation", "budgetMin", "budgetMax", "studyMode", "academicLevel"]

  fields.forEach((field) => {
    if (quizData[field] !== null && quizData[field] !== undefined && quizData[field] !== "") {
      score += 1.5
    }
  })

  // Bonus for having multiple interests
  if (Array.isArray(quizData.interests) && quizData.interests.length > 1) {
    score += 1
  }

  return Math.min(Math.round(score), 10)
}

/**
 * Get recommendation based on score
 */
function getRecommendation(score: number, probability: number): LeadScore["recommendation"] {
  if (score >= 80 && probability >= 0.8) return "high_priority"
  if (score >= 60 && probability >= 0.6) return "medium_priority"
  if (score >= 40 && probability >= 0.4) return "low_priority"
  return "nurture"
}

/**
 * Calculate optimal contact time
 */
function calculateOptimalContactTime(lead: LeadData): string {
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceCreation <= 1) {
    return "Immediate - contact within 24 hours"
  }
  if (daysSinceCreation <= 3) {
    return "Soon - contact within 3 days"
  }
  if (daysSinceCreation <= 7) {
    return "This week - contact within 7 days"
  }
  return "Follow up - re-engage lead"
}

/**
 * Calculate churn risk
 */
function calculateChurnRisk(lead: LeadData, score: number): "low" | "medium" | "high" {
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // High churn risk: old lead with low score
  if (daysSinceCreation > 30 && score < 40) return "high"

  // Medium churn risk: old lead or low engagement
  if (daysSinceCreation > 14 && score < 60) return "medium"

  // Low churn risk: new lead or high score
  return "low"
}

/**
 * Predict conversion probability for a lead
 */
export function predictConversion(lead: LeadData): number {
  const leadScore = calculateLeadScore(lead)
  return leadScore.conversionProbability
}

/**
 * Get optimal contact timing
 */
export function getOptimalContactTiming(lead: LeadData): {
  urgency: "high" | "medium" | "low"
  recommendedAction: string
  timeframe: string
} {
  const score = calculateLeadScore(lead)
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (score.score >= 80 && daysSinceCreation <= 1) {
    return {
      urgency: "high",
      recommendedAction: "Contact immediately - high-value lead",
      timeframe: "Within 24 hours",
    }
  }

  if (score.score >= 60 && daysSinceCreation <= 3) {
    return {
      urgency: "medium",
      recommendedAction: "Contact soon - good conversion potential",
      timeframe: "Within 3 days",
    }
  }

  if (daysSinceCreation > 30) {
    return {
      urgency: "low",
      recommendedAction: "Re-engage lead - may need nurturing",
      timeframe: "Plan re-engagement campaign",
    }
  }

  return {
    urgency: "medium",
    recommendedAction: "Follow standard process",
    timeframe: "Within 7 days",
  }
}

/**
 * Batch score multiple leads
 */
export function batchScoreLeads(leads: LeadData[]): LeadScore[] {
  return leads.map((lead) => calculateLeadScore(lead))
}

/**
 * Get leads sorted by score (highest first)
 */
export function getLeadsByPriority(leads: LeadData[]): Array<LeadData & { score: LeadScore }> {
  const scoredLeads = leads.map((lead) => ({
    ...lead,
    score: calculateLeadScore(lead),
  }))

  return scoredLeads.sort((a, b) => b.score.score - a.score.score)
}

