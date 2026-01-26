import { MetadataRoute } from "next"
import { getAllColleges, getAllCities } from "@/lib/colleges"
import { db } from "@/db"
import { courses, scholarships, entranceExams, categories, studyGoals, blogPosts } from "@/db/schema"
import { sql, eq, asc } from "drizzle-orm"

const COURSES_PER_SITEMAP = 45000

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 255)
}

/**
 * Get or generate a slug for an entity
 */
function getOrGenerateSlug(entity: { slug?: string | null; name?: string | null; title?: string | null; id: number }, fallbackPrefix: string): string {
  if (entity.slug && entity.slug.trim() !== "") {
    return entity.slug
  }
  const name = entity.name || entity.title || `${fallbackPrefix}-${entity.id}`
  return generateSlug(name)
}

/**
 * Next.js sitemap partitioning
 * This will generate /sitemap.xml as an index and /sitemap/0.xml, /sitemap/1.xml, etc.
 */
export async function generateSitemaps() {
  try {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(courses)
    const totalCourses = Number(result?.count || 0)

    // We want to split courses into chunks of 45k
    const sitemapCount = Math.ceil(totalCourses / COURSES_PER_SITEMAP)

    // id 0 is for the main site (static, colleges, etc)
    // id 1+ are for course chunks
    const sitemaps = [{ id: 0 }]
    for (let i = 1; i <= sitemapCount; i++) {
      sitemaps.push({ id: i })
    }

    return sitemaps
  } catch (error) {
    console.error("Failed to generate sitemap indices:", error)
    return [{ id: 0 }]
  }
}

export default async function sitemap({ id = 0 }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

  // IF id > 0, we are serving a course chunk
  if (id > 0) {
    try {
      const offset = (id - 1) * COURSES_PER_SITEMAP
      const courseData = await db
        .select()
        .from(courses)
        .orderBy(asc(courses.id))
        .limit(COURSES_PER_SITEMAP)
        .offset(offset)

      return courseData.map((c) => ({
        url: `${baseUrl}/courses/${getOrGenerateSlug(c, "course")}`,
        lastModified: c.updatedAt || c.createdAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }))
    } catch (e) {
      console.error(`Sitemap Courses Error (id: ${id}):`, e)
      return []
    }
  }

  // ELSE (id === 0), we return the main site pages

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/colleges`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/scholarships`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/entrance-exams`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/fee-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/quiz`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/recommendations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ]

  // College pages
  let collegePages: MetadataRoute.Sitemap = []
  try {
    const collegesData = await getAllColleges()
    collegePages = collegesData.map((c) => ({
      url: `${baseUrl}/colleges/${getOrGenerateSlug(c, "college")}`,
      lastModified: c.updatedAt || c.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch (e) {
    console.error("Sitemap Colleges Error:", e)
  }

  // Category pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const allCategories = await db.select().from(categories).where(eq(categories.isActive, true))
    categoryPages = allCategories.map((cat) => ({
      url: `${baseUrl}/colleges/${getOrGenerateSlug(cat, "category")}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  } catch (e) {
    console.error("Sitemap Categories Error:", e)
  }

  // Blog pages
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const blogs = await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true))
    blogPages = blogs.map((p) => ({
      url: `${baseUrl}/blog/${getOrGenerateSlug(p, "blog")}`,
      lastModified: p.updatedAt || p.createdAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }))
  } catch (e) {
    console.error("Sitemap Blogs Error:", e)
  }

  // Location pages
  let locationPages: MetadataRoute.Sitemap = []
  try {
    const cities = await getAllCities()
    locationPages = cities.map((city) => ({
      url: `${baseUrl}/colleges/location/${city.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch (e) {
    console.error("Sitemap Locations Error:", e)
  }

  const allPages = [
    ...staticPages,
    ...collegePages,
    ...categoryPages,
    ...blogPages,
    ...locationPages,
  ]

  return allPages.filter(p => p.url && !p.url.includes("undefined"))
}
