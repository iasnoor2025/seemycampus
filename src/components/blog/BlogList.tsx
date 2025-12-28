"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, ArrowRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  authorName: string | null
  category: string | null
  tags: string[]
  featuredImage: string | null
  publishedAt: string | null
  viewCount: number
}

interface BlogListProps {
  category?: string
  limit?: number
  featured?: boolean
}

export function BlogList({ category, limit = 10, featured }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [category, featured])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let url = `/api/blog?limit=${limit}`
      if (category) url += `&category=${category}`
      if (featured) url += `&featured=true`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No blog posts found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow flex flex-col">
          {post.featuredImage && (
            <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="flex-1 flex flex-col p-6">
            <div className="flex items-center gap-2 mb-2">
              {post.category && (
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
              )}
              {post.tags && post.tags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {post.tags[0]}
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>

            {post.excerpt && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-4">
                {post.authorName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.authorName}</span>
                  </div>
                )}
                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                )}
              </div>
              {post.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.viewCount} views</span>
                </div>
              )}
            </div>

            <Link href={`/blog/${post.slug}`}>
              <Button variant="outline" className="w-full">
                Read More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

