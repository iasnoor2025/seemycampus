"use client"

import { CollegeCard } from "@/components/college/CollegeCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import type { ScoredCollege } from "@/lib/recommendations/scoring"

interface RecommendationListProps {
  recommendations: ScoredCollege[]
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No recommendations found. Try adjusting your preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Personalized Recommendations</h2>
        <p className="text-muted-foreground">
          We found {recommendations.length} colleges that match your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation, index) => (
          <Card key={recommendation.college.id} className="relative overflow-hidden">
            {index < 3 && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="default" className="bg-primary">
                  Top {index + 1}
                </Badge>
              </div>
            )}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{recommendation.college.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary">{recommendation.score}</span>
                  <span className="text-sm text-muted-foreground">match score</span>
                </div>
              </div>

              {recommendation.matchReasons.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">Why this matches:</p>
                  <ul className="space-y-1">
                    {recommendation.matchReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <a
                  href={`/colleges/${recommendation.college.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  View College Details →
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

