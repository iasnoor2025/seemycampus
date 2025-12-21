import { notFound } from "next/navigation"
import { getCollegeWithCourses } from "@/lib/colleges"
import { CollegeHero } from "@/components/college/CollegeHero"
import { CourseCard } from "@/components/course/CourseCard"
import { Metadata } from "next"
import { generateCollegeMeta, generateStructuredDataCollege } from "@/lib/seo/generateMeta"

interface CollegePageProps {
  params: {
    slug: string
  }
}

async function getCollegeBySlug(slug: string) {
  const { getCollegeBySlug } = await import("@/lib/colleges")
  return getCollegeBySlug(slug)
}

export async function generateMetadata({ params }: CollegePageProps): Promise<Metadata> {
  const college = await getCollegeBySlug(params.slug)
  
  if (!college) {
    return {
      title: "College Not Found | SeeMyCampus",
    }
  }

  return generateCollegeMeta(college)
}

export default async function CollegePage({ params }: CollegePageProps) {
  const collegeData = await getCollegeWithCourses(params.slug)

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
