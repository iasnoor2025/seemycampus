import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeFaculty, colleges } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createFacultySchema = z.object({
  name: z.string().min(1),
  designation: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  qualifications: z.string().optional().nullable(),
  experience: z.number().int().optional().nullable(),
  email: z.string().email().optional().nullable(),
  photo: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  achievements: z.array(z.string()).optional().default([]),
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
    const department = searchParams.get("department")

    const conditions = [eq(collegeFaculty.collegeId, college.id)]
    if (department) {
      conditions.push(eq(collegeFaculty.department, department))
    }

    const faculty = await db
      .select()
      .from(collegeFaculty)
      .where(and(...conditions))
      .orderBy(collegeFaculty.department, collegeFaculty.designation, collegeFaculty.name)

    return NextResponse.json({ faculty })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return NextResponse.json(
      { error: "Failed to fetch faculty" },
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
    const parsed = createFacultySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [newFaculty] = await db
      .insert(collegeFaculty)
      .values({
        collegeId: college.id,
        ...parsed.data,
      })
      .returning()

    return NextResponse.json({ faculty: newFaculty }, { status: 201 })
  } catch (error) {
    console.error("Error creating faculty:", error)
    return NextResponse.json(
      { error: "Failed to create faculty" },
      { status: 500 }
    )
  }
}

