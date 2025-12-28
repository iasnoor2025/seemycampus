"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface BlogPost {
  id?: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string | null
  tags: string[]
  featuredImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  isPublished: boolean
  isFeatured: boolean
}

interface BlogPostFormProps {
  post: BlogPost | null
  onClose: () => void
}

export function BlogPostForm({ post, onClose }: BlogPostFormProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: null,
    content: "",
    category: "blog",
    tags: [],
    featuredImage: null,
    seoTitle: null,
    seoDescription: null,
    publishedAt: null,
    isPublished: false,
    isFeatured: false,
  })
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : null,
      })
    }
  }, [post])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
      seoTitle: formData.seoTitle || title,
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.title || !formData.slug || !formData.content) {
      setError("Title, slug, and content are required")
      setLoading(false)
      return
    }

    try {
      const url = post?.id ? `/api/blog/${post.slug}` : "/api/blog"
      const method = post?.id ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save blog post")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save blog post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{post ? "Edit Blog Post" : "New Blog Post"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || "blog"}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="tip">Tip</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                type="url"
                value={formData.featuredImage || ""}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value || null })}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                rows={3}
                value={formData.excerpt || ""}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value || null })}
                placeholder="Short description for listings..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                rows={15}
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Enter blog content (HTML supported)..."
                className="font-mono text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle || ""}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value || null })}
                placeholder="Leave empty to use post title"
              />
            </div>

            <div>
              <Label htmlFor="publishedAt">Publish Date</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={formData.publishedAt || ""}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value || null })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                rows={2}
                value={formData.seoDescription || ""}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value || null })}
                placeholder="Meta description for SEO..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked as boolean })
                }
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked as boolean })
                }
              />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : post ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

