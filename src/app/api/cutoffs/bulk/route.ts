import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { cutoffs, colleges } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// POST - Bulk import cutoffs from CSV/JSON
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
    const { cutoffs: cutoffData } = body

    if (!Array.isArray(cutoffData) || cutoffData.length === 0) {
      return NextResponse.json(
        { error: "Invalid cutoff data. Expected an array of cutoff objects." },
        { status: 400 }
      )
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
    }

    for (const cutoff of cutoffData) {
      try {
        const {
          collegeId,
          collegeSlug, // Alternative: can use slug to find college
          examName,
          courseName,
          year,
          category,
          openingRank,
          closingRank,
          openingScore,
          closingScore,
          round,
          quota,
        } = cutoff

        if (!examName || !year) {
          results.errors.push({
            data: cutoff,
            error: "Missing required fields: examName, year",
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
              data: cutoff,
              error: `College not found with slug: ${collegeSlug}`,
            })
            continue
          }
        }

        if (!finalCollegeId) {
          results.errors.push({
            data: cutoff,
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
            data: cutoff,
            error: `College not found with ID: ${finalCollegeId}`,
          })
          continue
        }

        const [newCutoff] = await db
          .insert(cutoffs)
          .values({
            collegeId: finalCollegeId,
            examName,
            courseName: courseName || null,
            year: parseInt(year),
            category: category || null,
            openingRank: openingRank ? parseInt(openingRank) : null,
            closingRank: closingRank ? parseInt(closingRank) : null,
            openingScore: openingScore ? parseInt(openingScore) : null,
            closingScore: closingScore ? parseInt(closingScore) : null,
            round: round ? parseInt(round) : 1,
            quota: quota || null,
          })
          .returning()

        results.success.push(newCutoff)
      } catch (error: any) {
        results.errors.push({
          data: cutoff,
          error: error.message || "Unknown error",
        })
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success.length} cutoffs${results.errors.length > 0 ? `, ${results.errors.length} errors` : ""}`,
      success: results.success.length,
      errors: results.errors.length,
      details: results,
    })
  } catch (error) {
    console.error("Error bulk importing cutoffs:", error)
    return NextResponse.json(
      { error: "Failed to bulk import cutoffs" },
      { status: 500 }
    )
  }
}

