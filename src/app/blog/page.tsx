import { Metadata } from "next"
import { BlogList } from "@/components/blog/BlogList"

export const metadata: Metadata = {
  title: "Blog | SeeMyCampus",
  description: "Read our latest articles, tips, and guides about college admissions, career guidance, and education.",
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-lg text-gray-600">
            Read our latest articles, tips, and guides about college admissions, career guidance,
            and education.
          </p>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Posts</h2>
          <BlogList featured={true} limit={3} />
        </div>

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Posts</h2>
          <BlogList limit={12} />
        </div>
      </div>
    </div>
  )
}

