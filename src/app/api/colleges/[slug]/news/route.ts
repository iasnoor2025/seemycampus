import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeNews, colleges } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createNewsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(["admissions", "placements", "events", "achievements", "general"]),
  image: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(true),
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
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    const conditions = [
      eq(collegeNews.collegeId, college.id),
      eq(collegeNews.isPublished, true),
    ]

    if (category) {
      conditions.push(eq(collegeNews.category, category))
    }

    const news = await db
      .select()
      .from(collegeNews)
      .where(and(...conditions))
      .orderBy(desc(collegeNews.publishedAt))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({ count: collegeNews.id })
      .from(collegeNews)
      .where(and(...conditions))

    return NextResponse.json({
      news,
      pagination: {
        total: total.length,
        limit,
        offset,
        hasMore: offset + limit < total.length,
      },
    })
  } catch (error) {
    console.error("Error fetching college news:", error)
    return NextResponse.json(
      { error: "Failed to fetch college news" },
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
    const parsed = createNewsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [newNews] = await db
      .insert(collegeNews)
      .values({
        collegeId: college.id,
        author: parseInt((session.user as any).id),
        ...parsed.data,
      })
      .returning()

    return NextResponse.json({ news: newNews }, { status: 201 })
  } catch (error) {
    console.error("Error creating news:", error)
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    )
  }
}

