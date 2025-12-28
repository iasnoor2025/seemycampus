"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, TrendingUp, Clock, Target, CheckCircle } from "lucide-react"
import type { LeadScore } from "@/lib/analytics/leadScoring"

interface LeadScoringDisplayProps {
  leadId: number
  compact?: boolean
}

export function LeadScoringDisplay({ leadId, compact = false }: LeadScoringDisplayProps) {
  const [score, setScore] = useState<LeadScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScore()
  }, [leadId])

  const fetchScore = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/lead-scoring?leadId=${leadId}&action=score`)
      if (response.ok) {
        const data = await response.json()
        setScore(data.score)
      }
    } catch (error) {
      console.error("Error fetching lead score:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-xs text-muted-foreground">Calculating...</div>
  }

  if (!score) {
    return null
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "high_priority":
        return "bg-red-100 text-red-800 border-red-300"
      case "medium_priority":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low_priority":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "nurture":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Target className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{score.score}/100</span>
        </div>
        <Badge variant="outline" className={getRecommendationColor(score.recommendation)}>
          {score.recommendation.replace("_", " ")}
        </Badge>
        <span className={`text-xs ${getChurnRiskColor(score.churnRisk || "low")}`}>
          {score.churnRisk || "low"} risk
        </span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Lead Score</span>
          <Badge className={getRecommendationColor(score.recommendation)}>
            {score.recommendation.replace("_", " ").toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            <span className="text-2xl font-bold">{score.score}/100</span>
          </div>
          <Progress value={score.score} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Conversion Probability</span>
            <span className="text-lg font-semibold">
              {(score.conversionProbability * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={score.conversionProbability * 100} className="h-2" />
        </div>

        {score.optimalContactTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{score.optimalContactTime}</span>
          </div>
        )}

        {score.churnRisk && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className={`h-4 w-4 ${getChurnRiskColor(score.churnRisk)}`} />
            <span className={getChurnRiskColor(score.churnRisk)}>
              Churn Risk: {score.churnRisk.toUpperCase()}
            </span>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">Scoring Factors</p>
          <div className="space-y-2">
            {score.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {factor.impact === "positive" ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                  )}
                  <span className="text-muted-foreground">{factor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{factor.value}/{factor.weight}</span>
                  <Progress value={(factor.value / factor.weight) * 100} className="w-16 h-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

