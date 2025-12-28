import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, User, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlogList } from "@/components/blog/BlogList"
import { baseUrl, generateBreadcrumbList } from "@/lib/seo/generateMeta"
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

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.featuredImage ? [post.featuredImage] : [],
      url: `${baseUrl}/blog/${slug}`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Link href="/blog">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>

          <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {post.category && (
                  <Badge variant="secondary">{post.category}</Badge>
                )}
                {post.tags && post.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              </div>
            </header>

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

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
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
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <BlogList category={post.category || undefined} limit={3} />
          </div>
        </div>
      </div>
    </>
  )
}

