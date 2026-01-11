import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  generateCollegeDescription,
  enhanceCollegeDescription,
  generateCourseDescription,
  type CollegeContext,
  type CourseContext,
} from "@/lib/ai/contentEnhancement"

/**
 * POST /api/ai/content/enhance
 * Generate or enhance content using AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "college-description":
        const collegeContext: CollegeContext = {
          name: params.name,
          location: params.location,
          city: params.city,
          ranking: params.ranking,
          establishedYear: params.establishedYear,
          accreditation: params.accreditation,
          courses: params.courses,
          averagePackage: params.averagePackage,
          ownership: params.ownership,
          existingDescription: params.existingDescription,
        }

        const description = await generateCollegeDescription(collegeContext, true)
        if (!description) {
          return NextResponse.json({ error: "Failed to generate description" }, { status: 500 })
        }

        return NextResponse.json({ description })

      case "enhance-college-description":
        if (!params.existing || !params.name) {
          return NextResponse.json(
            { error: "Existing description and college name are required" },
            { status: 400 }
          )
        }

        const enhancedContext: CollegeContext = {
          name: params.name,
          location: params.location,
          city: params.city,
          ranking: params.ranking,
          establishedYear: params.establishedYear,
          accreditation: params.accreditation,
          courses: params.courses,
          averagePackage: params.averagePackage,
          ownership: params.ownership,
          existingDescription: params.existing,
        }

        const enhanced = await enhanceCollegeDescription(params.existing, enhancedContext, true)
        if (!enhanced) {
          return NextResponse.json({ error: "Failed to enhance description" }, { status: 500 })
        }

        return NextResponse.json({ description: enhanced })

      case "course-description":
        const courseContext: CourseContext = {
          name: params.name,
          collegeName: params.collegeName,
          duration: params.duration,
          fees: params.fees,
          level: params.level,
          description: params.description,
          collegeLocation: params.collegeLocation,
        }

        const courseDescription = await generateCourseDescription(courseContext, true)
        if (!courseDescription) {
          return NextResponse.json({ error: "Failed to generate course description" }, { status: 500 })
        }

        return NextResponse.json({ description: courseDescription })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error in content enhancement API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    )
  }
}
