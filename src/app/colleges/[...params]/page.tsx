import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { CollegeLogo } from "@/components/college/CollegeLogo"
import { getCollegeBySlug, getCollegeWithCourses, getCollegesByCategoryPaginated, getCollegesByCategoryAndSubcategoryPaginated } from "@/lib/colleges"
import { CollegeHero } from "@/components/college/CollegeHero"
import { CourseCard } from "@/components/course/CourseCard"
import { PaginationWrapper } from "@/components/colleges/PaginationWrapper"
import { CollegeReviews } from "@/components/college/CollegeReviews"
import { CollegeEntranceExams } from "@/components/college/CollegeEntranceExams"
import { CollegeCutoffs } from "@/components/college/CollegeCutoffs"
import { CollegePlacements } from "@/components/college/CollegePlacements"
import { CollegeInfrastructure } from "@/components/college/CollegeInfrastructure"
import { ApplicationGuide } from "@/components/college/ApplicationGuide"
import { InquiryForm } from "@/components/college/InquiryForm"
import { CollegeNews } from "@/components/college/CollegeNews"
import { RelatedContent } from "@/components/seo/RelatedContent"
import { generateCollegeMeta, generateStructuredDataCollege, generateBreadcrumbList } from "@/lib/seo/generateMeta"
import { getRelatedColleges, getRelatedScholarships, getRelatedExams } from "@/lib/relatedContent"
import { db } from "@/db"
import { categories, studyGoals } from "@/db/schema"
import { eq, or, asc } from "drizzle-orm"

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
      return {
        title: `${categoryInfo.name} Colleges | SeeMyCampus`,
        description: `Find the best ${categoryInfo.name} colleges in India. Browse top colleges with detailed information, ratings, and admission details.`,
      }
    }
  }
  
  // Otherwise, treat as individual college slug
  const slug = routeParams.join("/")
  const college = await getCollegeBySlug(slug)
  
  if (!college) {
    return {
      title: "College Not Found | SeeMyCampus",
    }
  }

  return generateCollegeMeta(college)
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
      // Get colleges with pagination
      const { colleges: collegesList, pagination } = await getCollegesByCategoryPaginated(categorySlug, currentPage, 10)

    return (
      <div className="min-h-screen bg-red-600">
        <div className="max-w-5xl mx-auto bg-white min-h-screen py-8">
          {/* Breadcrumb */}
          <div className="px-6 mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/colleges" className="hover:text-red-600 transition-colors">Colleges</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{categoryName}</span>
          </div>

          <div className="px-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {categoryName} Colleges
            </h1>
            <p className="text-gray-600">
              Browse top {categoryName} colleges in India
            </p>
          </div>

          {/* Table Header */}
          <div className="px-6 mb-4">
            <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
              <div className="col-span-2 text-center">PREVIEW</div>
              <div className="col-span-5">COLLEGE NAME</div>
              <div className="col-span-3">LOCATION</div>
              <div className="col-span-2 text-center">VIEW</div>
            </div>
          </div>

          <div className="space-y-0">
            {collegesList.map((college, index) => (
              <div
                key={college.id}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                  index !== collegesList.length - 1 ? "border-b border-gray-200" : ""
                } hover:bg-gray-50 transition-colors`}
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
                  <h3 className="text-base font-semibold text-gray-900">
                    {college.name}
                  </h3>
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
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6">
            <PaginationWrapper
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </div>
      </div>
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
      <div className="min-h-screen bg-red-600">
        <div className="max-w-5xl mx-auto bg-white min-h-screen py-8">
          {/* Breadcrumb */}
          <div className="px-6 mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/colleges" className="hover:text-red-600 transition-colors">Colleges</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/colleges/${category}`} className="hover:text-red-600 transition-colors">{categoryName}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{subcategoryName}</span>
          </div>

          <div className="px-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {subcategoryName}
            </h1>
            <p className="text-gray-600">
              Browse top {categoryName} colleges offering {subcategoryName}
            </p>
          </div>

          {/* Table Header */}
          <div className="px-6 mb-4">
            <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
              <div className="col-span-2 text-center">PREVIEW</div>
              <div className="col-span-5">COLLEGE NAME</div>
              <div className="col-span-3">LOCATION</div>
              <div className="col-span-2 text-center">VIEW</div>
            </div>
          </div>

          <div className="space-y-0">
            {collegesList.map((college, index) => (
              <div
                key={college.id}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                  index !== collegesList.length - 1 ? "border-b border-gray-200" : ""
                } hover:bg-gray-50 transition-colors`}
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
                  <h3 className="text-base font-semibold text-gray-900">
                    {college.name}
                  </h3>
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
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6">
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
  const collegeData = await getCollegeWithCourses(slug)

  if (!collegeData) {
    notFound()
  }

  const { courses, ...college } = collegeData
  const structuredData = generateStructuredDataCollege(college)

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

        {college.description && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <div className="text-muted-foreground whitespace-pre-line prose prose-sm max-w-none">
              <p>{college.description}</p>
              {courses && courses.length > 0 && (
                <p className="mt-4 text-sm">
                  This college offers{" "}
                  {courses.slice(0, 3).map((course, idx) => (
                    <span key={course.id}>
                      <a
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {course.name}
                      </a>
                      {idx < Math.min(courses.length, 3) - 1 && ", "}
                      {idx === Math.min(courses.length, 3) - 2 && courses.length > 3 && ", and "}
                    </span>
                  ))}
                  {courses.length > 3 && ` and ${courses.length - 3} more courses`}.
                  {" "}
                  <a
                    href={`/colleges/${college.slug}#courses`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    View all courses
                  </a>
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

        {/* Cutoffs Section */}
        <div className="mt-12">
          <CollegeCutoffs collegeId={college.id} collegeSlug={slug} />
        </div>

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

