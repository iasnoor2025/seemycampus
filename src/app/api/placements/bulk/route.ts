import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { placementStats, colleges } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// POST - Bulk import placements from CSV/JSON
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { placements: placementData } = body

    if (!Array.isArray(placementData) || placementData.length === 0) {
      return NextResponse.json(
        { error: "Invalid placement data. Expected an array of placement objects." },
        { status: 400 }
      )
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
    }

    for (const placement of placementData) {
      try {
        const {
          collegeId,
          collegeSlug,
          year,
          totalStudents,
          placedStudents,
          placementPercentage,
          averagePackage,
          medianPackage,
          highestPackage,
          lowestPackage,
          topRecruiters,
          departmentWiseData,
        } = placement

        if (!year) {
          results.errors.push({
            data: placement,
            error: "Missing required field: year",
          })
          continue
        }

        let finalCollegeId = collegeId

        // If collegeSlug is provided, find college by slug
        if (!finalCollegeId && collegeSlug) {
          const [college] = await db
            .select({ id: colleges.id })
            .from(colleges)
            .where(eq(colleges.slug, collegeSlug))
            .limit(1)

          if (college) {
            finalCollegeId = college.id
          } else {
            results.errors.push({
              data: placement,
              error: `College not found with slug: ${collegeSlug}`,
            })
            continue
          }
        }

        if (!finalCollegeId) {
          results.errors.push({
            data: placement,
            error: "Missing collegeId or collegeSlug",
          })
          continue
        }

        // Verify college exists
        const [college] = await db
          .select()
          .from(colleges)
          .where(eq(colleges.id, finalCollegeId))
          .limit(1)

        if (!college) {
          results.errors.push({
            data: placement,
            error: `College not found with ID: ${finalCollegeId}`,
          })
          continue
        }

        const [newPlacement] = await db
          .insert(placementStats)
          .values({
            collegeId: finalCollegeId,
            year: parseInt(year),
            totalStudents: totalStudents ? parseInt(totalStudents) : null,
            placedStudents: placedStudents ? parseInt(placedStudents) : null,
            placementPercentage: placementPercentage ? parseInt(placementPercentage) : null,
            averagePackage: averagePackage ? parseInt(averagePackage) : null,
            medianPackage: medianPackage ? parseInt(medianPackage) : null,
            highestPackage: highestPackage ? parseInt(highestPackage) : null,
            lowestPackage: lowestPackage ? parseInt(lowestPackage) : null,
            topRecruiters: Array.isArray(topRecruiters) ? topRecruiters : [],
            departmentWiseData: departmentWiseData || {},
          })
          .returning()

        results.success.push(newPlacement)
      } catch (error: any) {
        results.errors.push({
          data: placement,
          error: error.message || "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success.length} placements${results.errors.length > 0 ? `, ${results.errors.length} errors` : ""}`,
      success: results.success.length,
      errors: results.errors.length,
      details: results,
    })
  } catch (error) {
    console.error("Error bulk importing placements:", error)
    return NextResponse.json(
      { error: "Failed to bulk import placements" },
      { status: 500 }
    )
  }
}

