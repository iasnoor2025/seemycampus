import { NextResponse } from "next/server"

interface InstagramPost {
  id: string
  media_url: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
}

/**
 * Instagram Feed API Route
 * 
 * This endpoint fetches the latest Instagram posts using Instagram Basic Display API or Graph API.
 * 
 * Required Environment Variables:
 * - INSTAGRAM_ACCESS_TOKEN: Long-lived access token from Instagram
 * - INSTAGRAM_USER_ID: Instagram User ID (for Graph API)
 * 
 * Setup Instructions:
 * 1. Go to https://developers.facebook.com/
 * 2. Create an app and add Instagram Basic Display or Instagram Graph API product
 * 3. Generate a long-lived access token
 * 4. Add the token and user ID to your .env file
 */
export async function GET() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const userId = process.env.INSTAGRAM_USER_ID

    // If no credentials, return empty array (component will show placeholder)
    if (!accessToken || !userId) {
      console.warn("Instagram credentials not configured. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env")
      return NextResponse.json({ posts: [] })
    }

    // Fetch from Instagram Graph API
    // Using fields: id, media_type, media_url, permalink, caption, timestamp, thumbnail_url
    const fields = "id,media_type,media_url,permalink,caption,timestamp,thumbnail_url"
    const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&access_token=${accessToken}&limit=12`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Instagram API error:", errorData)
      
      // Return empty array instead of error to prevent breaking the page
      return NextResponse.json({ posts: [] })
    }

    const data = await response.json()

    // Transform Instagram API response to our format
    const posts: InstagramPost[] = (data.data || []).map((post: any) => ({
      id: post.id,
      media_url: post.media_url || "",
      media_type: post.media_type || "IMAGE",
      permalink: post.permalink || "",
      caption: post.caption || "",
      timestamp: post.timestamp || "",
      thumbnail_url: post.thumbnail_url || undefined,
    }))

    // Sort by timestamp (newest first)
    posts.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    })

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error("Error fetching Instagram feed:", error)
    
    // Return empty array instead of error to prevent breaking the page
    return NextResponse.json({ posts: [] })
  }
}

