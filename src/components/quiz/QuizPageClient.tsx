"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleContactForm } from "@/components/quiz/SimpleContactForm"
import { QuizForm } from "@/components/quiz/QuizForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export function QuizPageClient() {
  const [contactFormSubmitted, setContactFormSubmitted] = useState<boolean>(false)
  const [showQuiz, setShowQuiz] = useState<boolean>(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const checkContactForm = async () => {
      const submitted = localStorage.getItem("contactFormSubmitted") === "true"
      const storedEmail = localStorage.getItem("contactFormEmail")
      
      if (submitted && storedEmail) {
        // Verify the lead actually exists in database
        try {
          const response = await fetch(`/api/leads?email=${encodeURIComponent(storedEmail)}`)
          if (response.ok) {
            const data = await response.json()
            // If lead exists, show quiz
            if (data.leads && data.leads.length > 0) {
              setContactFormSubmitted(true)
              setShowQuiz(true)
              return
            }
          }
        } catch (error) {
          console.error("Error checking lead:", error)
        }
      }
      
      // If no valid lead found, clear localStorage and show contact form
      if (submitted) {
        localStorage.removeItem("contactFormSubmitted")
        localStorage.removeItem("contactFormEmail")
        localStorage.removeItem("contactFormPhone")
        localStorage.removeItem("contactFormName")
      }
      
      setContactFormSubmitted(false)
      setShowQuiz(false)
    }
    
    checkContactForm()
  }, [])

  const handleContactFormSubmit = () => {
    setContactFormSubmitted(true)
    setShowQuiz(true)
    // Store in localStorage
    localStorage.setItem("contactFormSubmitted", "true")
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show quiz form if contact form is already submitted
  if (showQuiz) {
    return <QuizForm />
  }

  // Show contact form first
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Find Your Perfect College</CardTitle>
            <CardDescription className="text-lg">
              First, let's get your contact information, then we'll start the quiz to discover colleges that match your interests, budget, and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Step 1: Your Information</AlertTitle>
              <AlertDescription className="text-blue-700">
                Please provide your name, email, and mobile number to start the quiz.
              </AlertDescription>
            </Alert>

            <div className="pt-4">
              <SimpleContactForm onSuccess={handleContactFormSubmit} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

