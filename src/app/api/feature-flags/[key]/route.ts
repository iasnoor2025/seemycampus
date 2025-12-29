import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFeatureFlag, isFeatureEnabled } from "@/lib/featureFlags"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    // Public endpoint - anyone can check if a feature is enabled
    const enabled = await isFeatureEnabled(key)
    return NextResponse.json(
      { key, isEnabled: enabled },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error("Error checking feature flag:", error)
    return NextResponse.json(
      { error: "Failed to check feature flag" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  }
}

