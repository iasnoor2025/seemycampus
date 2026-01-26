import { NextResponse } from "next/server"
import { db } from "@/db"
import { featureFlags } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const flags = await db.select().from(featureFlags)
    
    // Group flags by category
    const groupedFlags = flags.reduce((acc, flag) => {
      if (!acc[flag.category]) {
        acc[flag.category] = []
      }
      acc[flag.category].push(flag)
      return acc
    }, {} as Record<string, typeof flags>)

    return NextResponse.json({
      success: true,
      flags: groupedFlags,
      allFlags: flags,
    })
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { key, isEnabled } = body

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      )
    }

    const [updated] = await db
      .update(featureFlags)
      .set({ 
        isEnabled,
        updatedAt: new Date(),
      })
      .where(eq(featureFlags.key, key))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: "Feature flag not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      flag: updated,
      message: `Feature "${updated.name}" ${isEnabled ? "enabled" : "disabled"} successfully`,
    })
  } catch (error) {
    console.error("Error updating feature flag:", error)
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 }
    )
  }
}