"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface PredictionResult {
  collegeId: number
  collegeName: string
  collegeSlug: string
  courseName: string | null
  probability: number
  confidence: "high" | "medium" | "low"
  predictedCutoff: {
    rank?: number | null
    score?: number | null
  }
  historicalData: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
    category: string | null
  }>
  reasoning: string
}

export function AdmissionPredictorClient() {
  const [examName, setExamName] = useState("")
  const [category, setCategory] = useState("")
  const [score, setScore] = useState<string>("")
  const [rank, setRank] = useState<string>("")
  const [courseName, setCourseName] = useState<string>("")
  const [availableExams, setAvailableExams] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingExams, setLoadingExams] = useState(true)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [error, setError] = useState<string>("")

  // Load available exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch("/api/admission/predict")
        if (response.ok) {
          const data = await response.json()
          setAvailableExams(data.exams || [])
        }
      } catch (err) {
        console.error("Error fetching exams:", err)
      } finally {
        setLoadingExams(false)
      }
    }

    fetchExams()
  }, [])

  // Load categories when exam is selected
  useEffect(() => {
    if (examName) {
      const fetchCategories = async () => {
        try {
          const response = await fetch(`/api/admission/predict?examName=${encodeURIComponent(examName)}`)
          if (response.ok) {
            const data = await response.json()
            setAvailableCategories(data.categories || [])
            // Reset category when exam changes
            setCategory("")
          }
        } catch (err) {
          console.error("Error fetching categories:", err)
        }
      }

      fetchCategories()
    } else {
      setAvailableCategories([])
      setCategory("")
    }
  }, [examName])

  const handlePredict = async () => {
    setError("")
    setPredictions([])

    if (!examName || !category) {
      setError("Please select an exam and category")
      return
    }

    if (!score && !rank) {
      setError("Please enter either a score or rank")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admission/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examName,
          category,
          score: score ? parseFloat(score) : null,
          rank: rank ? parseInt(rank) : null,
          courseName: courseName || null,
          year: new Date().getFullYear(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPredictions(data.predictions || [])
        if (data.predictions.length === 0) {
          setError("No predictions found. Try different criteria or check if cutoff data exists for this exam.")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to generate predictions")
      }
    } catch (err) {
      console.error("Error predicting admission:", err)
      setError("An error occurred while generating predictions")
    } finally {
      setLoading(false)
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    if (probability >= 25) return "text-orange-600"
    return "text-red-600"
  }

  const getProbabilityBgColor = (probability: number) => {
    if (probability >= 75) return "bg-green-100"
    if (probability >= 50) return "bg-yellow-100"
    if (probability >= 25) return "bg-orange-100"
    return "bg-red-100"
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>
            Provide your exam information to get admission probability predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="examName">Exam Name *</Label>
              <Select value={examName} onValueChange={setExamName} disabled={loadingExams}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingExams ? "Loading..." : "Select exam"} />
                </SelectTrigger>
                <SelectContent>
                  {availableExams.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={!examName || loadingExams}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="score">Score / Percentile</Label>
              <Input
                id="score"
                type="number"
                placeholder="Enter your score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="rank">Rank</Label>
              <Input
                id="rank"
                type="number"
                placeholder="Enter your rank"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="courseName">Course Name (Optional)</Label>
              <Input
                id="courseName"
                type="text"
                placeholder="e.g., B.Tech, MBA"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handlePredict}
            disabled={loading || !examName || !category || (!score && !rank)}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              "Predict Admission Chances"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Prediction Results</h2>
            <Badge variant="outline">{predictions.length} colleges found</Badge>
          </div>

          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.collegeId} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">
                        <Link
                          href={`/colleges/${prediction.collegeSlug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {prediction.collegeName}
                        </Link>
                      </CardTitle>
                      {prediction.courseName && (
                        <CardDescription>{prediction.courseName}</CardDescription>
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${getProbabilityBgColor(prediction.probability)}`}
                    >
                      <div className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                        {prediction.probability}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Probability</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getConfidenceIcon(prediction.confidence)}
                    <span className="text-sm font-medium capitalize">
                      {prediction.confidence} Confidence
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{prediction.reasoning}</p>
                  </div>

                  {prediction.predictedCutoff.rank && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Predicted Cutoff Rank: </span>
                        <span className="font-semibold">{prediction.predictedCutoff.rank}</span>
                      </div>
                    </div>
                  )}

                  {prediction.predictedCutoff.score && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Predicted Cutoff Score: </span>
                        <span className="font-semibold">{prediction.predictedCutoff.score}</span>
                      </div>
                    </div>
                  )}

                  {prediction.historicalData.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-2">Historical Cutoffs:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {prediction.historicalData.map((data, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold">{data.year}</div>
                            {data.closingRank && (
                              <div className="text-gray-600">Rank: {data.closingRank}</div>
                            )}
                            {data.closingScore && (
                              <div className="text-gray-600">Score: {data.closingScore}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/colleges/${prediction.collegeSlug}`}>
                    <Button variant="outline" className="w-full">
                      View College Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

