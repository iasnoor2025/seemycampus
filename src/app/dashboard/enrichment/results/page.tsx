"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Building2, GraduationCap, MessageSquare, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

interface EnrichmentResults {
  summary: {
    totalColleges: number
    totalCourses: number
    totalReviews: number
    recentlyUpdatedColleges: number
    collegesWithNewCourses: number
    collegesWithNewReviews: number
    timeRange: number
    sinceDate: string
  }
  recentlyUpdatedColleges: Array<{
    id: number
    name: string
    slug: string
    city: string | null
    state: string | null
    updatedAt: Date
    hasDescription: boolean
    hasImages: boolean
    hasRanking: boolean
    hasFees: boolean
  }>
  collegesWithNewCourses: Array<{
    collegeId: number
    collegeName: string
    coursesAdded: number
  }>
  collegesWithNewReviews: Array<{
    collegeId: number
    collegeName: string
    reviewsAdded: number
    averageRating: string
  }>
}

export default function EnrichmentResultsPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<EnrichmentResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(24)

  const fetchResults = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/enrich/results?hours=${timeRange}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch results")
      }
      
      setResults(data)
    } catch (err: any) {
      setError(err.message || "Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  if (loading && !results) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading enrichment results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchResults} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (!results) return null

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Enrichment Results</h1>
          <p className="text-muted-foreground">
            See what was added during the enrichment process
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={48}>Last 48 hours</option>
            <option value={168}>Last week</option>
          </select>
          <Button onClick={fetchResults} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{results.summary.totalColleges}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {results.summary.recentlyUpdatedColleges} updated in last {timeRange}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{results.summary.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {results.summary.collegesWithNewCourses} colleges with new courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{results.summary.totalReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {results.summary.collegesWithNewReviews} colleges with new reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recently Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{results.summary.recentlyUpdatedColleges}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Colleges updated in last {timeRange}h
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Updated Colleges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recently Updated Colleges
            </CardTitle>
            <CardDescription>
              Colleges that were updated in the last {timeRange} hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.recentlyUpdatedColleges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No colleges updated in the last {timeRange} hours
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.recentlyUpdatedColleges.map((college) => (
                  <div
                    key={college.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/colleges/${college.slug}`}
                          className="font-semibold hover:underline"
                        >
                          {college.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {college.city && college.state ? `${college.city}, ${college.state}` : college.city || college.state || "India"}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {college.hasDescription && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Description</span>
                          )}
                          {college.hasImages && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Images</span>
                          )}
                          {college.hasRanking && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Ranking</span>
                          )}
                          {college.hasFees && (
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">Fees</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {new Date(college.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colleges with New Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Colleges with New Courses
            </CardTitle>
            <CardDescription>
              Colleges that received new courses in the last {timeRange} hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.collegesWithNewCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No new courses added in the last {timeRange} hours
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.collegesWithNewCourses.map((item) => (
                  <div
                    key={item.collegeId}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.collegeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.coursesAdded} course{item.coursesAdded !== 1 ? "s" : ""} added
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colleges with New Reviews */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Colleges with New Reviews
            </CardTitle>
            <CardDescription>
              Colleges that received new reviews and ratings in the last {timeRange} hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.collegesWithNewReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No new reviews added in the last {timeRange} hours
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.collegesWithNewReviews.map((item) => (
                  <div
                    key={item.collegeId}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.collegeName}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {item.reviewsAdded} review{item.reviewsAdded !== 1 ? "s" : ""} added
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{item.averageRating}</span>
                          </div>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

