import { NextRequest, NextResponse } from "next/server"
import { predictAdmission, getAvailableExams, getAvailableCategories, PredictionInput } from "@/lib/admission/predictor"
import { z } from "zod"

// Validation schema
const predictionInputSchema = z.object({
  examName: z.string().min(1, "Exam name is required"),
  score: z.number().optional().nullable(),
  rank: z.number().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  year: z.number().int().optional(),
  courseName: z.string().optional().nullable(),
  collegeId: z.number().int().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = predictionInputSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const input: PredictionInput = parsed.data

    // Validate that either score or rank is provided
    if (!input.score && !input.rank) {
      return NextResponse.json(
        { error: "Either score or rank must be provided" },
        { status: 400 }
      )
    }

    const predictions = await predictAdmission(input)

    return NextResponse.json({
      predictions,
      input,
      totalColleges: predictions.length,
    })
  } catch (error) {
    console.error("Error in admission prediction:", error)
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 }
    )
  }
}

// GET - Get available exams and categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examName = searchParams.get("examName")

    if (examName) {
      // Get categories for specific exam
      const categories = await getAvailableCategories(examName)
      return NextResponse.json({ categories })
    } else {
      // Get all available exams
      const exams = await getAvailableExams()
      return NextResponse.json({ exams })
    }
  } catch (error) {
    console.error("Error fetching exam data:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam data" },
      { status: 500 }
    )
  }
}

