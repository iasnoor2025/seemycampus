import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeInfrastructure, colleges } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createInfrastructureSchema = z.object({
  facilityType: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
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

    const { searchParams } = new URL(request.url)
    const facilityType = searchParams.get("facilityType")

    const conditions = [eq(collegeInfrastructure.collegeId, college.id)]
    if (facilityType) {
      conditions.push(eq(collegeInfrastructure.facilityType, facilityType))
    }

    const infrastructure = await db
      .select()
      .from(collegeInfrastructure)
      .where(and(...conditions))
      .orderBy(collegeInfrastructure.facilityType, collegeInfrastructure.name)

    return NextResponse.json({ infrastructure })
  } catch (error) {
    console.error("Error fetching infrastructure:", error)
    return NextResponse.json(
      { error: "Failed to fetch infrastructure" },
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
    const parsed = createInfrastructureSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [newInfrastructure] = await db
      .insert(collegeInfrastructure)
      .values({
        collegeId: college.id,
        ...parsed.data,
      })
      .returning()

    return NextResponse.json({ infrastructure: newInfrastructure }, { status: 201 })
  } catch (error) {
    console.error("Error creating infrastructure:", error)
    return NextResponse.json(
      { error: "Failed to create infrastructure" },
      { status: 500 }
    )
  }
}

