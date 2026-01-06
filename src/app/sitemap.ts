import { MetadataRoute } from "next"
import { getAllColleges, getAllCities } from "@/lib/colleges"
import { db } from "@/db"
import { courses, scholarships, entranceExams, categories, studyGoals, blogPosts } from "@/db/schema"
import { eq, and, isNotNull, ne } from "drizzle-orm"

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

  // Static pages - High priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/scholarships`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/entrance-exams`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/fee-calculator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/recommendations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/career-counseling`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/academic-alliance`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // College pages - High priority for SEO (only enabled colleges)
  let collegePages: MetadataRoute.Sitemap = []
  try {
    const colleges = await getAllColleges() // This already filters disabled colleges
    collegePages = colleges
      .map((college) => {
        const slug = getOrGenerateSlug(college, "college")
        return {
          url: `${baseUrl}/colleges/${slug}`,
          lastModified: college.updatedAt || college.createdAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    // During build time, database might not be available or schema might be incomplete
    console.warn("Failed to fetch colleges for sitemap:", error)
  }

  // Category pages (colleges by category)
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const allCategories = await db.select().from(categories).where(eq(categories.isActive, true))
    categoryPages = allCategories
      .map((category) => {
        const slug = getOrGenerateSlug(category, "category")
        return {
          url: `${baseUrl}/colleges/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    console.warn("Failed to fetch categories for sitemap:", error)
  }

  // Study goal pages
  let studyGoalPages: MetadataRoute.Sitemap = []
  try {
    const allStudyGoals = await db.select().from(studyGoals).where(eq(studyGoals.isActive, true))
    studyGoalPages = allStudyGoals
      .map((goal) => {
        const slug = getOrGenerateSlug(goal, "study-goal")
        return {
          url: `${baseUrl}/colleges/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    console.warn("Failed to fetch study goals for sitemap:", error)
  }

  // Course pages - Generate slugs if missing
  let coursePages: MetadataRoute.Sitemap = []
  try {
    const allCourses = await db.select().from(courses)
    coursePages = allCourses
      .map((course) => {
        const slug = getOrGenerateSlug(course, "course")
        return {
          url: `${baseUrl}/courses/${slug}`,
          lastModified: course.updatedAt || course.createdAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    console.warn("Failed to fetch courses for sitemap:", error)
  }

  // Scholarship pages
  let scholarshipPages: MetadataRoute.Sitemap = []
  try {
    const allScholarships = await db.select().from(scholarships).where(eq(scholarships.isActive, true))
    scholarshipPages = allScholarships
      .map((scholarship) => {
        const slug = getOrGenerateSlug(scholarship, "scholarship")
        return {
          url: `${baseUrl}/scholarships/${slug}`,
          lastModified: scholarship.updatedAt || scholarship.createdAt,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    console.warn("Failed to fetch scholarships for sitemap:", error)
  }

  // Entrance exam pages
  let examPages: MetadataRoute.Sitemap = []
  try {
    const allExams = await db.select().from(entranceExams).where(eq(entranceExams.isActive, true))
    examPages = allExams
      .map((exam) => {
        const slug = getOrGenerateSlug(exam, "exam")
        return {
          url: `${baseUrl}/entrance-exams/${slug}`,
          lastModified: exam.updatedAt || exam.createdAt,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    console.warn("Failed to fetch entrance exams for sitemap:", error)
  }

  // Blog post pages - High priority for content SEO
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const allBlogPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
    blogPages = allBlogPosts
      .map((post) => {
        const slug = getOrGenerateSlug(post, "blog-post")
        return {
          url: `${baseUrl}/blog/${slug}`,
          lastModified: post.updatedAt || post.publishedAt || post.createdAt,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }
      })
      .filter(page => page.url && !page.url.includes("undefined"))
  } catch (error) {
    console.warn("Failed to fetch blog posts for sitemap:", error)
  }

  // Location pages - High priority for local SEO
  let locationPages: MetadataRoute.Sitemap = []
  try {
    const cities = await getAllCities()
    // Top 50 cities from the location page
    const topCities = [
      "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
      "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
      "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
      "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Amritsar", "Dhanbad",
      "Jabalpur", "Raipur", "Allahabad", "Coimbatore", "Jodhpur", "Madurai", "Gwalior",
      "Vijayawada", "Chandigarh", "Kota", "Guwahati", "Solapur", "Hubli", "Bareilly",
      "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Bhubaneswar"
    ]
    
    // Use top cities, but also include any cities from database that have colleges
    const allLocationCities = [...new Set([...topCities, ...cities])]
    
    // Include all cities (removed 50 limit to include all location pages)
    locationPages = allLocationCities.map((city) => ({
      url: `${baseUrl}/colleges/location/${city.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.warn("Failed to fetch cities for location pages in sitemap:", error)
  }

  // Combine all pages and ensure no duplicates
  const allPages = [
    ...staticPages,
    ...collegePages,
    ...categoryPages,
    ...studyGoalPages,
    ...coursePages,
    ...scholarshipPages,
    ...examPages,
    ...locationPages,
    ...blogPages,
  ]
  
  // Remove duplicates based on URL
  const uniquePages = Array.from(
    new Map(allPages.map(page => [page.url, page])).values()
  )
  
  // Sort by priority (highest first) for better crawling
  uniquePages.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  
  return uniquePages
}

