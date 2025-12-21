import { notFound } from "next/navigation"
import { db } from "@/db"
import { courses, colleges } from "@/db/schema"
import { eq } from "drizzle-orm"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, GraduationCap, DollarSign, MapPin, ArrowLeft } from "lucide-react"
import { Metadata } from "next"
import { generateCourseMeta, generateStructuredDataCourse } from "@/lib/seo/generateMeta"

interface CoursePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = await db
    .select({
      course: courses,
      college: colleges,
    })
    .from(courses)
    .leftJoin(colleges, eq(courses.collegeId, colleges.id))
    .where(eq(courses.slug, params.slug))
    .limit(1)

  if (course.length === 0) {
    return {
      title: "Course Not Found | SeeMyCampus",
    }
  }

  return generateCourseMeta(course[0].course, course[0].college)
}

export default async function CoursePage({ params }: CoursePageProps) {
  const result = await db
    .select({
      course: courses,
      college: colleges,
    })
    .from(courses)
    .leftJoin(colleges, eq(courses.collegeId, colleges.id))
    .where(eq(courses.slug, params.slug))
    .limit(1)

  if (result.length === 0) {
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
