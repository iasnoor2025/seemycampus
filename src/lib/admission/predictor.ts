
/**
 * Admission Predictor Service
 * Feature has been disabled/removed.
 */

// Define generic types to satisfy existing imports
export interface PredictionInput {
  examName: string
  score?: number | null
  rank?: number | null
  category: string
  year?: number
  courseName?: string | null
  collegeId?: number | null
}

export interface PredictionResult {
  collegeId: number
  collegeName: string
  collegeSlug: string
  courseName: string | null
  probability: number
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

export async function predictAdmission(input: PredictionInput): Promise<PredictionResult[]> {
  // Feature removed, return empty results
  return [];
}

export async function getAvailableExams(): Promise<string[]> {
  return [];
}

export async function getAvailableCategories(examName: string): Promise<string[]> {
  return [];
}
