import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { collegeNews } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { z } from "zod"

const updateNewsSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(["admissions", "placements", "events", "achievements", "general"]).optional(),
  image: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  metadata: z.record(z.any()).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json({ error: "Invalid news ID" }, { status: 400 })
    }

    const [news] = await db
      .select()
      .from(collegeNews)
      .where(eq(collegeNews.id, newsId))
      .limit(1)

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    // Increment view count
    await db
      .update(collegeNews)
      .set({ viewCount: (news.viewCount || 0) + 1 })
      .where(eq(collegeNews.id, newsId))

    return NextResponse.json({ news: { ...news, viewCount: (news.viewCount || 0) + 1 } })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json({ error: "Invalid news ID" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateNewsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const [updatedNews] = await db
      .update(collegeNews)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(collegeNews.id, newsId))
      .returning()

    if (!updatedNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    return NextResponse.json({ news: updatedNews })
  } catch (error) {
    console.error("Error updating news:", error)
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json({ error: "Invalid news ID" }, { status: 400 })
    }

    await db.delete(collegeNews).where(eq(collegeNews.id, newsId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting news:", error)
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    )
  }
}

