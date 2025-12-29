"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApplicationGuide {
  id?: number
  collegeId: number
  courseId?: number | null
  guideContent: string
  requiredDocs: string[]
  feeInfo?: {
    amount?: number
    currency?: string
    paymentMethods?: string[]
    paymentLink?: string
  } | null
  deadlines?: {
    applicationStart?: string
    applicationEnd?: string
    documentSubmission?: string
    [key: string]: any
  } | null
  tips?: string | null
  applicationUrl?: string | null
  contactInfo?: {
    phone?: string
    email?: string
    helpline?: string
    [key: string]: any
  } | null
}

interface Course {
  id: number
  name: string
}

interface ApplicationGuideFormProps {
  guide?: ApplicationGuide | null
  collegeId: number
  collegeSlug: string
  onClose: () => void
  onSuccess: () => void
}

export function ApplicationGuideForm({
  guide,
  collegeId,
  collegeSlug,
  onClose,
  onSuccess,
}: ApplicationGuideFormProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    courseId: guide?.courseId?.toString() || "",
    guideContent: guide?.guideContent || "",
    requiredDocs: guide?.requiredDocs || [] as string[],
    feeAmount: guide?.feeInfo?.amount?.toString() || "",
    feeCurrency: guide?.feeInfo?.currency || "INR",
    paymentMethods: guide?.feeInfo?.paymentMethods || [] as string[],
    paymentLink: guide?.feeInfo?.paymentLink || "",
    applicationStart: guide?.deadlines?.applicationStart || "",
    applicationEnd: guide?.deadlines?.applicationEnd || "",
    documentSubmission: guide?.deadlines?.documentSubmission || "",
    tips: guide?.tips || "",
    applicationUrl: guide?.applicationUrl || "",
    contactPhone: guide?.contactInfo?.phone || "",
    contactEmail: guide?.contactInfo?.email || "",
    contactHelpline: guide?.contactInfo?.helpline || "",
  })
  const [newDoc, setNewDoc] = useState("")
  const [newPaymentMethod, setNewPaymentMethod] = useState("")

  // Get selected course name for display
  const selectedCourseName = formData.courseId 
    ? courses.find((c) => c.id.toString() === formData.courseId)?.name 
    : null

  useEffect(() => {
    if (collegeId) {
      fetchCourses()
    }
  }, [collegeId])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/dashboard/courses?collegeId=${collegeId}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const feeInfo: any = {}
      if (formData.feeAmount) {
        feeInfo.amount = parseInt(formData.feeAmount)
        feeInfo.currency = formData.feeCurrency
        if (formData.paymentMethods.length > 0) {
          feeInfo.paymentMethods = formData.paymentMethods
        }
        if (formData.paymentLink) {
          feeInfo.paymentLink = formData.paymentLink
        }
      }

      const deadlines: any = {}
      if (formData.applicationStart) deadlines.applicationStart = formData.applicationStart
      if (formData.applicationEnd) deadlines.applicationEnd = formData.applicationEnd
      if (formData.documentSubmission) deadlines.documentSubmission = formData.documentSubmission

      const contactInfo: any = {}
      if (formData.contactPhone) contactInfo.phone = formData.contactPhone
      if (formData.contactEmail) contactInfo.email = formData.contactEmail
      if (formData.contactHelpline) contactInfo.helpline = formData.contactHelpline

      const payload = {
        courseId: formData.courseId ? parseInt(formData.courseId) : null,
        guideContent: formData.guideContent,
        requiredDocs: formData.requiredDocs,
        feeInfo: Object.keys(feeInfo).length > 0 ? feeInfo : null,
        deadlines: Object.keys(deadlines).length > 0 ? deadlines : null,
        tips: formData.tips || null,
        applicationUrl: formData.applicationUrl || null,
        contactInfo: Object.keys(contactInfo).length > 0 ? contactInfo : null,
      }

      const url = guide?.id
        ? `/api/application-guides/${guide.id}`
        : `/api/colleges/${collegeSlug}/application-guides`

      const method = guide?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save application guide")
      }
    } catch (error) {
      console.error("Error saving application guide:", error)
      setError("Failed to save application guide")
    } finally {
      setLoading(false)
    }
  }

  const addDocument = () => {
    if (newDoc.trim()) {
      setFormData({
        ...formData,
        requiredDocs: [...formData.requiredDocs, newDoc.trim()],
      })
      setNewDoc("")
    }
  }

  const removeDocument = (index: number) => {
    setFormData({
      ...formData,
      requiredDocs: formData.requiredDocs.filter((_, i) => i !== index),
    })
  }

  const addPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      setFormData({
        ...formData,
        paymentMethods: [...formData.paymentMethods, newPaymentMethod.trim()],
      })
      setNewPaymentMethod("")
    }
  }

  const removePaymentMethod = (index: number) => {
    setFormData({
      ...formData,
      paymentMethods: formData.paymentMethods.filter((_, i) => i !== index),
    })
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{guide ? "Edit Application Guide" : "Create Application Guide"}</CardTitle>
        <CardDescription>
          Provide step-by-step application instructions and requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="courseId">Course (Optional - leave empty for general guide)</Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => setFormData({ ...formData, courseId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course (optional)">
                  {(value: string | null) => {
                    if (!value || value === "") return "Select course (optional)"
                    const course = courses.find((c) => c.id.toString() === value)
                    return course?.name || "Select course (optional)"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General (All Courses)</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="guideContent">Step-by-Step Guide *</Label>
            <Textarea
              id="guideContent"
              value={formData.guideContent}
              onChange={(e) => setFormData({ ...formData, guideContent: e.target.value })}
              placeholder="Enter step-by-step application instructions..."
              rows={10}
              required
            />
          </div>

          <div>
            <Label>Required Documents</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newDoc}
                onChange={(e) => setNewDoc(e.target.value)}
                placeholder="e.g., 10th Marksheet, 12th Marksheet"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDocument())}
              />
              <Button type="button" onClick={addDocument} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.requiredDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{doc}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feeAmount">Application Fee Amount</Label>
              <Input
                id="feeAmount"
                type="number"
                value={formData.feeAmount}
                onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <Label htmlFor="feeCurrency">Currency</Label>
              <Select
                value={formData.feeCurrency}
                onValueChange={(value) => setFormData({ ...formData, feeCurrency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Payment Methods</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                placeholder="e.g., Online, Credit Card, Debit Card"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPaymentMethod())}
              />
              <Button type="button" onClick={addPaymentMethod} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.paymentMethods.map((method, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                  <span className="text-sm">{method}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePaymentMethod(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="paymentLink">Payment Link</Label>
            <Input
              id="paymentLink"
              type="url"
              value={formData.paymentLink}
              onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="applicationStart">Application Start Date</Label>
              <Input
                id="applicationStart"
                type="date"
                value={formData.applicationStart}
                onChange={(e) => setFormData({ ...formData, applicationStart: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="applicationEnd">Application End Date</Label>
              <Input
                id="applicationEnd"
                type="date"
                value={formData.applicationEnd}
                onChange={(e) => setFormData({ ...formData, applicationEnd: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="documentSubmission">Document Submission Deadline</Label>
              <Input
                id="documentSubmission"
                type="date"
                value={formData.documentSubmission}
                onChange={(e) => setFormData({ ...formData, documentSubmission: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="applicationUrl">Application Form URL</Label>
            <Input
              id="applicationUrl"
              type="url"
              value={formData.applicationUrl}
              onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="tips">Tips & Common Mistakes</Label>
            <Textarea
              id="tips"
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Enter helpful tips and common mistakes to avoid..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91..."
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="admissions@college.edu"
              />
            </div>
            <div>
              <Label htmlFor="contactHelpline">Helpline</Label>
              <Input
                id="contactHelpline"
                value={formData.contactHelpline}
                onChange={(e) => setFormData({ ...formData, contactHelpline: e.target.value })}
                placeholder="1800-XXX-XXXX"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : guide ? "Update Guide" : "Create Guide"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

