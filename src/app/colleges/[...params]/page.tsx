import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building, Award, TrendingUp, Users, Coins, MapPin } from "lucide-react"
import { CollegeLogo } from "@/components/college/CollegeLogo"
import { getCollegeBySlug, getCollegeWithCourses, getCollegesByCategoryPaginated, getCollegesByCategoryAndSubcategoryPaginated, getCategoryStats } from "@/lib/colleges"
import { CollegeHero } from "@/components/college/CollegeHero"
import { CourseCard } from "@/components/course/CourseCard"
import { PaginationWrapper } from "@/components/colleges/PaginationWrapper"
import { CollegeReviews } from "@/components/college/CollegeReviews"
import { CollegeEntranceExams } from "@/components/college/CollegeEntranceExams"
import { CollegePlacements } from "@/components/college/CollegePlacements"
import { CollegeInfrastructure } from "@/components/college/CollegeInfrastructure"
import { ApplicationGuide } from "@/components/college/ApplicationGuide"
import { InquiryForm } from "@/components/college/InquiryForm"
import { CollegeNews } from "@/components/college/CollegeNews"
import { RelatedContent } from "@/components/seo/RelatedContent"
import { generateCollegeMeta, generateStructuredDataCollege, generateBreadcrumbList, generateCollegeFAQStructuredData, generateSingleReviewStructuredData } from "@/lib/seo/generateMeta"
import { baseUrl } from "@/lib/constants"
import { getRelatedColleges, getRelatedScholarships, getRelatedExams } from "@/lib/relatedContent"
import { db } from "@/db"
import { categories, studyGoals, collegeReviews } from "@/db/schema"
import { eq, or, asc, and, desc } from "drizzle-orm"

interface PageProps {
  params: Promise<{
    params: string[]
  }>
  searchParams: Promise<{ page?: string }>
}

// Sample colleges data for category pages
const sampleColleges = [
  {
    id: 1,
    name: "SRM Institute of Science and Technology",
    location: "Chennai, Tamil Nadu",
    rating: 4.0,
    logo: null,
  },
  {
    id: 2,
    name: "Vellore Institute of Technology",
    location: "Vellore, Tamil Nadu",
    rating: 4.1,
    logo: null,
  },
  {
    id: 3,
    name: "Amity University",
    location: "Noida, Uttar Pradesh",
    rating: 4.2,
    logo: null,
  },
  {
    id: 4,
    name: "Lovely Professional University",
    location: "Phagwara, Punjab",
    rating: 4.0,
    logo: null,
  },
  {
    id: 5,
    name: "Manipal Academy of Higher Education",
    location: "Manipal, Karnataka",
    rating: 4.3,
    logo: null,
  },
  {
    id: 6,
    name: "Birla Institute of Technology and Science",
    location: "Pilani, Rajasthan",
    rating: 4.4,
    logo: null,
  },
  {
    id: 7,
    name: "Indian Institute of Technology Delhi",
    location: "New Delhi",
    rating: 4.8,
    logo: null,
  },
  {
    id: 8,
    name: "National Institute of Technology",
    location: "Warangal, Telangana",
    rating: 4.2,
    logo: null,
  },
]

// Helper function to get all valid category slugs from database
async function getCategorySlugs(): Promise<Map<string, { name: string; type: 'category' | 'studyGoal' }>> {
  const categoryMap = new Map<string, { name: string; type: 'category' | 'studyGoal' }>()

  try {
    // Fetch active categories
    const dbCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))

    dbCategories.forEach((cat) => {
      categoryMap.set(cat.slug.toLowerCase(), { name: cat.name, type: 'category' })
    })

    // Fetch active study goals
    const dbStudyGoals = await db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.isActive, true))

    dbStudyGoals.forEach((goal) => {
      // Only add if not already in categories (no duplicates)
      if (!categoryMap.has(goal.slug.toLowerCase())) {
        categoryMap.set(goal.slug.toLowerCase(), { name: goal.name, type: 'studyGoal' })
      }
    })
  } catch (error) {
    console.error("Error fetching category slugs:", error)
  }

  return categoryMap
}

// Helper function to get category/subcategory info by slug
async function getCategoryBySlug(slug: string): Promise<{ name: string; type: 'category' | 'studyGoal' } | null> {
  const categorySlugs = await getCategorySlugs()
  return categorySlugs.get(slug.toLowerCase()) || null
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { params: routeParams } = await params

  // If it's a category route (single parameter)
  if (routeParams.length === 1) {
    const categoryInfo = await getCategoryBySlug(routeParams[0])
    if (categoryInfo) {
      const categoryName = categoryInfo.name
      return {
        title: `${categoryName} Colleges in India | Top ${categoryName} Colleges | Admission, Fees, Rankings | SeeMyCampus`,
        description: `Find the best ${categoryName} colleges in India. Browse top-ranked ${categoryName.toLowerCase()} colleges with detailed information about admission process, courses, fees, placements, rankings, and cutoffs. Get expert guidance for ${categoryName.toLowerCase()} college admissions.`,
        keywords: [
          `${categoryName} colleges`,
          `${categoryName} colleges in India`,
          `best ${categoryName.toLowerCase()} colleges`,
          `top ${categoryName.toLowerCase()} colleges`,
          `${categoryName.toLowerCase()} college admission`,
          `${categoryName.toLowerCase()} college fees`,
          `${categoryName.toLowerCase()} college ranking`,
          `colleges in India`,
          `college admission`,
          `college search`,
        ],
        openGraph: {
          title: `${categoryName} Colleges in India | SeeMyCampus`,
          description: `Find the best ${categoryName} colleges in India. Browse top colleges with detailed information, ratings, and admission details.`,
          type: "website",
          url: `${baseUrl}/colleges/${routeParams[0]}`,
          locale: "en_IN",
          siteName: "SeeMyCampus",
        },
        twitter: {
          card: "summary_large_image",
          title: `${categoryName} Colleges in India | SeeMyCampus`,
          description: `Find the best ${categoryName} colleges in India. Browse top colleges with detailed information, ratings, and admission details.`,
        },
        alternates: {
          canonical: `${baseUrl}/colleges/${routeParams[0]}`,
        },
      }
    }
  }

  // Otherwise, treat as individual college slug
  const slug = routeParams.join("/")
  const collegeData = await getCollegeWithCourses(slug)

  if (!collegeData) {
    // Return proper 404 metadata to prevent indexing of 404 pages
    return {
      title: "College Not Found | SeeMyCampus",
      description: "The college page you are looking for could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // Pass courses to meta generation for better SEO
  // Wrap in try-catch to ensure page renders even if AI fails
  try {
    return await generateCollegeMeta({
      ...collegeData,
      courses: collegeData.courses || null,
    })
  } catch (error: any) {
    // If AI fails, return basic metadata so page still renders
    console.error("Error generating college metadata:", error?.message || error)
    return {
      title: `${collegeData.name}${collegeData.location ? ` - ${collegeData.location}` : ""} | Admission, Courses, Fees, Placements | SeeMyCampus`,
      description: collegeData.description || `Find complete information about ${collegeData.name} including admission process, courses, fees, placements, rankings, and cutoffs.`,
      keywords: [
        collegeData.name,
        `${collegeData.name} admission`,
        `${collegeData.name} courses`,
        `${collegeData.name} fees`,
      ],
      openGraph: {
        title: `${collegeData.name} | SeeMyCampus`,
        description: collegeData.description || `Complete information about ${collegeData.name}`,
        type: "website",
        url: `${baseUrl}/colleges/${collegeData.slug}`,
      },
      alternates: {
        canonical: `${baseUrl}/colleges/${collegeData.slug}`,
      },
    }
  }
}

export default async function CollegesPage({ params, searchParams }: PageProps) {
  const { params: routeParams } = await params
  const params_searchParams = await searchParams
  const currentPage = parseInt(params_searchParams.page || "1", 10)

  // Handle category routes (single parameter - dynamic from database)
  if (routeParams.length === 1) {
    const categorySlug = routeParams[0]
    const categoryInfo = await getCategoryBySlug(categorySlug)

    if (categoryInfo) {
      // Category page (e.g., /colleges/design, /colleges/law, /colleges/commerce, /colleges/arts)
      const categoryName = categoryInfo.name
      // Get colleges with pagination (with error handling)
      let collegesList: any[] = []
      let pagination = { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }
      let categoryStats: {
        totalColleges: number
        privateColleges: number
        governmentColleges: number
        averageRanking: number | null
        topColleges: { name: string; slug: string; ranking: number | null; location: string | null }[]
        averagePackage: number | null
        highestPackage: number | null
      } = {
        totalColleges: 0,
        privateColleges: 0,
        governmentColleges: 0,
        averageRanking: null,
        topColleges: [],
        averagePackage: null,
        highestPackage: null
      }

      try {
        const result = await getCollegesByCategoryPaginated(categorySlug, currentPage, 10)
        collegesList = result.colleges || []
        pagination = result.pagination || pagination
      } catch (error) {
        console.error("Error fetching colleges by category:", error)
        // Use empty arrays/defaults - page will still render
      }

      try {
        const stats = await getCategoryStats(categoryName)
        if (stats) {
          categoryStats = stats
        }
      } catch (error) {
        console.error("Error fetching category stats:", error)
        // Use defaults - page will still render
      }

      // Generate breadcrumb structured data
      const breadcrumbData = generateBreadcrumbList([
        { name: "Home", url: "/" },
        { name: "Colleges", url: "/colleges" },
        { name: `${categoryName} Colleges`, url: `/colleges/${categorySlug}` },
      ])

      // Generate CourseCategory structured data
      const courseCategorySchema = {
        "@context": "https://schema.org",
        "@type": "CourseCategory",
        name: `${categoryName} Colleges`,
        description: `Complete guide to ${categoryName} colleges in India. Find top-ranked institutions, courses, admission details, fees, and placements.`,
        url: `${baseUrl}/colleges/${categorySlug}`,
      }

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(courseCategorySchema) }}
          />
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white py-12 md:py-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                    <Building className="w-5 h-5" />
                    <span className="font-medium text-sm">{categoryName} Colleges</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                    Best {categoryName} Colleges in India
                  </h1>
                  <p className="text-xl text-white/90 mb-6">
                    Discover top-ranked {categoryName} colleges and universities in India. Find complete information about admission, courses, fees, placements, and rankings.
                  </p>

                  {/* Category Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Colleges</span>
                      </div>
                      <p className="text-2xl font-bold">{categoryStats.totalColleges}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5" />
                        <span className="text-sm font-medium">Private</span>
                      </div>
                      <p className="text-2xl font-bold">{categoryStats.privateColleges}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-medium">Government</span>
                      </div>
                      <p className="text-2xl font-bold">{categoryStats.governmentColleges}</p>
                    </div>
                    {categoryStats.averageRanking && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-sm font-medium">Avg Ranking</span>
                        </div>
                        <p className="text-2xl font-bold">{categoryStats.averageRanking}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
              {/* Top Colleges Section */}
              {categoryStats.topColleges.length > 0 && (
                <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Top Ranked {categoryName} Colleges</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryStats.topColleges.slice(0, 6).map((college) => (
                      <Link
                        key={college.slug}
                        href={`/colleges/${college.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{college.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {college.ranking && <span>Rank #{college.ranking}</span>}
                            {college.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {college.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Placement Statistics */}
              {(categoryStats.averagePackage || categoryStats.highestPackage) && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Placement Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryStats.averagePackage && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Coins className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Average Package</p>
                          <p className="text-2xl font-bold">₹{categoryStats.averagePackage.toLocaleString()} LPA</p>
                        </div>
                      </div>
                    )}
                    {categoryStats.highestPackage && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Highest Package</p>
                          <p className="text-2xl font-bold">₹{categoryStats.highestPackage.toLocaleString()} LPA</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Table Header */}
              <div className="mb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                <div className="grid grid-cols-12 gap-4 py-2 font-semibold text-gray-900">
                  <div className="col-span-2 text-center">PREVIEW</div>
                  <div className="col-span-5">COLLEGE NAME</div>
                  <div className="col-span-3">LOCATION</div>
                  <div className="col-span-2 text-center">VIEW</div>
                </div>
              </div>

              <div className="space-y-4">
                {collegesList.map((college) => (
                  <div
                    key={college.id}
                    className="grid grid-cols-12 gap-4 items-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 p-4 md:p-6"
                  >
                    {/* Preview - Logo */}
                    <div className="col-span-2 flex justify-center">
                      <CollegeLogo
                        collegeId={college.id}
                        collegeName={college.name}
                        imageUrl={college.images && college.images.length > 0 ? college.images[0] : null}
                        size="lg"
                        variant="circle"
                      />
                    </div>

                    {/* College Name */}
                    <div className="col-span-5">
                      <Link href={`/colleges/${college.slug}`}>
                        <h3 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {college.name}
                        </h3>
                      </Link>
                    </div>

                    {/* Location */}
                    <div className="col-span-3">
                      <p className="text-sm text-gray-700">
                        {college.location || college.city || "Location not specified"}
                      </p>
                    </div>

                    {/* View Button */}
                    <div className="col-span-2 flex justify-center">
                      <Link href={`/colleges/${college.slug}`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                          VIEW MORE
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <PaginationWrapper
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                  />
                </div>
              )}

              {/* SEO Content Section */}
              <div className="mt-12 prose prose-slate max-w-none bg-white rounded-xl shadow-lg p-8">
                <h2>About {categoryName} Colleges in India</h2>
                <p>
                  {categoryName} colleges in India offer comprehensive programs designed to prepare students for successful careers.
                  With {categoryStats.totalColleges} institutions across the country, students have access to quality education
                  {categoryStats.privateColleges > 0 && `, including ${categoryStats.privateColleges} private colleges`}
                  {categoryStats.governmentColleges > 0 && ` and ${categoryStats.governmentColleges} government institutions`}.
                </p>

                <h3>Why Choose {categoryName} Colleges?</h3>
                <ul>
                  <li>Industry-relevant curriculum aligned with current market demands</li>
                  <li>Experienced faculty with industry expertise</li>
                  <li>Strong placement records with top companies</li>
                  <li>Modern infrastructure and facilities</li>
                  <li>Research opportunities and industry collaborations</li>
                  <li>Alumni network and career support</li>
                </ul>

                <h3>Admission Process for {categoryName} Colleges</h3>
                <p>
                  Admission to {categoryName} colleges typically requires:
                </p>
                <ul>
                  <li>Qualifying entrance exam scores (varies by college and course)</li>
                  <li>Academic performance in previous qualifying exams</li>
                  <li>Personal interview or group discussion (for some colleges)</li>
                  <li>Application submission within specified deadlines</li>
                </ul>

                <h3>Career Opportunities After {categoryName}</h3>
                <p>
                  Graduates from {categoryName} colleges have diverse career opportunities across various industries.
                  {categoryStats.averagePackage && ` The average placement package is ₹${categoryStats.averagePackage.toLocaleString()} LPA,`}
                  {categoryStats.highestPackage && ` with the highest package reaching ₹${categoryStats.highestPackage.toLocaleString()} LPA.`}
                  Career paths include roles in corporate sectors, government organizations, entrepreneurship, and further studies.
                </p>

                <h3>How to Choose the Right {categoryName} College</h3>
                <p>
                  When selecting a {categoryName} college, consider:
                </p>
                <ul>
                  <li><strong>Ranking & Accreditation:</strong> Check NIRF rankings and accreditation status</li>
                  <li><strong>Placement Records:</strong> Review placement statistics and top recruiters</li>
                  <li><strong>Faculty:</strong> Research faculty qualifications and industry experience</li>
                  <li><strong>Infrastructure:</strong> Evaluate campus facilities, labs, and resources</li>
                  <li><strong>Location:</strong> Consider proximity to industry hubs and opportunities</li>
                  <li><strong>Fees & Scholarships:</strong> Assess affordability and available financial aid</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )
    }
    // If category not found, fall through to treat as college slug
  }

  // Handle subcategory routes (two parameters) - keeping for backward compatibility
  if (routeParams.length === 2) {
    const category = routeParams[0]
    const subcategory = routeParams[1]
    const categoryInfo = await getCategoryBySlug(category)
    const categoryName = categoryInfo?.name || category
    const subcategoryName = subcategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    const { colleges: collegesList, pagination } = await getCollegesByCategoryAndSubcategoryPaginated(category, subcategory, currentPage, 10)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <Building className="w-5 h-5" />
                <span className="font-medium text-sm">{subcategoryName}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                {subcategoryName}
              </h1>
              <p className="text-xl text-white/90">
                Browse top {categoryName} colleges offering {subcategoryName}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Table Header */}
          <div className="mb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-12 gap-4 py-2 font-semibold text-gray-900">
              <div className="col-span-2 text-center">PREVIEW</div>
              <div className="col-span-5">COLLEGE NAME</div>
              <div className="col-span-3">LOCATION</div>
              <div className="col-span-2 text-center">VIEW</div>
            </div>
          </div>

          <div className="space-y-4">
            {collegesList.map((college) => (
              <div
                key={college.id}
                className="grid grid-cols-12 gap-4 items-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 p-4 md:p-6"
              >
                {/* Preview - Logo */}
                <div className="col-span-2 flex justify-center">
                  <CollegeLogo
                    collegeId={college.id}
                    collegeName={college.name}
                    imageUrl={college.images && college.images.length > 0 ? college.images[0] : null}
                    size="lg"
                    variant="circle"
                  />
                </div>

                {/* College Name */}
                <div className="col-span-5">
                  <Link href={`/colleges/${college.slug}`}>
                    <h3 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {college.name}
                    </h3>
                  </Link>
                </div>

                {/* Location */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">
                    {college.location || college.city || "Location not specified"}
                  </p>
                </div>

                {/* View Button */}
                <div className="col-span-2 flex justify-center">
                  <Link href={`/colleges/${college.slug}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <PaginationWrapper
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </div>
      </div>
    )
  }

  // Otherwise, treat as individual college slug
  const slug = routeParams.join("/")
  let collegeData
  try {
    collegeData = await getCollegeWithCourses(slug)
  } catch (error) {
    console.error("Error fetching college data:", error)
    notFound()
  }

  if (!collegeData) {
    notFound()
  }

  const { courses, ...college } = collegeData

  // Fetch review data for aggregate rating (only if reviews exist)
  let reviewCount: number | null = null
  let averageRating: number | null = null
  let reviewStructuredData: any[] = []
  try {
    const approvedReviews = await db
      .select()
      .from(collegeReviews)
      .where(and(eq(collegeReviews.collegeId, college.id), eq(collegeReviews.isApproved, true)))
      .orderBy(desc(collegeReviews.createdAt))
      .limit(5) // Get top 5 reviews for structured data

    if (approvedReviews.length > 0) {
      reviewCount = approvedReviews.length
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = Math.round((totalRating / approvedReviews.length) * 10) / 10

      // Generate Review structured data for top reviews
      reviewStructuredData = approvedReviews.slice(0, 3).map(review =>
        generateSingleReviewStructuredData(
          {
            name: college.name,
            url: `${baseUrl}/colleges/${college.slug}`,
          },
          review.reviewerName || "Anonymous",
          review.rating,
          review.review || review.title || "",
          review.createdAt?.toISOString() || new Date().toISOString()
        )
      )
    }
  } catch (error) {
    // Silently fail - reviews are optional
    console.warn('Failed to fetch reviews for structured data:', error)
  }

  const structuredData = generateStructuredDataCollege({
    ...college,
    courses: courses || null,
    reviewCount: reviewCount,
    averageRating: averageRating,
  })

  // Generate FAQ structured data (with error handling to ensure page renders)
  let faqStructuredData: any = null
  try {
    faqStructuredData = await generateCollegeFAQStructuredData({
      ...college,
      courses: courses || null,
    })
  } catch (error: any) {
    // Silently fail - FAQ structured data is optional
    // Page will still render without it
    console.error("Error generating FAQ structured data:", error?.message || error)
  }

  // Fetch related content for internal linking
  const [relatedColleges, relatedScholarships, relatedExams] = await Promise.all([
    getRelatedColleges(college.id, college.location, college.city, 5),
    getRelatedScholarships(college.id, 5),
    getRelatedExams(Array.isArray(college.entranceExams) ? college.entranceExams : null, 5),
  ])

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbList([
    { name: "Home", url: "/" },
    { name: "Colleges", url: "/colleges" },
    { name: college.name, url: `/colleges/${college.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      )}
      {reviewStructuredData.length > 0 && reviewStructuredData.map((review, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
        />
      ))}
      <div className="container mx-auto px-4 py-8">
        <CollegeHero
          name={college.name}
          collegeId={college.id}
          location={college.location}
          city={college.city}
          website={college.website}
          email={college.email}
          phone={college.phone}
          images={college.images}
          brochureUrl={college.brochureUrl}
        />

        {/* Key Highlights Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {college.ranking && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Ranking</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">#{college.ranking}</p>
            </div>
          )}
          {college.establishedYear && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Established</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{college.establishedYear}</p>
            </div>
          )}
          {college.averagePackage && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Avg Package</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{college.averagePackage.toLocaleString()} LPA</p>
            </div>
          )}
          {college.accreditation && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Accreditation</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{college.accreditation}</p>
            </div>
          )}
        </div>

        {college.description && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">About {college.name}</h2>
            <div className="text-muted-foreground whitespace-pre-line prose prose-sm max-w-none">
              <p>{college.description}</p>

              {/* Location-based internal links */}
              {college.city && (
                <p className="mt-4 text-sm">
                  Explore more{" "}
                  <Link href={`/colleges/location/${college.city.toLowerCase().replace(/\s+/g, "-")}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    colleges in {college.city}
                  </Link>
                  {" "}or browse{" "}
                  <Link href="/colleges" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    all colleges in India
                  </Link>
                  .
                </p>
              )}

              {/* Course links */}
              {courses && courses.length > 0 && (
                <p className="mt-4 text-sm">
                  This college offers{" "}
                  {courses.slice(0, 3).map((course, idx) => (
                    <span key={course.id}>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {course.name}
                      </Link>
                      {idx < Math.min(courses.length, 3) - 1 && ", "}
                      {idx === Math.min(courses.length, 3) - 2 && courses.length > 3 && ", and "}
                    </span>
                  ))}
                  {courses.length > 3 && ` and ${courses.length - 3} more courses`}.
                  {" "}
                  <Link
                    href={`/colleges/${college.slug}#courses`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    View all courses
                  </Link>
                  {" "}or{" "}
                  <Link href="/courses" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    browse all courses
                  </Link>
                  .
                </p>
              )}

              {/* Entrance exam links */}
              {college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0 && (
                <p className="mt-4 text-sm">
                  Admission requires{" "}
                  {college.entranceExams.slice(0, 2).map((exam, idx) => {
                    const examSlug = exam.toLowerCase().replace(/\s+/g, "-")
                    const examsLength = college.entranceExams?.length || 0
                    return (
                      <span key={exam}>
                        <Link
                          href={`/entrance-exams/${examSlug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {exam}
                        </Link>
                        {idx < Math.min(examsLength, 2) - 1 && " or "}
                      </span>
                    )
                  })}
                  {" "}scores.{" "}
                  <Link href="/entrance-exams" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    View admission timeline
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        )}

        {courses && courses.length > 0 && (
          <div id="courses">
            <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  name={course.name}
                  slug={course.slug}
                  description={course.description}
                  duration={course.duration}
                  fees={course.fees}
                  feesCurrency={course.feesCurrency}
                  studyMode={course.studyMode}
                  level={course.level}
                />
              ))}
            </div>
          </div>
        )}

        {(!courses || courses.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses available at this time.</p>
          </div>
        )}

        {/* Entrance Exams Section */}
        <CollegeEntranceExams entranceExams={college.entranceExams} />



        {/* Placements Section */}
        <div className="mt-12">
          <CollegePlacements collegeId={college.id} collegeSlug={slug} />
        </div>

        {/* Infrastructure Section */}
        <div className="mt-12">
          <CollegeInfrastructure collegeSlug={slug} />
        </div>

        {/* Application Guide Section */}
        <div className="mt-12">
          <ApplicationGuide collegeSlug={slug} />
        </div>

        {/* Inquiry Form Section */}
        <div className="mt-12">
          <InquiryForm collegeSlug={slug} collegeName={college.name} />
        </div>

        {/* College News Section */}
        <div className="mt-12">
          <CollegeNews collegeSlug={slug} />
        </div>

        {/* Related Content Section */}
        <RelatedContent
          relatedColleges={relatedColleges}
          relatedScholarships={relatedScholarships}
          relatedExams={relatedExams}
          currentLocation={college.location}
          currentCity={college.city}
        />

        {/* Reviews Section */}
        <div className="mt-12">
          <CollegeReviews collegeSlug={slug} />
        </div>
      </div>
    </>
  )
}

