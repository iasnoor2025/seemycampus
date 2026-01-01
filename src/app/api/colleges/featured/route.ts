import { NextResponse } from "next/server"
import { getAllColleges } from "@/lib/colleges"
import { db } from "@/db"
import { courses } from "@/db/schema"
import { eq, or, ilike } from "drizzle-orm"

// Helper function to determine college category from name and description
function getCollegeCategory(college: { name: string; description?: string | null }): string[] {
  const name = (college.name || "").toLowerCase()
  const description = (college.description || "").toLowerCase()
  const combined = `${name} ${description}`

  const categories: string[] = []

  // Management/BBA colleges
  if (
    combined.includes("iim") ||
    combined.includes("management") ||
    combined.includes("business") ||
    combined.includes("mba") ||
    combined.includes("pgdm") ||
    combined.includes("bba") ||
    name.includes("business school")
  ) {
    if (combined.includes("bba") || name.includes("bba")) {
      categories.push("bba")
    } else {
      categories.push("management")
    }
  }

  // Engineering colleges
  if (
    combined.includes("iit") ||
    combined.includes("nit") ||
    combined.includes("engineering") ||
    combined.includes("technology") ||
    combined.includes("tech") ||
    name.includes("institute of technology")
  ) {
    categories.push("engineering")
  }

  // Medical colleges
  if (
    combined.includes("aiims") ||
    combined.includes("medical") ||
    combined.includes("mbbs") ||
    combined.includes("hospital") ||
    combined.includes("medicine") ||
    name.includes("medical college") ||
    name.includes("medical university")
  ) {
    categories.push("medical")
  }

  // Law colleges
  if (
    combined.includes("law") ||
    combined.includes("legal") ||
    combined.includes("nlu") ||
    combined.includes("nlsiu") ||
    combined.includes("nalsar") ||
    name.includes("law school") ||
    name.includes("law university")
  ) {
    categories.push("law")
  }

  // Design colleges
  if (
    combined.includes("design") ||
    combined.includes("nid") ||
    combined.includes("nift") ||
    combined.includes("fashion") ||
    name.includes("institute of design") ||
    name.includes("design school")
  ) {
    categories.push("design")
  }

  return categories
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "management"

    // Get all colleges
    const allColleges = await getAllColleges()

    // For BBA category, get colleges that have BBA courses
    let bbaCollegeIds: Set<number> = new Set()
    if (category === "bba") {
      const bbaCourses = await db
        .selectDistinct({ collegeId: courses.collegeId })
        .from(courses)
        .where(
          or(
            ilike(courses.name, "%bba%"),
            ilike(courses.name, "%bbm%")
          )!
        )
      
      bbaCollegeIds = new Set(bbaCourses.map(c => c.collegeId))
    }

    // Filter colleges by category
    const filteredColleges = allColleges
      .map((college) => {
        const categories = getCollegeCategory(college)
        return {
          ...college,
          categories,
        }
      })
      .filter((college) => {
        // For BBA category, check if college has BBA courses OR matches name/description
        if (category === "bba") {
          return bbaCollegeIds.has(college.id) || college.categories.includes("bba")
        }
        // Handle bba as part of management for display
        if (category === "management") {
          return college.categories.includes("management") || college.categories.includes("bba")
        }
        return college.categories.includes(category)
      })
      .slice(0, 20) // Limit to 20 colleges per category

    return NextResponse.json({
      colleges: filteredColleges,
      count: filteredColleges.length,
    })
  } catch (error) {
    console.error("Error fetching featured colleges:", error)
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    )
  }
}

