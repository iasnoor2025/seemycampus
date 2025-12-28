"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Building, MapPin, Pencil, Phone, Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classYear: "",
    boardUniversity: "",
    contactNumber: "",
    city: "",
    interestedCourses: "",
    entranceExam: "",
    examScore: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Prepare lead data
      const leadData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.contactNumber || undefined,
        source: "form" as const,
        quizData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          classYear: formData.classYear,
          boardUniversity: formData.boardUniversity,
          city: formData.city,
          interestedCourses: formData.interestedCourses,
          entranceExam: formData.entranceExam,
          examScore: formData.examScore,
        },
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit form")
      }

      setSubmitStatus("success")
      toast({
        title: "Form submitted successfully!",
        description: "We'll get back to you soon.",
      })

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        classYear: "",
        boardUniversity: "",
        contactNumber: "",
        city: "",
        interestedCourses: "",
        entranceExam: "",
        examScore: "",
      })
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-white">
      <h3 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Class/Year */}
          <div className="space-y-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="classYear"
                placeholder="Class/Year"
                value={formData.classYear}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Board/University */}
          <div className="space-y-2">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="boardUniversity"
                placeholder="Board/University"
                value={formData.boardUniversity}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Your City */}
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="city"
                placeholder="Your City"
                value={formData.city}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Interested Courses */}
          <div className="space-y-2">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="interestedCourses"
                placeholder="Interested Courses"
                value={formData.interestedCourses}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Any Entrance Exam Taken up */}
          <div className="space-y-2">
            <div className="relative">
              <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="entranceExam"
                placeholder="Any Entrance Exam Taken up"
                value={formData.entranceExam}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Score of Entrance Exam */}
          <div className="space-y-2">
            <div className="relative">
              <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="examScore"
                placeholder="Score of Entrance Exam"
                value={formData.examScore}
                onChange={handleChange}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === "success" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>Form submitted successfully! We'll get back to you soon.</span>
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to submit form. Please try again.</span>
          </div>
        )}
      </form>
    </div>
  )
}

