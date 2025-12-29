"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Eye, Loader2, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface NewsItem {
  id: number
  collegeId: number
  title: string
  content: string
  category: string
  image: string | null
  tags: string[]
  publishedAt: string
  viewCount: number
}

interface CollegeNewsProps {
  collegeSlug: string
}

const categories = [
  { value: "all", label: "All News" },
  { value: "admissions", label: "Admissions" },
  { value: "placements", label: "Placements" },
  { value: "events", label: "Events" },
  { value: "achievements", label: "Achievements" },
  { value: "general", label: "General" },
]

export function CollegeNews({ collegeSlug }: CollegeNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [collegeSlug, selectedCategory, page])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory)
      }
      params.set("limit", "6")
      params.set("offset", ((page - 1) * 6).toString())

      const response = await fetch(`/api/colleges/${collegeSlug}/news?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setNews(data.news || [])
        } else {
          setNews((prev) => [...prev, ...(data.news || [])])
        }
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      admissions: "bg-blue-100 text-blue-800",
      placements: "bg-green-100 text-green-800",
      events: "bg-purple-100 text-purple-800",
      achievements: "bg-yellow-100 text-yellow-800",
      general: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors.general
  }

  if (loading && news.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading news...</span>
        </CardContent>
      </Card>
    )
  }

  if (news.length === 0 && !loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>College News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No news available at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-2xl">College News & Updates</CardTitle>
        <CardDescription>Stay updated with the latest news and announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs md:text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {item.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {item.viewCount || 0}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {item.content.substring(0, 150)}...
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Link href={`/colleges/${collegeSlug}/news/${item.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

