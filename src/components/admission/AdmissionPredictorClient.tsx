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
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white text-2xl">Enter Your Details</CardTitle>
          <CardDescription className="text-white/90">
            Provide your exam information to get admission probability predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="examName" className="text-base font-semibold text-gray-900">
                Exam Name <span className="text-red-500">*</span>
              </Label>
              <Select value={examName} onValueChange={(value) => setExamName(value || "")} disabled={loadingExams}>
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
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

            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-semibold text-gray-900">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value || "")}
                disabled={!examName || loadingExams}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
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

            <div className="space-y-2">
              <Label htmlFor="score" className="text-base font-semibold text-gray-900">
                Score / Percentile
              </Label>
              <Input
                id="score"
                type="number"
                placeholder="Enter your score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={loading}
                className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank" className="text-base font-semibold text-gray-900">
                Rank
              </Label>
              <Input
                id="rank"
                type="number"
                placeholder="Enter your rank"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                disabled={loading}
                className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="courseName" className="text-base font-semibold text-gray-900">
                Course Name <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </Label>
              <Input
                id="courseName"
                type="text"
                placeholder="e.g., B.Tech, MBA"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                disabled={loading}
                className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors"
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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-5 w-5" />
                Predict Admission Chances
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {predictions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Prediction Results
            </h2>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 text-sm font-semibold">
              {predictions.length} colleges found
            </Badge>
          </div>

          <div className="grid gap-6">
            {predictions.map((prediction, index) => {
              const gradients = [
                "from-blue-500 to-cyan-600",
                "from-indigo-500 to-purple-600",
                "from-violet-500 to-purple-600",
                "from-teal-500 to-emerald-600",
                "from-sky-500 to-blue-600",
                "from-purple-500 to-pink-600",
              ]
              const gradient = gradients[index % gradients.length]

              return (
                <Card key={prediction.collegeId} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                  <CardHeader className={`bg-gradient-to-br ${gradient} text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <CardTitle className="mb-2 text-white text-xl">
                          <Link
                            href={`/colleges/${prediction.collegeSlug}`}
                            className="hover:text-blue-100 transition-colors"
                          >
                            {prediction.collegeName}
                          </Link>
                        </CardTitle>
                        {prediction.courseName && (
                          <CardDescription className="text-white/90">
                            {prediction.courseName}
                          </CardDescription>
                        )}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                        <div className={`text-3xl font-bold text-white`}>
                          {prediction.probability}%
                        </div>
                        <div className="text-xs text-white/90 mt-1 font-medium">Probability</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                      {getConfidenceIcon(prediction.confidence)}
                      <span className="text-sm font-semibold capitalize text-gray-900">
                        {prediction.confidence} Confidence
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{prediction.reasoning}</p>
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
                      <div className="border-t border-slate-200 pt-4">
                        <p className="text-sm font-semibold mb-3 text-gray-900">Historical Cutoffs:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {prediction.historicalData.map((data, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-slate-50 to-blue-50 p-3 rounded-lg border border-slate-200">
                              <div className="font-bold text-gray-900 mb-1">{data.year}</div>
                              {data.closingRank && (
                                <div className="text-xs text-gray-600">Rank: <span className="font-semibold">{data.closingRank}</span></div>
                              )}
                              {data.closingScore && (
                                <div className="text-xs text-gray-600">Score: <span className="font-semibold">{data.closingScore}</span></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/colleges/${prediction.collegeSlug}`}>
                      <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}>
                        View College Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

