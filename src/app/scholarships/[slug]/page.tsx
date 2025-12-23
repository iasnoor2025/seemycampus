import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Calendar, DollarSign, GraduationCap, Building2, Mail, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { baseUrl } from "@/lib/seo/generateMeta"

interface ScholarshipPageProps {
  params: Promise<{ slug: string }>
}

async function getScholarship(slug: string) {
  try {
    const response = await fetch(`${baseUrl}/api/scholarships/${slug}`, {
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
}: ScholarshipPageProps): Promise<Metadata> {
  const { slug } = await params
  const scholarship = await getScholarship(slug)

  if (!scholarship) {
    return {
      title: "Scholarship Not Found",
    }
  }

  return {
    title: `${scholarship.title} | Scholarships`,
    description: scholarship.description || `Learn more about ${scholarship.title} scholarship`,
    openGraph: {
      title: scholarship.title,
      description: scholarship.description || "",
      url: `${baseUrl}/scholarships/${slug}`,
    },
    alternates: {
      canonical: `${baseUrl}/scholarships/${slug}`,
    },
  }
}

export default async function ScholarshipPage({ params }: ScholarshipPageProps) {
  const { slug } = await params
  const scholarship = await getScholarship(slug)

  if (!scholarship) {
    notFound()
  }

  const formatAmount = () => {
    if (!scholarship.amount) return "Amount not specified"
    
    const currency = scholarship.amountCurrency === "INR" ? "₹" : scholarship.amountCurrency
    const amount = scholarship.amount.toLocaleString()
    
    if (scholarship.amountType === "percentage") {
      return `${amount}%`
    } else if (scholarship.amountType === "full_tuition") {
      return "Full Tuition Coverage"
    } else {
      return `${currency}${amount}`
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    try {
      return format(new Date(dateString), "MMMM dd, yyyy")
    } catch {
      return "Not specified"
    }
  }

  const isDeadlinePassed = () => {
    if (!scholarship.applicationDeadline) return false
    try {
      return new Date(scholarship.applicationDeadline) < new Date()
    } catch {
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {scholarship.title}
            </h1>
            {scholarship.provider && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-lg">{scholarship.provider}</span>
              </div>
            )}
            {isDeadlinePassed() && (
              <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                Application Deadline Passed
              </div>
            )}
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Scholarship Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatAmount()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold capitalize">
                  {scholarship.level || "Not specified"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Application Deadline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-lg font-semibold ${isDeadlinePassed() ? "text-red-600" : ""}`}>
                  {formatDate(scholarship.applicationDeadline)}
                </p>
              </CardContent>
            </Card>

            {scholarship.category && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium capitalize">
                    {scholarship.category.replace("-", " ")}
                  </span>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {scholarship.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{scholarship.description}</p>
            </div>
          )}

          {/* Eligibility Criteria */}
          {scholarship.eligibilityCriteria && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Eligibility Criteria
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {scholarship.eligibilityCriteria}
                </p>
              </div>
            </div>
          )}

          {/* Application Dates */}
          {(scholarship.applicationStartDate || scholarship.applicationDeadline) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Application Timeline
              </h2>
              <div className="space-y-2">
                {scholarship.applicationStartDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      <strong>Application Opens:</strong> {formatDate(scholarship.applicationStartDate)}
                    </span>
                  </div>
                )}
                {scholarship.applicationDeadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className={`text-gray-700 ${isDeadlinePassed() ? "text-red-600 font-medium" : ""}`}>
                      <strong>Application Deadline:</strong> {formatDate(scholarship.applicationDeadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(scholarship.contactEmail || scholarship.contactPhone) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Information
              </h2>
              <div className="space-y-2">
                {scholarship.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${scholarship.contactEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {scholarship.contactEmail}
                    </a>
                  </div>
                )}
                {scholarship.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${scholarship.contactPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {scholarship.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Button */}
          {scholarship.applicationUrl && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full">
                  Apply Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          )}

          {/* Related College */}
          {scholarship.college && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Related College
              </h3>
              <a
                href={`/colleges/${scholarship.college.slug}`}
                className="text-blue-600 hover:underline"
              >
                {scholarship.college.name}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

