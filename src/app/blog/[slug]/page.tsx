import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, User, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogList } from "@/components/blog/BlogList"
import { baseUrl, generateBreadcrumbList, generateBlogPostingStructuredData, generateHowToStructuredData, generateFAQStructuredData } from "@/lib/seo/generateMeta"
import { estimateReadingTime, optimizeImages, addHeadingIds, generateTableOfContents } from "@/lib/blog/contentOptimizer"
import Link from "next/link"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string) {
  try {
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.post
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Blog Post Not Found",
    }
  }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || post.title
  const keywords = post.tags && Array.isArray(post.tags) ? post.tags : []

  return {
    title,
    description: description.length > 160 ? description.substring(0, 157) + "..." : description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
      url: `${baseUrl}/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: post.authorName ? [post.authorName] : undefined,
      section: post.category || undefined,
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbList([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ])

  // Generate BlogPosting structured data
  const blogStructuredData = generateBlogPostingStructuredData(
    post.title,
    post.excerpt || post.title,
    post.authorName || "SeeMyCampus",
    post.publishedAt || post.createdAt || new Date().toISOString(),
    slug,
    post.updatedAt || undefined,
    post.featuredImage || undefined,
    post.category || undefined
  )

  // Check if content contains HowTo steps (look for numbered lists or step indicators)
  const hasHowToContent = /step\s+\d+|step\s+[1-9]|first|second|third|finally|next|then/i.test(post.content)
  
  // Extract FAQ from content if present (look for question patterns)
  const faqMatches = post.content.match(/<h[23]>(.*\?.*)<\/h[23]>/gi) || []
  const faqs: Array<{ question: string; answer: string }> = []
  if (faqMatches.length > 0) {
    // Simple extraction - can be enhanced
    faqMatches.slice(0, 5).forEach((match) => {
      const question = match.replace(/<[^>]+>/g, "").trim()
      if (question.includes("?")) {
        faqs.push({
          question,
          answer: `Find detailed information about ${question.toLowerCase()} in this comprehensive guide.`,
        })
      }
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
      {hasHowToContent && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateHowToStructuredData(
            post.title,
            post.excerpt || post.title,
            [
              { name: "Introduction", text: "Read the introduction section to understand the context." },
              { name: "Main Steps", text: "Follow the step-by-step instructions provided in the article." },
              { name: "Conclusion", text: "Review the conclusion for final tips and recommendations." },
            ]
          )) }}
        />
      )}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQStructuredData(faqs)) }}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Link href="/blog">
                <Button variant="ghost" className="gap-2 mb-6 text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>
              <div className="flex items-center gap-2 mb-4">
                {post.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {post.category}
                  </Badge>
                )}
                {post.tags && post.tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/30">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-white/90">
                {post.authorName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.authorName}</span>
                  </div>
                )}
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                )}
                {post.viewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.viewCount} views</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{estimateReadingTime(post.content)} min read</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <article className="bg-white rounded-xl shadow-xl border border-slate-200 p-8 md:p-12">

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Table of Contents */}
            {(() => {
              const toc = generateTableOfContents(post.content)
              if (toc.length > 0) {
                return (
                  <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
                    <ul className="space-y-2">
                      {toc.map((item, index) => (
                        <li key={index} className={`${item.level === 3 ? "ml-4" : item.level === 4 ? "ml-8" : ""}`}>
                          <a href={`#${item.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
              return null
            })()}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ 
                __html: addHeadingIds(optimizeImages(post.content))
              }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Related Posts */}
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Related Posts
              </h2>
              <p className="text-gray-600">Explore more articles on similar topics</p>
            </div>
            <BlogList category={post.category || undefined} limit={3} />
          </div>
        </div>
      </div>
    </>
  )
}

