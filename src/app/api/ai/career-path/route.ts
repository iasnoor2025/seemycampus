import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  simulateCareerPath,
  type CareerInterest,
  type CareerPathSimulation,
} from "@/lib/ai/careerPathSimulation"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { interests, currentSkills, academicLevel } = body

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: "Interests array is required" },
        { status: 400 }
      )
    }

    // Validate interests format
    const validInterests: CareerInterest[] = interests.map((interest: any) => ({
      field: interest.field || interest,
      level: interest.level || "beginner",
      experience: interest.experience || [],
    }))

    const simulation = simulateCareerPath(
      validInterests,
      currentSkills || [],
      academicLevel
    )

    return NextResponse.json({ simulation })
  } catch (error: any) {
    console.error("Error in career path simulation:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate career path simulation" },
      { status: 500 }
    )
  }
}

