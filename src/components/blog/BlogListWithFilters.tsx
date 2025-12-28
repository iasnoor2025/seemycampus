"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, ArrowRight, Loader2, Search, Filter } from "lucide-react"
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
  isFeatured?: boolean
}

export function BlogListWithFilters() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("")

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [searchTerm, selectedCategory, selectedTag, allPosts])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blog?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setAllPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...allPosts]

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(
        (post) => post.tags && post.tags.includes(selectedTag)
      )
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(term))
      )
    }

    setFilteredPosts(filtered)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  // Get unique categories and tags
  const categories = Array.from(new Set(allPosts.map((p) => p.category).filter(Boolean)))
  const allTags = allPosts.flatMap((p) => p.tags || [])
  const uniqueTags = Array.from(new Set(allTags))

  // Separate featured and regular posts
  const featuredPosts = filteredPosts
    .filter((post) => post.isFeatured === true)
    .slice(0, 3)

  const regularPosts = filteredPosts.filter(
    (post) => !featuredPosts.find((fp) => fp.id === post.id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category || "all")}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Tag Filters */}
            {uniqueTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {uniqueTags.slice(0, 10).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {uniqueTags.length > 10 && (
                  <span className="text-sm text-muted-foreground">
                    +{uniqueTags.length - 10} more
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory !== "all" || selectedTag || searchTerm
              ? `Filtered Posts (${filteredPosts.length})`
              : "All Posts"}
          </h2>
          {(selectedCategory !== "all" || selectedTag || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("all")
                setSelectedTag("")
                setSearchTerm("")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts found matching your filters.
              </p>
              {(selectedCategory !== "all" || selectedTag || searchTerm) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSelectedTag("")
                    setSearchTerm("")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BlogPostCard({
  post,
  formatDate,
}: {
  post: BlogPost
  formatDate: (date: string | null) => string
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
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
  )
}

