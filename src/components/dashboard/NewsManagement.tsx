"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Loader2, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewsForm } from "./NewsForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NewsItem {
  id: number
  collegeId: number
  title: string
  content: string
  category: string
  image: string | null
  tags: string[]
  isPublished: boolean
  viewCount: number
  publishedAt: string
  college?: {
    name: string
    slug: string
  }
}

interface College {
  id: number
  name: string
  slug: string
}

export function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollege, setSelectedCollege] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [deletingNews, setDeletingNews] = useState<number | null>(null)
  const [currentCollege, setCurrentCollege] = useState<College | null>(null)

  useEffect(() => {
    fetchColleges()
  }, [])

  useEffect(() => {
    if (selectedCollege) {
      fetchNews()
    } else {
      setNews([])
    }
  }, [selectedCollege, categoryFilter])

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/dashboard/colleges?all=true")
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
      }
    } catch (error) {
      console.error("Error fetching colleges:", error)
    }
  }

  const fetchNews = async () => {
    if (!selectedCollege) return

    try {
      setLoading(true)
      const college = colleges.find((c) => c.id.toString() === selectedCollege)
      if (!college) return

      setCurrentCollege(college)
      const params = new URLSearchParams()
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter)
      }

      const response = await fetch(`/api/colleges/${college.slug}/news?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingNews) return

    try {
      const response = await fetch(`/api/news/${deletingNews}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchNews()
        setDeletingNews(null)
      }
    } catch (error) {
      console.error("Error deleting news:", error)
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

  const filteredNews = news.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">College News</h1>
          <p className="text-muted-foreground mt-1">
            Manage news and updates for colleges
          </p>
        </div>
        <Button onClick={() => {
          setEditingNews(null)
          setShowForm(true)
        }} disabled={!selectedCollege}>
          <Plus className="h-4 w-4 mr-2" />
          Add News
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="Select college">
                    {(value: string | null) => {
                      if (!value) return "Select college"
                      const college = colleges.find((c) => c.id.toString() === value)
                      return college?.name || "Select college"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category">
                    {(value: string | null) => {
                      if (!value || value === "all") return "All Categories"
                      const categoryLabels: Record<string, string> = {
                        admissions: "Admissions",
                        placements: "Placements",
                        events: "Events",
                        achievements: "Achievements",
                        general: "General",
                      }
                      return categoryLabels[value] || value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="admissions">Admissions</SelectItem>
                  <SelectItem value="placements">Placements</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !selectedCollege ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select a college to view news
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No news found matching your search" : "No news yet. Create one to get started."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          {!item.isPublished && (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.viewCount || 0} views
                          </div>
                          <span>
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNews(item)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingNews(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && currentCollege && (
        <NewsForm
          news={editingNews || undefined}
          collegeId={currentCollege.id}
          collegeSlug={currentCollege.slug}
          onClose={() => {
            setShowForm(false)
            setEditingNews(null)
          }}
          onSuccess={() => {
            fetchNews()
            setShowForm(false)
            setEditingNews(null)
          }}
        />
      )}

      <AlertDialog open={deletingNews !== null} onOpenChange={() => setDeletingNews(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the news item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

