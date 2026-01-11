import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateBlogPost, generateSEOTitles, suggestInternalLinks, expandBlogOutline, type BlogPostRequest } from "@/lib/ai/blogGenerator"

/**
 * POST /api/ai/blog/generate
 * Generate blog post using AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "generate":
        const postRequest: BlogPostRequest = {
          topic: params.topic,
          outline: params.outline,
          wordCount: params.wordCount || 1000,
          targetAudience: params.targetAudience,
          keywords: params.keywords,
          tone: params.tone || "informative",
        }

        const blogPost = await generateBlogPost(postRequest, true)
        if (!blogPost) {
          return NextResponse.json({ 
            error: "Failed to generate blog post. AI may be disabled, not configured, or the AI provider returned an error. Check AI settings and provider configuration." 
          }, { status: 500 })
        }

        return NextResponse.json({ blogPost })

      case "titles":
        if (!params.topic) {
          return NextResponse.json({ error: "Topic is required" }, { status: 400 })
        }

        const titles = await generateSEOTitles(params.topic, params.count || 5, true)
        return NextResponse.json({ titles })

      case "links":
        if (!params.content || !params.availableLinks) {
          return NextResponse.json({ error: "Content and availableLinks are required" }, { status: 400 })
        }

        const links = await suggestInternalLinks(params.content, params.availableLinks, true)
        return NextResponse.json({ links })

      case "expand":
        if (!params.outline || !params.topic) {
          return NextResponse.json({ error: "Outline and topic are required" }, { status: 400 })
        }

        const content = await expandBlogOutline(
          params.outline,
          params.topic,
          params.wordCount || 1000,
          true
        )

        if (!content) {
          return NextResponse.json({ error: "Failed to expand outline" }, { status: 500 })
        }

        return NextResponse.json({ content })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error in blog generation API:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      { 
        error: error.message || "Failed to process request",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
