"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QuizStep } from "./QuizStep"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { INTERESTS, STUDY_MODES, ACADEMIC_LEVELS, type QuizData } from "@/lib/quiz"
import { Checkbox } from "@/components/ui/checkbox"

const TOTAL_STEPS = 5

export function QuizForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<QuizData>>({
    interests: [],
    budgetCurrency: "INR",
  })

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const interests = prev.interests || []
      const newInterests = interests.includes(interest)
        ? interests.filter((i) => i !== interest)
        : [...interests, interest]
      return { ...prev, interests: newInterests }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      const data = await response.json()
      router.push(`/recommendations?quizId=${data.quizId}`)
    } catch (error) {
      console.error("Quiz submission error:", error)
      alert("Failed to submit quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (formData.interests?.length || 0) > 0
      case 2:
        return !!formData.preferredLocation
      case 3:
        return !!formData.budgetMin && !!formData.budgetMax && formData.budgetMin <= formData.budgetMax
      case 4:
        return !!formData.studyMode
      case 5:
        return !!formData.academicLevel
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Step 1: Interests */}
      {currentStep === 1 && (
        <QuizStep
          title="What are your interests?"
          description="Select all that apply"
          stepNumber={1}
          totalSteps={TOTAL_STEPS}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={formData.interests?.includes(interest)}
                    onCheckedChange={() => handleInterestToggle(interest)}
                  />
                  <Label
                    htmlFor={interest}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <div />
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            </div>
          </div>
        </QuizStep>
      )}

      {/* Step 2: Location */}
      {currentStep === 2 && (
        <QuizStep
          title="Preferred Location"
          description="Where would you like to study?"
          stepNumber={2}
          totalSteps={TOTAL_STEPS}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">City or State</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={formData.preferredLocation || ""}
                onChange={(e) =>
                  setFormData({ ...formData, preferredLocation: e.target.value })
                }
              />
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            </div>
          </div>
        </QuizStep>
      )}

      {/* Step 3: Budget */}
      {currentStep === 3 && (
        <QuizStep
          title="Budget Range"
          description="What's your budget for education?"
          stepNumber={3}
          totalSteps={TOTAL_STEPS}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Minimum (INR)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="0"
                  value={formData.budgetMin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budgetMin: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Maximum (INR)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="1000000"
                  value={formData.budgetMax || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budgetMax: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            </div>
          </div>
        </QuizStep>
      )}

      {/* Step 4: Study Mode */}
      {currentStep === 4 && (
        <QuizStep
          title="Study Mode Preference"
          description="How would you like to study?"
          stepNumber={4}
          totalSteps={TOTAL_STEPS}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              {STUDY_MODES.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={mode.value}
                    name="studyMode"
                    value={mode.value}
                    checked={formData.studyMode === mode.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        studyMode: e.target.value as QuizData["studyMode"],
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor={mode.value} className="cursor-pointer">
                    {mode.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            </div>
          </div>
        </QuizStep>
      )}

      {/* Step 5: Academic Level */}
      {currentStep === 5 && (
        <QuizStep
          title="Academic Level"
          description="What level are you applying for?"
          stepNumber={5}
          totalSteps={TOTAL_STEPS}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              {ACADEMIC_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={level.value}
                    name="academicLevel"
                    value={level.value}
                    checked={formData.academicLevel === level.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicLevel: e.target.value as QuizData["academicLevel"],
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor={level.value} className="cursor-pointer">
                    {level.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
                {loading ? "Submitting..." : "Submit & Get Recommendations"}
              </Button>
            </div>
          </div>
        </QuizStep>
      )}
    </div>
  )
}

