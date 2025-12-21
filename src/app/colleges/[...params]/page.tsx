import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { getCollegeBySlug, getCollegeWithCourses, getCollegesByCategoryPaginated, getCollegesByCategoryAndSubcategoryPaginated } from "@/lib/colleges"
import { CollegeHero } from "@/components/college/CollegeHero"
import { CourseCard } from "@/components/course/CourseCard"
import { CollegePagination } from "@/components/colleges/CollegePagination"
import { generateCollegeMeta, generateStructuredDataCollege } from "@/lib/seo/generateMeta"

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

const categoryMap: Record<string, string> = {
  engineering: "Engineering",
  management: "Management",
  medical: "Medical",
  design: "Design",
  law: "Law",
}

const subcategoryMap: Record<string, string> = {
  btech: "B.Tech / B.E Colleges",
  bba: "BBA / BBM Colleges",
  mba: "MBA / PGDM Colleges",
  mbbs: "MBBS Colleges",
}

// Known category/subcategory combinations
const categoryRoutes = new Set([
  "engineering/btech",
  "management/bba",
  "management/mba",
  "medical/mbbs",
  "design",
  "law",
])

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
  
  // If it's a category route
  if (routeParams.length === 1 && categoryMap[routeParams[0]]) {
    const categoryName = categoryMap[routeParams[0]]
    return {
      title: `${categoryName} Colleges | SeeMyCampus`,
      description: `Find the best ${categoryName} colleges in India. Browse top colleges with detailed information, ratings, and admission details.`,
    }
  }
  
  if (routeParams.length === 2 && categoryRoutes.has(`${routeParams[0]}/${routeParams[1]}`)) {
    const categoryName = categoryMap[routeParams[0]] || routeParams[0]
    const subcategoryName = subcategoryMap[routeParams[1]] || routeParams[1]
    return {
      title: `${subcategoryName} | ${categoryName} Colleges | SeeMyCampus`,
      description: `Find the best ${subcategoryName} in India. Browse top ${categoryName} colleges with detailed information, ratings, and admission details.`,
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
  
  // Handle category/subcategory routes
  if (routeParams.length === 1 && categoryMap[routeParams[0]]) {
    // Category page (e.g., /colleges/design, /colleges/law)
    const category = routeParams[0]
    const categoryName = categoryMap[category]
    const { colleges: collegesList, pagination } = await getCollegesByCategoryPaginated(category, currentPage, 10)

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
                  {college.images && college.images.length > 0 ? (
                    <Image
                      src={college.images[0]}
                      alt={`${college.name} logo`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200">
                      {getInitials(college.name)}
                    </div>
                  )}
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
            <CollegePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </div>
      </div>
    )
  }
  
  if (routeParams.length === 2 && categoryRoutes.has(`${routeParams[0]}/${routeParams[1]}`)) {
    // Subcategory page (e.g., /colleges/engineering/btech)
    const category = routeParams[0]
    const subcategory = routeParams[1]
    const categoryName = categoryMap[category] || category
    const subcategoryName = subcategoryMap[subcategory] || subcategory
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
                  {college.images && college.images.length > 0 ? (
                    <Image
                      src={college.images[0]}
                      alt={`${college.name} logo`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200">
                      {getInitials(college.name)}
                    </div>
                  )}
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
            <CollegePagination
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-8">
        <CollegeHero
          name={college.name}
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
            <p className="text-muted-foreground whitespace-pre-line">{college.description}</p>
          </div>
        )}

        {courses && courses.length > 0 && (
          <div>
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
      </div>
    </>
  )
}

