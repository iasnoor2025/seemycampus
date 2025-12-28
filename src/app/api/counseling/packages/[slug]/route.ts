import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { counselingPackages } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const [packageData] = await db
      .select()
      .from(counselingPackages)
      .where(eq(counselingPackages.slug, slug))
      .limit(1)

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ package: packageData })
  } catch (error: any) {
    console.error("Error fetching package:", error)
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()

    const [updatedPackage] = await db
      .update(counselingPackages)
      .set({
        ...body,
        price: body.price ? parseInt(body.price.toString()) : undefined,
        duration: body.duration ? parseInt(body.duration.toString()) : undefined,
        sessions: body.sessions ? parseInt(body.sessions.toString()) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(counselingPackages.slug, slug))
      .returning()

    if (!updatedPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ package: updatedPackage })
  } catch (error: any) {
    console.error("Error updating package:", error)
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    await db
      .update(counselingPackages)
      .set({ isActive: false })
      .where(eq(counselingPackages.slug, slug))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting package:", error)
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    )
  }
}

