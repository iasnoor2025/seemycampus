import { notFound } from "next/navigation"
import { db } from "@/db"
import { courses, colleges, menuCourses } from "@/db/schema"
import { eq, ilike } from "drizzle-orm"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, GraduationCap, MapPin, ArrowLeft, Building2 } from "lucide-react"
import { Metadata } from "next"
import { generateCourseMeta, generateStructuredDataCourse } from "@/lib/seo/generateMeta"
import { PaginationWrapper } from "@/components/colleges/PaginationWrapper"
import { CollegeLogo } from "@/components/college/CollegeLogo"

interface CoursePageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function cleanCourseNameForDisplay(name: string): string {
  if (!name) return name
  
  // Remove common metadata patterns that might still exist
  let cleaned = name
  
  // Split on common metadata keywords and take the first part
  const metadataPatterns = [
    /Total Fees/i,
    /\d+\s*Courses?/i,
    /\d+\s*Years?/i,
    /Check Detailed/i,
    /Eligibility:/i,
    /Brochure/i,
    /Apply Now/i,
    /View \d+ Courses/i,
    /Based on \d+ views/i,
    /\d+ Students have/i,
    /Application Date:/i,
    /Post Graduation/i,
    /Graduation\s*\+/i,
    /UGC NET/i,
    /CEED/i,
    /PET/i,
    /NMIMS CET/i,
    /MH-CET/i,
    /JEE/i,
    /Entrance Test/i,
    /View$/i,
    /Today$/i,
  ]
  
  for (const pattern of metadataPatterns) {
    const match = cleaned.search(pattern)
    if (match > 0 && match < cleaned.length * 0.8) {
      // If metadata appears before 80% of the string, truncate there
      cleaned = cleaned.substring(0, match).trim()
      break
    }
  }
  
  // Remove trailing special characters and common words
  cleaned = cleaned.replace(/[^\w\s()[\]-]+$/g, "").trim()
  cleaned = cleaned.replace(/\s+(View|Courses?|Years?|Today|Graduation)$/gi, "").trim()
  
  return cleaned || name
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await db
    .select({
      course: courses,
      college: colleges,
    })
    .from(courses)
    .leftJoin(colleges, eq(courses.collegeId, colleges.id))
    .where(eq(courses.slug, slug))
    .limit(1)

  if (course.length === 0) {
    return {
      title: "Course Not Found | SeeMyCampus",
    }
  }

  return generateCourseMeta(course[0].course, course[0].college)
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const { slug } = await params
  const { page } = await searchParams
  const currentPage = parseInt(page || "1", 10)
  const limit = 10
  const offset = (currentPage - 1) * limit

  const result = await db
    .select({
      course: courses,
      college: colleges,
    })
    .from(courses)
    .leftJoin(colleges, eq(courses.collegeId, colleges.id))
    .where(eq(courses.slug, slug))
    .limit(1)

  if (result.length === 0) {
    // Check if this is a menu course slug - if so, show a search/listing page
    const menuCourse = await db
      .select()
      .from(menuCourses)
      .where(eq(menuCourses.slug, slug))
      .limit(1)

    if (menuCourse.length > 0) {
      // This is a menu course, show a listing page for courses matching this name
      const matchingCourses = await db
        .select({
          course: courses,
          college: colleges,
        })
        .from(courses)
        .leftJoin(colleges, eq(courses.collegeId, colleges.id))
        .where(ilike(courses.name, `%${menuCourse[0].name}%`))
        .limit(20)

      // If no courses found, find colleges that offer courses matching this menu course name
      if (matchingCourses.length === 0) {
        // Get all courses matching the menu course name with their colleges
        const coursesWithColleges = await db
          .select({
            course: courses,
            college: colleges,
          })
          .from(courses)
          .innerJoin(colleges, eq(courses.collegeId, colleges.id))
          .where(ilike(courses.name, `%${menuCourse[0].name}%`))

        // Get unique colleges (using a Map to deduplicate by college ID)
        const uniqueCollegesMap = new Map<number, typeof colleges.$inferSelect>()
        coursesWithColleges.forEach(({ college }) => {
          if (!uniqueCollegesMap.has(college.id)) {
            uniqueCollegesMap.set(college.id, college)
          }
        })

        const allCollegesList = Array.from(uniqueCollegesMap.values())
        const totalCount = allCollegesList.length
        const totalPages = Math.ceil(totalCount / limit)
        const collegesList = allCollegesList.slice(offset, offset + limit)

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
            <div className="container mx-auto px-4 py-12">
              {/* Breadcrumb */}
              <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <span className="text-gray-400">/</span>
                <Link href="/colleges" className="hover:text-blue-600 transition-colors">Colleges</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">{menuCourse[0].name}</span>
              </div>

              {/* Header Section */}
              <div className="mb-12">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium text-sm">College Directory</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                  Colleges Offering {menuCourse[0].name}
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl">
                  Browse colleges offering {menuCourse[0].name} courses across India
                </p>
              </div>

            {/* Colleges Grid - Modern Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {collegesList.map((college, index) => {
                const collegeCourses = coursesWithColleges
                  .filter(({ college: c }) => c.id === college.id)
                  .map(({ course }) => course)

                const gradients = [
                  "from-blue-500 to-cyan-600",
                  "from-indigo-500 to-purple-600",
                  "from-violet-500 to-purple-600",
                  "from-teal-500 to-emerald-600",
                  "from-sky-500 to-blue-600",
                  "from-purple-500 to-pink-600",
                ]
                const gradient = gradients[index % gradients.length]

                return (
                  <div
                    key={college.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 overflow-hidden group"
                  >
                    {/* Card Header with Gradient */}
                    <div className={`bg-gradient-to-br ${gradient} p-6 relative`}>
                      <div className="absolute top-4 right-4 opacity-20">
                        <Building2 className="h-16 w-16 text-white" />
                      </div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 flex-shrink-0">
                          <CollegeLogo
                            collegeId={college.id}
                            collegeName={college.name}
                            imageUrl={college.images && college.images.length > 0 ? college.images[0] : null}
                            size="sm"
                            variant="rounded"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/colleges/${college.slug}`}>
                            <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:underline">
                              {college.name}
                            </h3>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          {college.location || college.city || "Location not specified"}
                        </span>
                      </div>
                      
                      {/* Courses */}
                      {collegeCourses.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Available Courses:</p>
                          <div className="flex flex-wrap gap-2">
                            {collegeCourses.slice(0, 3).map((course) => (
                              <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                              >
                                {cleanCourseNameForDisplay(course.name)}
                              </Link>
                            ))}
                            {collegeCourses.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{collegeCourses.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* View Button */}
                      <Link href={`/colleges/${college.slug}`} className="block">
                        <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}>
                          View College Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <PaginationWrapper
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </div>
        </div>
        )
      }

      // If courses found, show them in a modern card layout
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/colleges" className="hover:text-blue-600 transition-colors">Colleges</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{menuCourse[0].name}</span>
            </div>

            {/* Header Section */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium text-sm">Course Directory</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                {menuCourse[0].name} Courses
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                Find {menuCourse[0].name} courses at various colleges across India
              </p>
            </div>

            {/* Courses Grid - Modern Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {matchingCourses.map(({ course, college }, index) => {
                const gradients = [
                  "from-blue-500 to-cyan-600",
                  "from-indigo-500 to-purple-600",
                  "from-violet-500 to-purple-600",
                  "from-teal-500 to-emerald-600",
                  "from-sky-500 to-blue-600",
                  "from-purple-500 to-pink-600",
                ]
                const gradient = gradients[index % gradients.length]

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 overflow-hidden group"
                  >
                    {/* Card Header with Gradient */}
                    <div className={`bg-gradient-to-br ${gradient} p-6 relative`}>
                      <div className="absolute top-4 right-4 opacity-20">
                        <GraduationCap className="h-16 w-16 text-white" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={course.name}>
                          {cleanCourseNameForDisplay(course.name)}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {college && (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              <CollegeLogo
                                collegeId={college.id}
                                collegeName={college.name}
                                imageUrl={college.images && college.images.length > 0 ? college.images[0] : null}
                                size="sm"
                                variant="rounded"
                                className="rounded-lg"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/colleges/${college.slug}`} className="hover:text-blue-600 transition-colors">
                                <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600">
                                  {college.name}
                                </p>
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">
                              {college.location || college.city || "Location not specified"}
                            </span>
                          </div>
                        </>
                      )}

                      {/* View Button */}
                      <Link href={`/courses/${course.slug}`} className="block">
                        <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}>
                          View Course Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    } else {
      notFound()
    }
  }

  const { course, college } = result[0]
  const structuredData = generateStructuredDataCourse(course, college)

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-8">
        <Link href={college ? `/colleges/${college.slug}` : "/colleges"}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {college ? college.name : "Colleges"}
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{course.name}</h1>
          {college && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-5 w-5" />
              <Link
                href={`/colleges/${college.slug}`}
                className="hover:underline"
              >
                {college.name}
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {course.description && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.level && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Level</p>
                      <p className="text-sm text-muted-foreground capitalize">{course.level}</p>
                    </div>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{course.duration}</p>
                    </div>
                  </div>
                )}
                {course.fees && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-muted-foreground">₹</span>
                    <div>
                      <p className="text-sm font-medium">Fees</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(course.fees, course.feesCurrency || "INR")}
                      </p>
                    </div>
                  </div>
                )}
                {course.studyMode && (
                  <div>
                    <p className="text-sm font-medium mb-1">Study Mode</p>
                    <p className="text-sm text-muted-foreground capitalize">{course.studyMode}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
