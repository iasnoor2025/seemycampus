"use client"

import { useState, useEffect } from "react"
import { Instagram, Loader2 } from "lucide-react"
import Image from "next/image"

interface InstagramPost {
  id: string
  media_url: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInstagramPosts()
  }, [])

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/instagram/feed")
      
      if (!response.ok) {
        throw new Error("Failed to fetch Instagram posts")
      }

      const data = await response.json()
      
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts.slice(0, 6)) // Show latest 6 posts
      } else {
        setPosts([])
      }
    } catch (err: any) {
      console.error("Error fetching Instagram feed:", err)
      setError(err.message || "Unable to load Instagram feed")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
        <Image
          src="/guidance-placeholder.png"
          alt="Student working on laptop - Guidance placeholder"
          fill
          className="object-cover opacity-50"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-white animate-spin" />
            <p className="text-sm text-white">Loading Instagram feed...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || posts.length === 0) {
    return (
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
        <Image
          src="/guidance-placeholder.png"
          alt="Student working on laptop - Guidance placeholder"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {/* Optional overlay with Instagram icon */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <Instagram className="h-5 w-5 text-[#E4405F]" />
          <span className="text-sm font-semibold text-gray-900">@seemycampus</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-white">
      {/* Instagram Posts Grid */}
      <div className="grid grid-cols-3 gap-1 h-full">
        {posts.map((post, index) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group overflow-hidden bg-gray-100"
          >
            {/* Post Image/Video */}
            {post.media_type === "VIDEO" && post.thumbnail_url ? (
              <Image
                src={post.thumbnail_url}
                alt={post.caption || "Instagram post"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            ) : (
              <Image
                src={post.media_url}
                alt={post.caption || "Instagram post"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            )}

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <Instagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Video Icon for Videos */}
            {post.media_type === "VIDEO" && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                <svg
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            )}

            {/* Carousel Indicator */}
            {post.media_type === "CAROUSEL_ALBUM" && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </div>
            )}
          </a>
        ))}
      </div>

      {/* Instagram Branding */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
        <Instagram className="h-5 w-5 text-[#E4405F]" />
        <span className="text-sm font-semibold text-gray-900">@seemycampus</span>
      </div>
    </div>
  )
}

