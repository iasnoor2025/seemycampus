"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CutoffTrend {
  year: number
  closingRank: number | null
  closingScore: number | null
  openingRank: number | null
  openingScore: number | null
  round: number | null
}

interface TrendAnalysis {
  collegeId: number
  collegeName: string
  collegeSlug: string
  examName: string
  courseName: string | null
  category: string | null
  trends: CutoffTrend[]
  analysis: {
    rankTrend: "increasing" | "decreasing" | "stable" | "insufficient"
    scoreTrend: "increasing" | "decreasing" | "stable" | "insufficient"
    rankChange: number | null
    scoreChange: number | null
    predictedNextYear: {
      rank?: number | null
      score?: number | null
    }
    volatility: "high" | "medium" | "low"
  }
}

interface CutoffTrendsChartProps {
  trend: TrendAnalysis
  showRank?: boolean
  showScore?: boolean
}

export function CutoffTrendsChart({
  trend,
  showRank = true,
  showScore = true,
}: CutoffTrendsChartProps) {
  const rankCanvasRef = useRef<HTMLCanvasElement>(null)
  const scoreCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (showRank && rankCanvasRef.current) {
      drawRankChart(rankCanvasRef.current, trend.trends)
    }
    if (showScore && scoreCanvasRef.current) {
      drawScoreChart(scoreCanvasRef.current, trend.trends)
    }
  }, [trend, showRank, showScore])

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-600" />
      case "stable":
        return <Minus className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case "increasing":
        return "text-red-600 bg-red-50"
      case "decreasing":
        return "text-green-600 bg-green-50"
      case "stable":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-400 bg-gray-50"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="mb-2">{trend.collegeName}</CardTitle>
            <CardDescription>
              {trend.examName} - {trend.category || "All Categories"}
              {trend.courseName && ` - ${trend.courseName}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showRank && trend.analysis.rankTrend !== "insufficient" && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Rank Trend</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor(trend.analysis.rankTrend)}`}>
                  {getTrendIcon(trend.analysis.rankTrend)}
                  <span className="text-xs font-medium capitalize">{trend.analysis.rankTrend}</span>
                </div>
              </div>
              {trend.analysis.rankChange !== null && (
                <div className="text-2xl font-bold">
                  {trend.analysis.rankChange > 0 ? "+" : ""}
                  {trend.analysis.rankChange.toFixed(1)}%
                </div>
              )}
              {trend.analysis.predictedNextYear.rank && (
                <div className="text-xs text-gray-600 mt-1">
                  Predicted Next Year: Rank {trend.analysis.predictedNextYear.rank}
                </div>
              )}
            </div>
          )}

          {showScore && trend.analysis.scoreTrend !== "insufficient" && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Score Trend</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor(trend.analysis.scoreTrend)}`}>
                  {getTrendIcon(trend.analysis.scoreTrend)}
                  <span className="text-xs font-medium capitalize">{trend.analysis.scoreTrend}</span>
                </div>
              </div>
              {trend.analysis.scoreChange !== null && (
                <div className="text-2xl font-bold">
                  {trend.analysis.scoreChange > 0 ? "+" : ""}
                  {trend.analysis.scoreChange.toFixed(1)}%
                </div>
              )}
              {trend.analysis.predictedNextYear.score && (
                <div className="text-xs text-gray-600 mt-1">
                  Predicted Next Year: Score {trend.analysis.predictedNextYear.score}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Volatility Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Volatility:</span>
          <Badge
            variant={
              trend.analysis.volatility === "high"
                ? "destructive"
                : trend.analysis.volatility === "medium"
                ? "default"
                : "secondary"
            }
          >
            {trend.analysis.volatility.toUpperCase()}
          </Badge>
        </div>

        {/* Charts */}
        {showRank && (
          <div>
            <h4 className="text-sm font-medium mb-2">Rank Trend</h4>
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas
                ref={rankCanvasRef}
                width={800}
                height={300}
                className="w-full h-auto max-h-[300px]"
              />
            </div>
          </div>
        )}

        {showScore && (
          <div>
            <h4 className="text-sm font-medium mb-2">Score Trend</h4>
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas
                ref={scoreCanvasRef}
                width={800}
                height={300}
                className="w-full h-auto max-h-[300px]"
              />
            </div>
          </div>
        )}

        {/* Historical Data Table */}
        <div>
          <h4 className="text-sm font-medium mb-2">Historical Data</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  {showRank && <th className="text-right p-2">Closing Rank</th>}
                  {showScore && <th className="text-right p-2">Closing Score</th>}
                  <th className="text-center p-2">Round</th>
                </tr>
              </thead>
              <tbody>
                {trend.trends
                  .slice()
                  .reverse()
                  .map((t, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{t.year}</td>
                      {showRank && (
                        <td className="p-2 text-right">
                          {t.closingRank || "N/A"}
                        </td>
                      )}
                      {showScore && (
                        <td className="p-2 text-right">
                          {t.closingScore || "N/A"}
                        </td>
                      )}
                      <td className="p-2 text-center">{t.round || "N/A"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function drawRankChart(canvas: HTMLCanvasElement, trends: CutoffTrend[]) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const ranks = trends
    .map((t) => t.closingRank)
    .filter((r): r is number => r !== null)
    .reverse()

  if (ranks.length === 0) return

  const padding = 40
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Find min and max
  const minRank = Math.min(...ranks)
  const maxRank = Math.max(...ranks)
  const range = maxRank - minRank || 1

  // Draw axes
  ctx.strokeStyle = "#e5e7eb"
  ctx.lineWidth = 1

  // X-axis
  ctx.beginPath()
  ctx.moveTo(padding, canvas.height - padding)
  ctx.lineTo(canvas.width - padding, canvas.height - padding)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, canvas.height - padding)
  ctx.stroke()

  // Draw grid lines
  ctx.strokeStyle = "#f3f4f6"
  for (let i = 0; i <= 5; i++) {
    const y = padding + (height / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()
  }

  // Draw line
  ctx.strokeStyle = "#3b82f6"
  ctx.lineWidth = 2
  ctx.beginPath()

  const years = trends
    .map((t) => t.year)
    .filter((_, idx) => trends[idx].closingRank !== null)
    .reverse()

  ranks.forEach((rank, idx) => {
    const x = padding + (width / (ranks.length - 1 || 1)) * idx
    const y = canvas.height - padding - ((rank - minRank) / range) * height

    if (idx === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Draw points
  ctx.fillStyle = "#3b82f6"
  ranks.forEach((rank, idx) => {
    const x = padding + (width / (ranks.length - 1 || 1)) * idx
    const y = canvas.height - padding - ((rank - minRank) / range) * height

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = "#374151"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(rank.toString(), x, y - 8)
    ctx.fillText(years[idx]?.toString() || "", x, canvas.height - padding + 15)
    ctx.fillStyle = "#3b82f6"
  })
}

function drawScoreChart(canvas: HTMLCanvasElement, trends: CutoffTrend[]) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const scores = trends
    .map((t) => t.closingScore)
    .filter((s): s is number => s !== null)
    .reverse()

  if (scores.length === 0) return

  const padding = 40
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Find min and max
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const range = maxScore - minScore || 1

  // Draw axes
  ctx.strokeStyle = "#e5e7eb"
  ctx.lineWidth = 1

  // X-axis
  ctx.beginPath()
  ctx.moveTo(padding, canvas.height - padding)
  ctx.lineTo(canvas.width - padding, canvas.height - padding)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, canvas.height - padding)
  ctx.stroke()

  // Draw grid lines
  ctx.strokeStyle = "#f3f4f6"
  for (let i = 0; i <= 5; i++) {
    const y = padding + (height / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvas.width - padding, y)
    ctx.stroke()
  }

  // Draw line
  ctx.strokeStyle = "#10b981"
  ctx.lineWidth = 2
  ctx.beginPath()

  const years = trends
    .map((t) => t.year)
    .filter((_, idx) => trends[idx].closingScore !== null)
    .reverse()

  scores.forEach((score, idx) => {
    const x = padding + (width / (scores.length - 1 || 1)) * idx
    const y = canvas.height - padding - ((score - minScore) / range) * height

    if (idx === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Draw points
  ctx.fillStyle = "#10b981"
  scores.forEach((score, idx) => {
    const x = padding + (width / (scores.length - 1 || 1)) * idx
    const y = canvas.height - padding - ((score - minScore) / range) * height

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = "#374151"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(score.toFixed(1), x, y - 8)
    ctx.fillText(years[idx]?.toString() || "", x, canvas.height - padding + 15)
    ctx.fillStyle = "#10b981"
  })
}

