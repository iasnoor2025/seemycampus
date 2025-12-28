import { Metadata } from "next"
import { BlogListWithFilters } from "@/components/blog/BlogListWithFilters"

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

        <BlogListWithFilters />
      </div>
    </div>
  )
}

