"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, CheckCircle2, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface InquiryFormProps {
  collegeSlug: string
  collegeName: string
}

export function InquiryForm({ collegeSlug, collegeName }: InquiryFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    inquiryType: "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/colleges/${collegeSlug}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({
          inquiryType: "",
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          phone: "",
          message: "",
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit inquiry")
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error)
      setError("Failed to submit inquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Inquiry Submitted Successfully!</h3>
          <p className="text-muted-foreground text-center mb-4">
            We've received your inquiry and will get back to you soon.
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline">
            Submit Another Inquiry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>Contact {collegeName}</CardTitle>
        </div>
        <CardDescription>
          Have questions? Send us an inquiry and we'll get back to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="inquiryType">Inquiry Type *</Label>
            <Select
              value={formData.inquiryType}
              onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inquiry type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="course">Course Information</SelectItem>
                <SelectItem value="fee">Fee Structure</SelectItem>
                <SelectItem value="scholarship">Scholarship</SelectItem>
                <SelectItem value="general">General Inquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91..."
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please provide details about your inquiry..."
              rows={6}
              required
              minLength={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 characters required
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

