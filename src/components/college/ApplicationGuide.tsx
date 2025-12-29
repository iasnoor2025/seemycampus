"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, Calendar, DollarSign, ExternalLink, Lightbulb, Phone, Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApplicationGuide {
  id: number
  collegeId: number
  courseId: number | null
  guideContent: string
  requiredDocs: string[]
  feeInfo: {
    amount?: number
    currency?: string
    paymentMethods?: string[]
    paymentLink?: string
  } | null
  deadlines: {
    applicationStart?: string
    applicationEnd?: string
    documentSubmission?: string
    [key: string]: any
  } | null
  tips: string | null
  applicationUrl: string | null
  contactInfo: {
    phone?: string
    email?: string
    helpline?: string
    [key: string]: any
  } | null
  course?: {
    name: string
    slug: string
  } | null
}

interface ApplicationGuideProps {
  collegeSlug: string
  courseId?: number | null
}

export function ApplicationGuide({ collegeSlug, courseId }: ApplicationGuideProps) {
  const [guides, setGuides] = useState<ApplicationGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGuide, setSelectedGuide] = useState<ApplicationGuide | null>(null)

  useEffect(() => {
    fetchGuides()
  }, [collegeSlug, courseId])

  const fetchGuides = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (courseId) {
        params.set("courseId", courseId.toString())
      }

      const response = await fetch(`/api/colleges/${collegeSlug}/application-guides?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const guidesList = data.guides || []
        setGuides(guidesList.map((g: any) => g.guide ? { ...g.guide, course: g.course } : g))
        if (guidesList.length > 0) {
          setSelectedGuide(guidesList[0].guide ? { ...guidesList[0].guide, course: guidesList[0].course } : guidesList[0])
        }
      }
    } catch (error) {
      console.error("Error fetching application guides:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading application guide...</span>
        </CardContent>
      </Card>
    )
  }

  if (guides.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Application Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No application guide available for this college yet.</p>
        </CardContent>
      </Card>
    )
  }

  const guide = selectedGuide || guides[0]

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Application Guide</CardTitle>
            {guide.course && (
              <CardDescription className="mt-1">
                For {guide.course.name}
              </CardDescription>
            )}
          </div>
          {guides.length > 1 && (
            <div className="flex gap-2">
              {guides.map((g) => (
                <Button
                  key={g.id}
                  variant={selectedGuide?.id === g.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGuide(g)}
                >
                  {g.course?.name || "General"}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application URL */}
        {guide.applicationUrl && (
          <div>
            <Button asChild className="w-full">
              <a href={guide.applicationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </a>
            </Button>
          </div>
        )}

        {/* Application Fee Information */}
        {guide.feeInfo && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Application Fee</h3>
            </div>
            {guide.feeInfo.amount && (
              <div className="text-2xl font-bold mb-2">
                {guide.feeInfo.currency || "₹"}{guide.feeInfo.amount.toLocaleString()}
              </div>
            )}
            {guide.feeInfo.paymentMethods && guide.feeInfo.paymentMethods.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium">Payment Methods: </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {guide.feeInfo.paymentMethods.map((method, idx) => (
                    <Badge key={idx} variant="secondary">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {guide.feeInfo.paymentLink && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a href={guide.feeInfo.paymentLink} target="_blank" rel="noopener noreferrer">
                  Pay Application Fee
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Important Deadlines */}
        {guide.deadlines && Object.keys(guide.deadlines).length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Important Deadlines</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(guide.deadlines).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span className="text-sm">
                    {typeof value === "string" ? new Date(value).toLocaleDateString() : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {guide.requiredDocs && guide.requiredDocs.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Required Documents</h3>
            </div>
            <div className="space-y-2">
              {guide.requiredDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Guide Content */}
        {guide.guideContent && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Step-by-Step Guide</h3>
            <div className="prose prose-sm max-w-none">
              {guide.guideContent.split("\n").map((paragraph, idx) => (
                paragraph.trim() && (
                  <p key={idx} className="mb-3 text-gray-700 whitespace-pre-line">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {guide.tips && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Tips & Common Mistakes</div>
              <div className="text-sm whitespace-pre-line">{guide.tips}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Information */}
        {guide.contactInfo && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Need Help?</h3>
            <div className="space-y-2">
              {guide.contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <a href={`tel:${guide.contactInfo.phone}`} className="text-sm hover:underline">
                    {guide.contactInfo.phone}
                  </a>
                </div>
              )}
              {guide.contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <a href={`mailto:${guide.contactInfo.email}`} className="text-sm hover:underline">
                    {guide.contactInfo.email}
                  </a>
                </div>
              )}
              {guide.contactInfo.helpline && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Helpline: {guide.contactInfo.helpline}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

