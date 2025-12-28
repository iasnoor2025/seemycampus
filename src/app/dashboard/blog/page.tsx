import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BlogPostsList } from "@/components/dashboard/BlogPostsList"

export const metadata: Metadata = {
  title: "Blog Management | Dashboard | SeeMyCampus",
  description: "Manage blog posts, tips, and guides",
}

export default async function BlogPostsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return <BlogPostsList />
}

