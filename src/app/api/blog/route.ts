import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { blogPosts } from "@/db/schema"
import { eq, and, desc, like, or } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const featured = searchParams.get("featured") === "true"
    const published = searchParams.get("published") !== "false" // Default to published only
    const limit = parseInt(searchParams.get("limit") || "100")
    const search = searchParams.get("search")

    // Build where conditions
    const conditions = []

    if (published) {
      conditions.push(eq(blogPosts.isPublished, true))
    }

    if (category) {
      conditions.push(eq(blogPosts.category, category))
    }

    if (featured) {
      conditions.push(eq(blogPosts.isFeatured, true))
    }

    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.excerpt, `%${search}%`)
        )!
      )
    }

    const baseQuery = db.select().from(blogPosts)
    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery

    let posts = await query.orderBy(desc(blogPosts.publishedAt || blogPosts.createdAt)).limit(limit)

    // Filter by tag if provided (since tags is JSONB, we filter in memory)
    if (tag) {
      posts = posts.filter((post) => post.tags && post.tags.includes(tag))
    }

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      authorName,
      category = "blog",
      tags = [],
      featuredImage,
      seoTitle,
      seoDescription,
      publishedAt,
      isPublished = false,
      isFeatured = false,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      )
    }

    const authorId = session.user?.id ? parseInt(session.user.id) : null

    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title,
        slug,
        excerpt,
        content,
        authorId: authorId || undefined,
        authorName: authorName || session.user?.name || "Admin",
        category,
        tags,
        featuredImage,
        seoTitle: seoTitle || title,
        seoDescription,
        publishedAt: publishedAt ? new Date(publishedAt) : isPublished ? new Date() : null,
        isPublished,
        isFeatured,
      })
      .returning()

    return NextResponse.json({ post: newPost }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating blog post:", error)
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    )
  }
}

