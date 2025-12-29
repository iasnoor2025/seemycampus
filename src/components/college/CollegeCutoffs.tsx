"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { CutoffTrendsChart } from "@/components/cutoffs/CutoffTrendsChart"
import { Loader2 } from "lucide-react"

interface Cutoff {
  id: number
  examName: string
  courseName?: string | null
  year: number
  category?: string | null
  openingRank?: number | null
  closingRank?: number | null
  openingScore?: number | null
  closingScore?: number | null
  round?: number
  quota?: string | null
}

interface CollegeCutoffsProps {
  collegeId: number
  collegeSlug?: string
}

interface TrendAnalysis {
  collegeId: number
  collegeName: string
  collegeSlug: string
  examName: string
  courseName: string | null
  category: string | null
  trends: Array<{
    year: number
    closingRank: number | null
    closingScore: number | null
    openingRank: number | null
    openingScore: number | null
    round: number | null
  }>
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

export function CollegeCutoffs({ collegeId, collegeSlug }: CollegeCutoffsProps) {
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null)
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [trendExam, setTrendExam] = useState<string>("")
  const [trendCategory, setTrendCategory] = useState<string>("")

  useEffect(() => {
    fetchCutoffs()
  }, [collegeId, selectedYear, selectedExam, selectedCategory])

  useEffect(() => {
    if (trendExam && collegeId) {
      fetchTrends()
    } else {
      setTrendData(null)
    }
  }, [collegeId, trendExam, trendCategory])

  const fetchCutoffs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("collegeId", collegeId.toString())
      if (selectedYear) params.set("year", selectedYear)
      if (selectedExam) params.set("examName", selectedExam)
      if (selectedCategory) params.set("category", selectedCategory)

      const response = await fetch(`/api/cutoffs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCutoffs(data.cutoffs || [])
      }
    } catch (error) {
      console.error("Error fetching cutoffs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrends = async () => {
    try {
      setLoadingTrends(true)
      const params = new URLSearchParams()
      params.set("collegeId", collegeId.toString())
      params.set("examName", trendExam)
      if (trendCategory) params.set("category", trendCategory)

      const response = await fetch(`/api/cutoffs/trends?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTrendData(data.trend || null)
      }
    } catch (error) {
      console.error("Error fetching trends:", error)
      setTrendData(null)
    } finally {
      setLoadingTrends(false)
    }
  }

  // Get unique values for filters
  const years = Array.from(new Set(cutoffs.map((c) => c.year))).sort((a, b) => b - a)
  const exams = Array.from(new Set(cutoffs.map((c) => c.examName))).sort()
  const categories = Array.from(
    new Set(cutoffs.map((c) => c.category).filter(Boolean))
  ).sort()

  // Group cutoffs by exam
  const cutoffsByExam = cutoffs.reduce((acc, cutoff) => {
    if (!acc[cutoff.examName]) {
      acc[cutoff.examName] = []
    }
    acc[cutoff.examName].push(cutoff)
    return acc
  }, {} as Record<string, Cutoff[]>)

  // Group cutoffs by year
  const cutoffsByYear = cutoffs.reduce((acc, cutoff) => {
    if (!acc[cutoff.year]) {
      acc[cutoff.year] = []
    }
    acc[cutoff.year].push(cutoff)
    return acc
  }, {} as Record<number, Cutoff[]>)

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading cutoffs...</div>
        </CardContent>
      </Card>
    )
  }

  if (cutoffs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Entrance Exam Cutoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No cutoff data available for this college.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Entrance Exam Cutoffs
          </CardTitle>
          <div className="flex gap-2">
            {years.length > 0 && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {exams.length > 0 && (
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Exams</SelectItem>
                  {exams.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="by-exam" className="w-full">
          <TabsList>
            <TabsTrigger value="by-exam">By Exam</TabsTrigger>
            <TabsTrigger value="by-year">By Year</TabsTrigger>
            <TabsTrigger value="trends">
              <BarChart3 className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="by-exam" className="space-y-4">
            {Object.entries(cutoffsByExam).map(([examName, examCutoffs]) => (
              <div key={examName} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{examName}</h3>
                <div className="overflow-x-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-left p-2">Course</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-right p-2">Opening Rank</th>
                          <th className="text-right p-2">Closing Rank</th>
                          <th className="text-right p-2">Opening Score</th>
                          <th className="text-right p-2">Closing Score</th>
                          <th className="text-center p-2">Round</th>
                        </tr>
                      </thead>
                      <tbody>
                      {examCutoffs
                        .sort((a, b) => b.year - a.year || (b.round || 0) - (a.round || 0))
                        .map((cutoff) => (
                          <tr key={cutoff.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{cutoff.year}</td>
                            <td className="p-2">{cutoff.courseName || "-"}</td>
                            <td className="p-2">{cutoff.category || "-"}</td>
                            <td className="p-2 text-right">
                              {cutoff.openingRank ? cutoff.openingRank.toLocaleString() : "-"}
                            </td>
                            <td className="p-2 text-right">
                              {cutoff.closingRank ? cutoff.closingRank.toLocaleString() : "-"}
                            </td>
                            <td className="p-2 text-right">
                              {cutoff.openingScore ? cutoff.openingScore.toLocaleString() : "-"}
                            </td>
                            <td className="p-2 text-right">
                              {cutoff.closingScore ? cutoff.closingScore.toLocaleString() : "-"}
                            </td>
                            <td className="p-2 text-center">{cutoff.round || 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="by-year" className="space-y-4">
            {Object.entries(cutoffsByYear)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([year, yearCutoffs]) => (
                <div key={year} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{year}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Exam</th>
                          <th className="text-left p-2">Course</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-right p-2">Opening Rank</th>
                          <th className="text-right p-2">Closing Rank</th>
                          <th className="text-right p-2">Opening Score</th>
                          <th className="text-right p-2">Closing Score</th>
                          <th className="text-center p-2">Round</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearCutoffs
                          .sort((a, b) => a.examName.localeCompare(b.examName))
                          .map((cutoff) => (
                            <tr key={cutoff.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">{cutoff.examName}</td>
                              <td className="p-2">{cutoff.courseName || "-"}</td>
                              <td className="p-2">{cutoff.category || "-"}</td>
                              <td className="p-2 text-right">
                                {cutoff.openingRank ? cutoff.openingRank.toLocaleString() : "-"}
                              </td>
                              <td className="p-2 text-right">
                                {cutoff.closingRank ? cutoff.closingRank.toLocaleString() : "-"}
                              </td>
                              <td className="p-2 text-right">
                                {cutoff.openingScore ? cutoff.openingScore.toLocaleString() : "-"}
                              </td>
                              <td className="p-2 text-right">
                                {cutoff.closingScore ? cutoff.closingScore.toLocaleString() : "-"}
                              </td>
                              <td className="p-2 text-center">{cutoff.round || 1}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Exam</label>
                <Select value={trendExam} onValueChange={setTrendExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam for trends" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam} value={exam}>
                        {exam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Category (Optional)</label>
                  <Select value={trendCategory} onValueChange={setTrendCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {loadingTrends ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading trends...</span>
              </div>
            ) : trendData ? (
              <CutoffTrendsChart trend={trendData} />
            ) : trendExam ? (
              <div className="text-center py-12 text-muted-foreground">
                No trend data available for the selected criteria.
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Please select an exam to view trends.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

