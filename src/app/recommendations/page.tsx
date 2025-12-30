import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getRecommendations } from "@/lib/recommendations/engine"
import { RecommendationList } from "@/components/recommendations/RecommendationList"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "College Recommendations | SeeMyCampus",
  description: "View your personalized college recommendations based on your preferences.",
}

interface RecommendationsPageProps {
  searchParams: Promise<{
    quizId?: string
  }>
}

async function RecommendationsContent({ quizId }: { quizId: number }) {
  try {
    const recommendations = await getRecommendations(quizId)
    return <RecommendationList recommendations={recommendations} />
  } catch (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load recommendations. Please try taking the quiz again.
          </p>
        </CardContent>
      </Card>
    )
  }
}

export default async function RecommendationsPage({
  searchParams,
}: RecommendationsPageProps) {
  const params = await searchParams
  const quizId = params.quizId ? parseInt(params.quizId) : null

  if (!quizId || isNaN(quizId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="border-0 shadow-xl">
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4 text-lg">
                  No quiz ID provided. Please take the quiz first.
                </p>
                <a href="/quiz" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                  Take Quiz
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm">Personalized Results</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Your Recommendations
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Based on your quiz answers, here are colleges that match your preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Suspense
            fallback={
              <Card className="border-0 shadow-xl">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">Loading recommendations...</p>
                </CardContent>
              </Card>
            }
          >
            <RecommendationsContent quizId={quizId} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

