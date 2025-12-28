import { MetadataRoute } from "next"
import { getAllColleges } from "@/lib/colleges"
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
  const colleges = await getAllColleges()
  const collegePages: MetadataRoute.Sitemap = colleges.map((college) => ({
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: college.updatedAt || college.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Category pages (colleges by category)
  const allCategories = await db.select().from(categories).where(eq(categories.isActive, true))
  const categoryPages: MetadataRoute.Sitemap = allCategories.map((category) => ({
    url: `${baseUrl}/colleges/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Study goal pages
  const allStudyGoals = await db.select().from(studyGoals).where(eq(studyGoals.isActive, true))
  const studyGoalPages: MetadataRoute.Sitemap = allStudyGoals.map((goal) => ({
    url: `${baseUrl}/colleges/${goal.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Course pages
  const allCourses = await db.select().from(courses)
  const coursePages: MetadataRoute.Sitemap = allCourses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt || course.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Scholarship pages
  const allScholarships = await db.select().from(scholarships).where(eq(scholarships.isActive, true))
  const scholarshipPages: MetadataRoute.Sitemap = allScholarships.map((scholarship) => ({
    url: `${baseUrl}/scholarships/${scholarship.slug}`,
    lastModified: scholarship.updatedAt || scholarship.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // Entrance exam pages
  const allExams = await db.select().from(entranceExams).where(eq(entranceExams.isActive, true))
  const examPages: MetadataRoute.Sitemap = allExams.map((exam) => ({
    url: `${baseUrl}/entrance-exams/${exam.slug}`,
    lastModified: exam.updatedAt || exam.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...collegePages,
    ...categoryPages,
    ...studyGoalPages,
    ...coursePages,
    ...scholarshipPages,
    ...examPages,
  ]
}

