"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

interface Quiz {
  id: number
  interests: string[]
  preferredLocation: string | null
  budgetMin: number | null
  budgetMax: number | null
  studyMode: string | null
  academicLevel: string | null
  createdAt: string
}

export function QuizHistoryTab() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuizHistory()
  }, [])

  const fetchQuizHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/quiz-history")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes || [])
      } else {
        setError("Failed to load quiz history")
      }
    } catch (err) {
      setError("Failed to load quiz history")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No quiz history yet
        </h3>
        <p className="text-gray-600 mb-6">
          Take our quiz to get personalized college recommendations based on your preferences.
        </p>
        <Link href="/quiz">
          <Button>Take Quiz</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {format(new Date(quiz.createdAt), "PPp")}
              </span>
            </div>
            <Link href={`/quiz/results?quizId=${quiz.id}`}>
              <Button variant="outline" size="sm">
                View Results
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Interests:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {quiz.interests && quiz.interests.length > 0 ? (
                  quiz.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Not specified</span>
                )}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <p className="text-gray-600 mt-1">
                {quiz.preferredLocation || "Not specified"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Budget:</span>
              <p className="text-gray-600 mt-1">
                {quiz.budgetMin && quiz.budgetMax
                  ? `₹${quiz.budgetMin.toLocaleString()} - ₹${quiz.budgetMax.toLocaleString()}`
                  : "Not specified"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Study Mode:</span>
              <p className="text-gray-600 mt-1 capitalize">
                {quiz.studyMode || "Not specified"}
              </p>
            </div>

            <div>
              <span className="font-medium text-gray-700">Academic Level:</span>
              <p className="text-gray-600 mt-1 capitalize">
                {quiz.academicLevel?.replace("_", " ") || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

