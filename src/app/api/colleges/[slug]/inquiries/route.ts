import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeInquiries, colleges, users } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createInquirySchema = z.object({
  inquiryType: z.enum(["admission", "course", "fee", "scholarship", "general"]),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(10),
  metadata: z.record(z.any()).optional().nullable(),
})

export async function GET(
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const inquiryType = searchParams.get("inquiryType")

    const conditions = [eq(collegeInquiries.collegeId, college.id)]
    if (status) {
      conditions.push(eq(collegeInquiries.status, status))
    }
    if (inquiryType) {
      conditions.push(eq(collegeInquiries.inquiryType, inquiryType))
    }

    const inquiries = await db
      .select({
        inquiry: collegeInquiries,
        student: users,
        responder: users,
      })
      .from(collegeInquiries)
      .leftJoin(users, eq(collegeInquiries.studentId, users.id))
      .leftJoin(users, eq(collegeInquiries.respondedBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(collegeInquiries.createdAt))
      .limit(100)

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const session = await auth()
    const body = await request.json()
    const parsed = createInquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [newInquiry] = await db
      .insert(collegeInquiries)
      .values({
        collegeId: college.id,
        studentId: session?.user?.id ? parseInt((session.user as any).id) : null,
        ...parsed.data,
      })
      .returning()

    return NextResponse.json({ inquiry: newInquiry }, { status: 201 })
  } catch (error) {
    console.error("Error creating inquiry:", error)
    return NextResponse.json(
      { error: "Failed to create inquiry" },
      { status: 500 }
    )
  }
}

