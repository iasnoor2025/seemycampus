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
  searchParams: {
    quizId?: string
  }
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
  const quizId = searchParams.quizId ? parseInt(searchParams.quizId) : null

  if (!quizId || isNaN(quizId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No quiz ID provided. Please take the quiz first.
            </p>
            <a href="/quiz" className="text-primary hover:underline">
              Take Quiz
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading recommendations...</p>
            </CardContent>
          </Card>
        }
      >
        <RecommendationsContent quizId={quizId} />
      </Suspense>
    </div>
  )
}

