import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Globe, BookOpen, Clock, ExternalLink, GraduationCap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateBreadcrumbList } from "@/lib/seo/generateMeta"
import { baseUrl } from "@/lib/constants"
import { ShareButton } from "@/components/ui/ShareButton"
import { RelatedContent } from "@/components/seo/RelatedContent"
import { getRelatedExams } from "@/lib/relatedContent"
import Link from "next/link"

interface EntranceExamPageProps {
  params: Promise<{ slug: string }>
}

async function getEntranceExam(slug: string) {
  try {
    const response = await fetch(`${baseUrl}/api/entrance-exams/${slug}`, {
      cache: "no-store",
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: EntranceExamPageProps): Promise<Metadata> {
  const { slug } = await params
  const exam = await getEntranceExam(slug)

  if (!exam) {
    return {
      title: "Entrance Exam Not Found",
    }
  }

  return {
    title: `${exam.name} 2024-25 | Entrance Exam Details | SeeMyCampus`,
    description: exam.description || `Complete information about ${exam.name} including exam dates, registration deadlines, eligibility criteria, and exam pattern.`,
    keywords: [exam.name, "entrance exam", "admission", "2024-25", exam.slug],
    openGraph: {
      title: `${exam.name} 2024-25`,
      description: exam.description || "",
      url: `${baseUrl}/entrance-exams/${slug}`,
    },
    alternates: {
      canonical: `${baseUrl}/entrance-exams/${slug}`,
    },
  }
}

export default async function EntranceExamPage({ params }: EntranceExamPageProps) {
  const { slug } = await params
  const exam = await getEntranceExam(slug)

  if (!exam) {
    notFound()
  }

  // Fetch related exams
  const relatedExams = await getRelatedExams([exam.name], 5)

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbList([
    { name: "Home", url: "/" },
    { name: "Admission Timeline", url: "/entrance-exams" },
    { name: exam.name, url: `/entrance-exams/${slug}` },
  ])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch {
      return "Not specified"
    }
  }

  const isRegistrationOpen = () => {
    if (!exam.registrationStartDate || !exam.registrationEndDate) return false
    const now = new Date()
    const start = new Date(exam.registrationStartDate)
    const end = new Date(exam.registrationEndDate)
    return now >= start && now <= end
  }

  const isRegistrationUpcoming = () => {
    if (!exam.registrationStartDate) return false
    const now = new Date()
    const start = new Date(exam.registrationStartDate)
    return now < start
  }

  const isRegistrationClosed = () => {
    if (!exam.registrationEndDate) return false
    const now = new Date()
    const end = new Date(exam.registrationEndDate)
    return now > end
  }

  const isExamPassed = () => {
    if (!exam.examDate) return false
    const now = new Date()
    const examDate = new Date(exam.examDate)
    return now > examDate
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {isRegistrationOpen() ? (
                    <Badge className="bg-green-500/20 backdrop-blur-sm text-white border-green-300/30">
                      Registration Open
                    </Badge>
                  ) : isRegistrationUpcoming() ? (
                    <Badge className="bg-blue-500/20 backdrop-blur-sm text-white border-blue-300/30">
                      Registration Upcoming
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 backdrop-blur-sm text-white border-gray-300/30">
                      Registration Closed
                    </Badge>
                  )}
                  {isExamPassed() && (
                    <Badge className="bg-red-500/20 backdrop-blur-sm text-white border-red-300/30">
                      Exam Date Passed
                    </Badge>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <ShareButton 
                    title={exam.name}
                    text={`Check out ${exam.name} entrance exam details on SeeMyCampus!`}
                  />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                {exam.name}
              </h1>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8">

          {/* Description */}
          {exam.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{exam.description}</p>
            </div>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Exam Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-lg font-semibold ${isExamPassed() ? "text-red-600" : ""}`}>
                  {formatDate(exam.examDate)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Registration Deadline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-lg font-semibold ${isRegistrationClosed() ? "text-red-600" : ""}`}>
                  {formatDate(exam.registrationEndDate)}
                </p>
              </CardContent>
            </Card>

            {exam.registrationStartDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Registration Starts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {formatDate(exam.registrationStartDate)}
                  </p>
                </CardContent>
              </Card>
            )}

            {exam.resultDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Result Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {formatDate(exam.resultDate)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Exam Pattern */}
          {exam.examPattern && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Exam Pattern
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {exam.examPattern}
                </p>
              </div>
            </div>
          )}

          {/* Eligibility Criteria */}
          {exam.eligibility && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Eligibility Criteria
              </h2>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 whitespace-pre-line">
                  {exam.eligibility}
                </p>
              </div>
            </div>
          )}

          {/* Important Dates Timeline */}
          {(exam.registrationStartDate || exam.registrationEndDate || exam.examDate || exam.resultDate) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Dates</h2>
              <div className="space-y-3">
                {exam.registrationStartDate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Registration Opens:</span>
                      <p className="font-semibold">{formatDate(exam.registrationStartDate)}</p>
                    </div>
                  </div>
                )}
                {exam.registrationEndDate && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isRegistrationClosed() ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
                    <Clock className={`h-5 w-5 ${isRegistrationClosed() ? "text-red-600" : "text-orange-600"}`} />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Registration Deadline:</span>
                      <p className={`font-semibold ${isRegistrationClosed() ? "text-red-600" : ""}`}>
                        {formatDate(exam.registrationEndDate)}
                      </p>
                    </div>
                  </div>
                )}
                {exam.examDate && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isExamPassed() ? "bg-gray-50" : "bg-green-50 border border-green-200"}`}>
                    <GraduationCap className={`h-5 w-5 ${isExamPassed() ? "text-gray-600" : "text-green-600"}`} />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Exam Date:</span>
                      <p className={`font-semibold ${isExamPassed() ? "text-gray-600" : "text-green-700"}`}>
                        {formatDate(exam.examDate)}
                      </p>
                    </div>
                  </div>
                )}
                {exam.resultDate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Result Date:</span>
                      <p className="font-semibold">{formatDate(exam.resultDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Official Website */}
          {exam.officialWebsite && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full">
                  Visit Official Website
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          )}

          {/* Related Content */}
          <RelatedContent
            relatedExams={relatedExams}
          />

          {/* Back to Timeline */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/entrance-exams">
              <Button variant="outline" className="w-full">
                ← Back to Admission Timeline
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

