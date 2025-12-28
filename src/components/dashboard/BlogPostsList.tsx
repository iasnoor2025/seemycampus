"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Edit, Trash2, Eye, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BlogPostForm } from "./BlogPostForm"
import { format } from "date-fns"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string | null
  tags: string[]
  featuredImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  authorName: string | null
  isPublished: boolean
  isFeatured: boolean
  publishedAt: string | null
  viewCount: number
  createdAt: string
}

export function BlogPostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blog?published=false&limit=1000")
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

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error("Error deleting blog post:", error)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPost(null)
    fetchPosts()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog Posts</h1>
          <p className="text-muted-foreground">Manage blog articles, tips, and guides</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {showForm && (
        <BlogPostForm post={editingPost} onClose={handleCloseForm} />
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No posts found matching your search." : "No blog posts found. Create your first post!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-muted-foreground">{post.slug}</div>
                    </TableCell>
                    <TableCell>
                      {post.category && (
                        <Badge variant="secondary">{post.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{post.authorName || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {post.isPublished ? (
                          <Badge variant="default" className="w-fit">Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">Draft</Badge>
                        )}
                        {post.isFeatured && (
                          <Badge variant="outline" className="w-fit text-xs">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(post.publishedAt)}</TableCell>
                    <TableCell>{post.viewCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.slug)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        {post.isPublished && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

