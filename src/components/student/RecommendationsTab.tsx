"use client"

import { useState, useEffect } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CollegeCard } from "@/components/college/CollegeCard"
// Note: getRecommendations is a server-side function, so we'll fetch via API

interface Recommendation {
  quizId: number
  createdAt: string
  recommendations: any[]
}

export function RecommendationsTab() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      // Get quiz history first
      const quizResponse = await fetch("/api/student/quiz-history")
      if (quizResponse.ok) {
        const quizData = await quizResponse.json()
        const quizzes = quizData.quizzes || []

        // For each quiz, get recommendations via API
        const recommendationsPromises = quizzes.map(async (quiz: any) => {
          try {
            const response = await fetch(`/api/quiz/results?quizId=${quiz.id}`)
            if (response.ok) {
              const data = await response.json()
              return {
                quizId: quiz.id,
                createdAt: quiz.createdAt,
                recommendations: data.recommendations || [],
              }
            }
            return null
          } catch (err) {
            console.error(`Error fetching recommendations for quiz ${quiz.id}:`, err)
            return null
          }
        })

        const results = await Promise.all(recommendationsPromises)
        setRecommendations(results.filter((r) => r !== null) as Recommendation[])
      } else {
        setError("Failed to load recommendations")
      }
    } catch (err) {
      setError("Failed to load recommendations")
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

  if (recommendations.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No recommendations yet
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
    <div className="space-y-8">
      {recommendations.map((recGroup) => (
        <div key={recGroup.quizId} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recommendations from Quiz #{recGroup.quizId}
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(recGroup.createdAt).toLocaleDateString()}
            </p>
          </div>

          {recGroup.recommendations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recommendations found for this quiz.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recGroup.recommendations.map((rec: any) => (
                <CollegeCard key={rec.college.id} college={rec.college} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href={`/quiz/results?quizId=${recGroup.quizId}`}>
              <Button variant="outline">View All Recommendations</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

