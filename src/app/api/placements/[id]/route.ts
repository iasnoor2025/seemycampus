import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { placementStats } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// PUT - Update placement stat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
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
    } = body

    const [updatedPlacement] = await db
      .update(placementStats)
      .set({
        year: year ? parseInt(year) : undefined,
        totalStudents: totalStudents !== undefined ? parseInt(totalStudents) : undefined,
        placedStudents: placedStudents !== undefined ? parseInt(placedStudents) : undefined,
        placementPercentage: placementPercentage !== undefined ? parseInt(placementPercentage) : undefined,
        averagePackage: averagePackage !== undefined ? parseInt(averagePackage) : undefined,
        medianPackage: medianPackage !== undefined ? parseInt(medianPackage) : undefined,
        highestPackage: highestPackage !== undefined ? parseInt(highestPackage) : undefined,
        lowestPackage: lowestPackage !== undefined ? parseInt(lowestPackage) : undefined,
        topRecruiters: topRecruiters !== undefined ? topRecruiters : undefined,
        departmentWiseData: departmentWiseData !== undefined ? departmentWiseData : undefined,
      })
      .where(eq(placementStats.id, parseInt(params.id)))
      .returning()

    if (!updatedPlacement) {
      return NextResponse.json(
        { error: "Placement not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ placement: updatedPlacement })
  } catch (error) {
    console.error("Error updating placement:", error)
    return NextResponse.json(
      { error: "Failed to update placement" },
      { status: 500 }
    )
  }
}

// DELETE - Delete placement stat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [deletedPlacement] = await db
      .delete(placementStats)
      .where(eq(placementStats.id, parseInt(params.id)))
      .returning()

    if (!deletedPlacement) {
      return NextResponse.json(
        { error: "Placement not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Placement deleted successfully" })
  } catch (error) {
    console.error("Error deleting placement:", error)
    return NextResponse.json(
      { error: "Failed to delete placement" },
      { status: 500 }
    )
  }
}

