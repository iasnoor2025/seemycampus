import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { applicationGuides, colleges, courses } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createGuideSchema = z.object({
  courseId: z.number().int().optional().nullable(),
  guideContent: z.string().min(1),
  requiredDocs: z.array(z.string()).optional().default([]),
  feeInfo: z.record(z.any()).optional().nullable(),
  deadlines: z.record(z.any()).optional().nullable(),
  tips: z.string().optional().nullable(),
  applicationUrl: z.string().url().optional().nullable(),
  contactInfo: z.record(z.any()).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    const conditions = [eq(applicationGuides.collegeId, college.id)]
    if (courseId) {
      conditions.push(eq(applicationGuides.courseId, parseInt(courseId)))
    }

    const guides = await db
      .select({
        guide: applicationGuides,
        course: courses,
      })
      .from(applicationGuides)
      .leftJoin(courses, eq(applicationGuides.courseId, courses.id))
      .where(and(...conditions))
      .orderBy(applicationGuides.createdAt)

    return NextResponse.json({ guides })
  } catch (error) {
    console.error("Error fetching application guides:", error)
    return NextResponse.json(
      { error: "Failed to fetch application guides" },
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
    const parsed = createGuideSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [newGuide] = await db
      .insert(applicationGuides)
      .values({
        collegeId: college.id,
        ...parsed.data,
      })
      .returning()

    return NextResponse.json({ guide: newGuide }, { status: 201 })
  } catch (error) {
    console.error("Error creating application guide:", error)
    return NextResponse.json(
      { error: "Failed to create application guide" },
      { status: 500 }
    )
  }
}

