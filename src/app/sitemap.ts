import { MetadataRoute } from "next"
import { getAllColleges, getAllCities } from "@/lib/colleges"
import { db } from "@/db"
import { courses, scholarships, entranceExams, categories, studyGoals } from "@/db/schema"
import { eq } from "drizzle-orm"

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

  // College pages - High priority for SEO
  let collegePages: MetadataRoute.Sitemap = []
  try {
    const colleges = await getAllColleges()
    collegePages = colleges.map((college) => ({
      url: `${baseUrl}/colleges/${college.slug}`,
      lastModified: college.updatedAt || college.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    // During build time, database might not be available or schema might be incomplete
    console.warn("Failed to fetch colleges for sitemap:", error)
  }

  // Category pages (colleges by category)
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const allCategories = await db.select().from(categories).where(eq(categories.isActive, true))
    categoryPages = allCategories.map((category) => ({
      url: `${baseUrl}/colleges/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.warn("Failed to fetch categories for sitemap:", error)
  }

  // Study goal pages
  let studyGoalPages: MetadataRoute.Sitemap = []
  try {
    const allStudyGoals = await db.select().from(studyGoals).where(eq(studyGoals.isActive, true))
    studyGoalPages = allStudyGoals.map((goal) => ({
      url: `${baseUrl}/colleges/${goal.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.warn("Failed to fetch study goals for sitemap:", error)
  }

  // Course pages
  let coursePages: MetadataRoute.Sitemap = []
  try {
    const allCourses = await db.select().from(courses)
    coursePages = allCourses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug}`,
      lastModified: course.updatedAt || course.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.warn("Failed to fetch courses for sitemap:", error)
  }

  // Scholarship pages
  let scholarshipPages: MetadataRoute.Sitemap = []
  try {
    const allScholarships = await db.select().from(scholarships).where(eq(scholarships.isActive, true))
    scholarshipPages = allScholarships.map((scholarship) => ({
      url: `${baseUrl}/scholarships/${scholarship.slug}`,
      lastModified: scholarship.updatedAt || scholarship.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.warn("Failed to fetch scholarships for sitemap:", error)
  }

  // Entrance exam pages
  let examPages: MetadataRoute.Sitemap = []
  try {
    const allExams = await db.select().from(entranceExams).where(eq(entranceExams.isActive, true))
    examPages = allExams.map((exam) => ({
      url: `${baseUrl}/entrance-exams/${exam.slug}`,
      lastModified: exam.updatedAt || exam.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.warn("Failed to fetch entrance exams for sitemap:", error)
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
    
    locationPages = allLocationCities.slice(0, 50).map((city) => ({
      url: `${baseUrl}/colleges/location/${city.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.warn("Failed to fetch cities for location pages in sitemap:", error)
  }

  return [
    ...staticPages,
    ...collegePages,
    ...categoryPages,
    ...studyGoalPages,
    ...coursePages,
    ...scholarshipPages,
    ...examPages,
    ...locationPages,
  ]
}

