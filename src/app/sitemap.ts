import { MetadataRoute } from "next"
import { getAllColleges } from "@/lib/colleges"
import { db } from "@/db"
import { courses } from "@/db/schema"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  // College pages
  const colleges = await getAllColleges()
  const collegePages: MetadataRoute.Sitemap = colleges.map((college) => ({
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: college.updatedAt || college.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Course pages
  const allCourses = await db.select().from(courses)
  const coursePages: MetadataRoute.Sitemap = allCourses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt || course.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...collegePages, ...coursePages]
}

