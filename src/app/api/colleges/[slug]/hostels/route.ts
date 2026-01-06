import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeHostels, colleges } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createHostelSchema = z.object({
  hostelName: z.string().min(1),
  type: z.enum(["boys", "girls", "co-ed"]),
  capacity: z.number().int().optional().nullable(),
  fees: z.number().int().optional().nullable(),
  facilities: z.array(z.string()).optional().default([]),
  rules: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  metadata: z.record(z.any()).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get college by slug (only enabled colleges)
    const [college] = await db
      .select()
      .from(colleges)
      .where(and(
        eq(colleges.slug, slug),
        eq(colleges.isEnabled, true)
      ))
      .limit(1)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    const hostels = await db
      .select()
      .from(collegeHostels)
      .where(eq(collegeHostels.collegeId, college.id))
      .orderBy(collegeHostels.type, collegeHostels.hostelName)

    return NextResponse.json({ hostels })
  } catch (error) {
    console.error("Error fetching hostels:", error)
    return NextResponse.json(
      { error: "Failed to fetch hostels" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    // Get college by slug
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.slug, slug))
      .limit(1)

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = createHostelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [newHostel] = await db
      .insert(collegeHostels)
      .values({
        collegeId: college.id,
        ...parsed.data,
      })
      .returning()

    return NextResponse.json({ hostel: newHostel }, { status: 201 })
  } catch (error) {
    console.error("Error creating hostel:", error)
    return NextResponse.json(
      { error: "Failed to create hostel" },
      { status: 500 }
    )
  }
}

