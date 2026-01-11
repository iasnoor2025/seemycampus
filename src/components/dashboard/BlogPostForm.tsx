"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Loader2, Wand2, Link2, FileText, List } from "lucide-react"
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
import { optimizeMetaDescription } from "@/lib/blog/contentOptimizer"
import { BlogSEOHelper } from "@/components/blog/BlogSEOHelper"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const { toast } = useToast()
  
  // AI Generation states
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiTopic, setAiTopic] = useState("")
  const [aiWordCount, setAiWordCount] = useState(1000)
  const [aiTone, setAiTone] = useState<"professional" | "casual" | "informative">("informative")
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([])
  const [suggestedLinks, setSuggestedLinks] = useState<Array<{ keyword: string; url: string; title: string; relevance: number }>>([])

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
    const optimizedSlug = generateSlug(title)
    setFormData({
      ...formData,
      title,
      slug: formData.slug || optimizedSlug,
      seoTitle: formData.seoTitle || title,
      seoDescription: formData.seoDescription || (formData.excerpt ? optimizeMetaDescription(formData.excerpt) : null),
    })
  }
  
  const handleExcerptChange = (excerpt: string) => {
    setFormData({
      ...formData,
      excerpt,
      seoDescription: formData.seoDescription || optimizeMetaDescription(excerpt || formData.content || ""),
    })
  }
  
  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
      seoDescription: formData.seoDescription || optimizeMetaDescription(formData.excerpt || content),
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

  // AI Generation Functions
  const handleGenerateBlogPost = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      })
      return
    }

    setAiGenerating(true)
    try {
      const response = await fetch("/api/ai/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          topic: aiTopic,
          wordCount: aiWordCount,
          tone: aiTone,
          keywords: formData.tags || [],
          targetAudience: "Indian students seeking college admission guidance",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate blog post (${response.status})`)
      }

      const data = await response.json()
      const blogPost = data.blogPost

      if (blogPost) {
        setFormData({
          ...formData,
          title: blogPost.title || formData.title,
          slug: formData.slug || generateSlug(blogPost.title || aiTopic),
          excerpt: blogPost.excerpt || formData.excerpt,
          content: blogPost.content || formData.content,
          seoTitle: blogPost.seoTitle || formData.seoTitle,
          seoDescription: blogPost.seoDescription || formData.seoDescription,
          tags: blogPost.tags && blogPost.tags.length > 0 ? blogPost.tags : formData.tags,
        })

        toast({
          title: "Success",
          description: "Blog post generated successfully! Review and edit as needed.",
        })
      }
    } catch (error: any) {
      console.error("Error generating blog post:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate blog post. AI may be disabled or not configured.",
        variant: "destructive",
      })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleGenerateTitles = async () => {
    const topic = aiTopic || formData.title || ""
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or title",
        variant: "destructive",
      })
      return
    }

    setAiGenerating(true)
    try {
      const response = await fetch("/api/ai/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "titles",
          topic,
          count: 5,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate titles (${response.status})`)
      }

      const data = await response.json()
      if (data.titles && data.titles.length > 0) {
        setGeneratedTitles(data.titles)
        toast({
          title: "Success",
          description: `Generated ${data.titles.length} SEO-optimized titles`,
        })
      }
    } catch (error: any) {
      console.error("Error generating titles:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate titles. AI may be disabled or not configured.",
        variant: "destructive",
      })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSuggestLinks = async () => {
    if (!formData.content || formData.content.length < 100) {
      toast({
        title: "Error",
        description: "Please add some content first (at least 100 characters)",
        variant: "destructive",
      })
      return
    }

    setAiGenerating(true)
    try {
      // Get available links (colleges, courses, etc.)
      // For now, we'll use a simplified approach
      const availableLinks: Array<{ keyword: string; url: string; title: string }> = [
        { keyword: "colleges", url: "/colleges", title: "Browse Colleges" },
        { keyword: "admission", url: "/admission-predictor", title: "Admission Predictor" },
        { keyword: "scholarships", url: "/scholarships", title: "Scholarships" },
        { keyword: "courses", url: "/courses", title: "Browse Courses" },
        { keyword: "entrance exams", url: "/entrance-exams", title: "Entrance Exams" },
      ]

      const response = await fetch("/api/ai/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "links",
          content: formData.content,
          availableLinks,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to suggest links (${response.status})`)
      }

      const data = await response.json()
      if (data.links && data.links.length > 0) {
        setSuggestedLinks(data.links)
        toast({
          title: "Success",
          description: `Found ${data.links.length} relevant internal links`,
        })
      }
    } catch (error: any) {
      console.error("Error suggesting links:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to suggest links. AI may be disabled or not configured.",
        variant: "destructive",
      })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleExpandOutline = async () => {
    if (!formData.content || formData.content.length < 50) {
      toast({
        title: "Error",
        description: "Please add an outline or some content first",
        variant: "destructive",
      })
      return
    }

    // Extract outline from content (lines starting with numbers or bullets)
    const lines = formData.content.split("\n").filter(line => {
      const trimmed = line.trim()
      return /^(\d+\.|[-*]|\#)/.test(trimmed) && trimmed.length > 10
    })

    if (lines.length === 0) {
      toast({
        title: "Error",
        description: "No outline found. Add numbered or bulleted points to expand.",
        variant: "destructive",
      })
      return
    }

    setAiGenerating(true)
    try {
      const response = await fetch("/api/ai/blog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "expand",
          outline: lines,
          topic: formData.title || aiTopic || "Blog Post",
          wordCount: aiWordCount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to expand outline (${response.status})`)
      }

      const data = await response.json()
      if (data.content) {
        setFormData({
          ...formData,
          content: data.content,
        })
        toast({
          title: "Success",
          description: "Outline expanded into full content",
        })
      }
    } catch (error: any) {
      console.error("Error expanding outline:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to expand outline. AI may be disabled or not configured.",
        variant: "destructive",
      })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleUseTitle = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
      seoTitle: formData.seoTitle || title,
    })
    setGeneratedTitles([])
    toast({
      title: "Title Applied",
      description: "Title has been applied to the form",
    })
  }

  const handleInsertLink = (link: { keyword: string; url: string; title: string }) => {
    const linkMarkdown = `[${link.title}](${link.url})`
    const currentContent = formData.content || ""
    const keywordIndex = currentContent.toLowerCase().indexOf(link.keyword.toLowerCase())
    
    if (keywordIndex !== -1) {
      // Insert link at keyword location
      const before = currentContent.substring(0, keywordIndex)
      const keyword = currentContent.substring(keywordIndex, keywordIndex + link.keyword.length)
      const after = currentContent.substring(keywordIndex + link.keyword.length)
      const newContent = `${before}[${keyword}](${link.url})${after}`
      
      setFormData({
        ...formData,
        content: newContent,
      })
    } else {
      // Append link at the end
      setFormData({
        ...formData,
        content: `${currentContent}\n\n${linkMarkdown}`,
      })
    }
    
    toast({
      title: "Link Inserted",
      description: `Link to ${link.title} has been added`,
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

          {/* AI Generation Panel */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">AI Content Generation</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                >
                  {showAIPanel ? "Hide" : "Show"} AI Tools
                </Button>
              </div>
              <CardDescription>
                Use AI to generate blog content, titles, and suggestions
              </CardDescription>
            </CardHeader>
            {showAIPanel && (
              <CardContent className="space-y-4">
                <Tabs defaultValue="generate" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                    <TabsTrigger value="titles">Titles</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="expand">Expand</TabsTrigger>
                  </TabsList>

                  <TabsContent value="generate" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ai-topic">Topic / Subject</Label>
                        <Input
                          id="ai-topic"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="e.g., How to Choose the Right Engineering College"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="ai-word-count">Word Count</Label>
                          <Input
                            id="ai-word-count"
                            type="number"
                            value={aiWordCount}
                            onChange={(e) => setAiWordCount(parseInt(e.target.value) || 1000)}
                            min={500}
                            max={5000}
                            step={100}
                          />
                        </div>
                        <div>
                          <Label htmlFor="ai-tone">Tone</Label>
                          <Select value={aiTone} onValueChange={(v: any) => setAiTone(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="informative">Informative</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateBlogPost}
                        disabled={aiGenerating || !aiTopic.trim()}
                        className="w-full"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate Complete Blog Post
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        This will generate a complete blog post with title, excerpt, content, SEO fields, and tags.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="titles" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="title-topic">Topic for Titles</Label>
                        <Input
                          id="title-topic"
                          value={aiTopic || formData.title || ""}
                          onChange={(e) => {
                            if (!formData.title) setAiTopic(e.target.value)
                            else setFormData({ ...formData, title: e.target.value })
                          }}
                          placeholder="Enter topic or current title"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateTitles}
                        disabled={aiGenerating || (!aiTopic && !formData.title)}
                        className="w-full"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate SEO Titles
                          </>
                        )}
                      </Button>
                      {generatedTitles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Generated Titles (Click to Use):</Label>
                          {generatedTitles.map((title, idx) => (
                            <div
                              key={idx}
                              className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleUseTitle(title)}
                            >
                              <p className="text-sm font-medium">{title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {title.length} characters
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="links" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Analyze your content and suggest relevant internal links to improve SEO.
                      </p>
                      <Button
                        type="button"
                        onClick={handleSuggestLinks}
                        disabled={aiGenerating || !formData.content || formData.content.length < 100}
                        className="w-full"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Link2 className="mr-2 h-4 w-4" />
                            Suggest Internal Links
                          </>
                        )}
                      </Button>
                      {suggestedLinks.length > 0 && (
                        <div className="space-y-2">
                          <Label>Suggested Links (Click to Insert):</Label>
                          {suggestedLinks.map((link, idx) => (
                            <div
                              key={idx}
                              className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleInsertLink(link)}
                            >
                              <p className="text-sm font-medium">{link.title}</p>
                              <p className="text-xs text-muted-foreground">{link.url}</p>
                              <p className="text-xs text-blue-600 mt-1">
                                Relevance: {Math.round(link.relevance * 100)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="expand" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Expand an outline (numbered or bulleted list) into full blog content.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expand-word-count">Target Word Count</Label>
                          <Input
                            id="expand-word-count"
                            type="number"
                            value={aiWordCount}
                            onChange={(e) => setAiWordCount(parseInt(e.target.value) || 1000)}
                            min={500}
                            max={5000}
                            step={100}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleExpandOutline}
                        disabled={aiGenerating || !formData.content || formData.content.length < 50}
                        className="w-full"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Expanding...
                          </>
                        ) : (
                          <>
                            <List className="mr-2 h-4 w-4" />
                            Expand Outline to Full Content
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Make sure your content has an outline (numbered or bulleted points) to expand.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>

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
                onChange={(e) => handleExcerptChange(e.target.value)}
                placeholder="Short description for listings..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                rows={15}
                value={formData.content || ""}
                onChange={(e) => handleContentChange(e.target.value)}
                required
                placeholder="Enter blog content (HTML supported)..."
                className="font-mono text-sm"
              />
            </div>
            
            {/* SEO Helper */}
            {formData.title && formData.content && (
              <div className="md:col-span-2">
                <BlogSEOHelper
                  title={formData.title}
                  content={formData.content}
                  excerpt={formData.excerpt || ""}
                  category={formData.category || undefined}
                  tags={formData.tags || []}
                />
              </div>
            )}

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

