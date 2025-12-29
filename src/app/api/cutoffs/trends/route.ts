import { NextRequest, NextResponse } from "next/server"
import {
  getCutoffTrends,
  compareCutoffTrends,
  getExamsForTrends,
} from "@/lib/cutoffs/trends"
import { z } from "zod"

const trendsQuerySchema = z.object({
  collegeId: z.string().transform((val) => parseInt(val)),
  examName: z.string().min(1),
  category: z.string().optional().nullable(),
  courseName: z.string().optional().nullable(),
})

const compareQuerySchema = z.object({
  collegeIds: z.string().transform((val) =>
    val.split(",").map((id) => parseInt(id.trim())).filter((id) => !isNaN(id))
  ),
  examName: z.string().min(1),
  category: z.string().optional().nullable(),
  courseName: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check if it's a request for available exams
    if (searchParams.get("exams") === "true") {
      const exams = await getExamsForTrends()
      return NextResponse.json({ exams })
    }

    // Check if it's a comparison request
    const collegeIds = searchParams.get("collegeIds")
    if (collegeIds) {
      const parsed = compareQuerySchema.safeParse({
        collegeIds,
        examName: searchParams.get("examName") || "",
        category: searchParams.get("category"),
        courseName: searchParams.get("courseName"),
      })

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid parameters", details: parsed.error.errors },
          { status: 400 }
        )
      }

      const trends = await compareCutoffTrends(
        parsed.data.collegeIds,
        parsed.data.examName,
        parsed.data.category,
        parsed.data.courseName
      )

      return NextResponse.json({ trends })
    }

    // Single college trend request
    const parsed = trendsQuerySchema.safeParse({
      collegeId: searchParams.get("collegeId") || "",
      examName: searchParams.get("examName") || "",
      category: searchParams.get("category"),
      courseName: searchParams.get("courseName"),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const trend = await getCutoffTrends(
      parsed.data.collegeId,
      parsed.data.examName,
      parsed.data.category,
      parsed.data.courseName
    )

    if (!trend) {
      return NextResponse.json(
        { error: "No trend data found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ trend })
  } catch (error) {
    console.error("Error fetching cutoff trends:", error)
    return NextResponse.json(
      { error: "Failed to fetch cutoff trends" },
      { status: 500 }
    )
  }
}

