import { notFound } from "next/navigation"
import { db } from "@/db"
import { courses, colleges, menuCourses } from "@/db/schema"
import { eq, ilike } from "drizzle-orm"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, GraduationCap, DollarSign, MapPin, ArrowLeft } from "lucide-react"
import { Metadata } from "next"
import { generateCourseMeta, generateStructuredDataCourse } from "@/lib/seo/generateMeta"
import { CollegePagination } from "@/components/colleges/CollegePagination"
import Image from "next/image"

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
          <div className="min-h-screen bg-red-600">
            <div className="max-w-5xl mx-auto bg-white min-h-screen py-8">
              {/* Breadcrumb */}
              <div className="px-6 mb-6 flex items-center gap-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
                <span className="text-gray-400">/</span>
                <Link href="/colleges" className="hover:text-red-600 transition-colors">Colleges</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900">{menuCourse[0].name}</span>
              </div>

              <div className="px-6 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Colleges Offering {menuCourse[0].name}
                </h1>
                <p className="text-gray-600">
                  Browse colleges offering {menuCourse[0].name} courses
                </p>
              </div>

              {/* Table Header */}
              <div className="px-6 mb-4">
                <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
                  <div className="col-span-2 text-center">PREVIEW</div>
                  <div className="col-span-4">COLLEGE NAME</div>
                  <div className="col-span-2">LOCATION</div>
                  <div className="col-span-3">COURSES</div>
                  <div className="col-span-1 text-center">VIEW</div>
                </div>
              </div>

              <div className="space-y-0">
                {collegesList.map((college, index) => {
                  // Get courses for this college that match the menu course name
                  const collegeCourses = coursesByCollege
                    .filter(({ college: c }) => c.id === college.id)
                    .map(({ course }) => course)

                  return (
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
                      <div className="col-span-4">
                        <Link href={`/colleges/${college.slug}`} className="hover:text-red-600 transition-colors">
                          <h3 className="text-base font-semibold text-gray-900">
                            {college.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Location */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">
                          {college.location || college.city || "Location not specified"}
                        </p>
                      </div>

                      {/* Courses */}
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-1">
                          {collegeCourses.slice(0, 2).map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.slug}`}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              {course.name}
                            </Link>
                          ))}
                          {collegeCourses.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{collegeCourses.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Button */}
                      <div className="col-span-1 flex justify-center">
                        <Link href={`/colleges/${college.slug}`}>
                          <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs">
                            VIEW
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              <div className="px-6">
                <CollegePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            </div>
          </div>
        )
      }

      // If courses found, show them in a table
      return (
        <div className="min-h-screen bg-red-600">
          <div className="max-w-5xl mx-auto bg-white min-h-screen py-8">
            {/* Breadcrumb */}
            <div className="px-6 mb-6 flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/colleges" className="hover:text-red-600 transition-colors">Colleges</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">{menuCourse[0].name}</span>
            </div>

            <div className="px-6 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {menuCourse[0].name} Courses
              </h1>
              <p className="text-gray-600">
                Find {menuCourse[0].name} courses at various colleges
              </p>
            </div>

            {/* Table Header */}
            <div className="px-6 mb-4">
              <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
                <div className="col-span-5">COURSE NAME</div>
                <div className="col-span-4">COLLEGE</div>
                <div className="col-span-2">LOCATION</div>
                <div className="col-span-1 text-center">VIEW</div>
              </div>
            </div>

            <div className="space-y-0">
              {matchingCourses.map(({ course, college }, index) => (
                <div
                  key={course.id}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                    index !== matchingCourses.length - 1 ? "border-b border-gray-200" : ""
                  } hover:bg-gray-50 transition-colors`}
                >
                  {/* Course Name */}
                  <div className="col-span-5">
                    <Link href={`/courses/${course.slug}`} className="hover:text-red-600 transition-colors">
                      <h3 className="text-base font-semibold text-gray-900">
                        {course.name}
                      </h3>
                    </Link>
                  </div>

                  {/* College Name */}
                  <div className="col-span-4">
                    {college ? (
                      <Link href={`/colleges/${college.slug}`} className="hover:text-red-600 transition-colors">
                        <p className="text-sm text-gray-700">{college.name}</p>
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-500">N/A</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700">
                      {college?.location || college?.city || "N/A"}
                    </p>
                  </div>

                  {/* View Button */}
                  <div className="col-span-1 flex justify-center">
                    <Link href={`/courses/${course.slug}`}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs">
                        VIEW
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    notFound()
  }

  const { course, college } = result[0]
  const structuredData = generateStructuredDataCourse(course, college)

  const formatCurrency = (amount: number, currency: string) => {
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
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
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
