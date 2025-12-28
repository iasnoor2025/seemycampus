"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Building2, Award, Calendar, ArrowRight } from "lucide-react"

interface RelatedCollege {
  id: number
  name: string
  slug: string
  location?: string | null
  city?: string | null
}

interface RelatedCourse {
  id: number
  name: string
  slug: string
  level?: string | null
}

interface RelatedScholarship {
  id: number
  title: string
  slug: string
  amount?: number | null
}

interface RelatedExam {
  id: number
  name: string
  slug: string
}

interface RelatedContentProps {
  relatedColleges?: RelatedCollege[]
  relatedCourses?: RelatedCourse[]
  relatedScholarships?: RelatedScholarship[]
  relatedExams?: RelatedExam[]
  currentLocation?: string | null
  currentCity?: string | null
  currentCategory?: string | null
}

export function RelatedContent({
  relatedColleges,
  relatedCourses,
  relatedScholarships,
  relatedExams,
  currentLocation,
  currentCity,
  currentCategory,
}: RelatedContentProps) {
  const hasContent = 
    (relatedColleges && relatedColleges.length > 0) ||
    (relatedCourses && relatedCourses.length > 0) ||
    (relatedScholarships && relatedScholarships.length > 0) ||
    (relatedExams && relatedExams.length > 0)

  if (!hasContent) return null

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Related Content</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Related Colleges */}
        {relatedColleges && relatedColleges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Similar Colleges
                {currentLocation && (
                  <span className="text-sm font-normal text-gray-500">
                    in {currentCity || currentLocation}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {relatedColleges.slice(0, 5).map((college) => (
                  <li key={college.id}>
                    <Link
                      href={`/colleges/${college.slug}`}
                      className="flex items-center justify-between group hover:text-blue-600 transition-colors"
                    >
                      <span className="text-sm">{college.name}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
              {relatedColleges.length > 5 && (
                <Link href="/colleges">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Colleges
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Related Courses */}
        {relatedCourses && relatedCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-green-600" />
                Related Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {relatedCourses.slice(0, 5).map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex items-center justify-between group hover:text-green-600 transition-colors"
                    >
                      <span className="text-sm">
                        {course.name}
                        {course.level && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({course.level})
                          </span>
                        )}
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
              {relatedCourses.length > 5 && (
                <Link href="/courses">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Courses
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Related Scholarships */}
        {relatedScholarships && relatedScholarships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                Available Scholarships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {relatedScholarships.slice(0, 5).map((scholarship) => (
                  <li key={scholarship.id}>
                    <Link
                      href={`/scholarships/${scholarship.slug}`}
                      className="flex items-center justify-between group hover:text-yellow-600 transition-colors"
                    >
                      <span className="text-sm">{scholarship.title}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/scholarships">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Scholarships
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Related Entrance Exams */}
        {relatedExams && relatedExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                Required Entrance Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {relatedExams.slice(0, 5).map((exam) => (
                  <li key={exam.id}>
                    <Link
                      href={`/entrance-exams/${exam.slug}`}
                      className="flex items-center justify-between group hover:text-purple-600 transition-colors"
                    >
                      <span className="text-sm">{exam.name}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/entrance-exams">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Admission Timeline
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

