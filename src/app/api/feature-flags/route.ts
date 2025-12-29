import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllFeatureFlags, updateFeatureFlag, initializeDefaultFeatureFlags } from "@/lib/featureFlags"

export async function GET() {
  try {
    const session = await auth()
    
    // Only admins can view feature flags
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const flags = await getAllFeatureFlags()
    return NextResponse.json({ flags })
  } catch (error) {
    console.error("Error fetching feature flags:", error)
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    // Only admins can update feature flags
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { key, isEnabled } = body

    if (typeof key !== "string" || typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body. Expected { key: string, isEnabled: boolean }" },
        { status: 400 }
      )
    }

    const updated = await updateFeatureFlag(key, isEnabled)
    return NextResponse.json({ flag: updated })
  } catch (error: any) {
    console.error("Error updating feature flag:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update feature flag" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Only admins can initialize feature flags
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initializeDefaultFeatureFlags()
    const flags = await getAllFeatureFlags()
    return NextResponse.json({ flags, message: "Feature flags initialized" })
  } catch (error) {
    console.error("Error initializing feature flags:", error)
    return NextResponse.json(
      { error: "Failed to initialize feature flags" },
      { status: 500 }
    )
  }
}

