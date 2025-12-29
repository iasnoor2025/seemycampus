import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { phoneVerifications } from "@/db/schema"
import { eq, and, desc, ilike } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    // Only admins can view OTP records
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const verified = searchParams.get("verified")
    const limit = parseInt(searchParams.get("limit") || "100")

    let query = db.select().from(phoneVerifications)

    const conditions = []
    
    if (phone) {
      conditions.push(ilike(phoneVerifications.phone, `%${phone}%`))
    }
    
    if (verified === "true") {
      conditions.push(eq(phoneVerifications.verified, true))
    } else if (verified === "false") {
      conditions.push(eq(phoneVerifications.verified, false))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    const otps = await query
      .orderBy(desc(phoneVerifications.createdAt))
      .limit(limit)

    return NextResponse.json({ otps })
  } catch (error) {
    console.error("Error fetching OTPs:", error)
    return NextResponse.json(
      { error: "Failed to fetch OTP records" },
      { status: 500 }
    )
  }
}

