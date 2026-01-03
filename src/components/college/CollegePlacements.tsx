"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Briefcase, Users, Award } from "lucide-react"

interface Placement {
  id: number
  year: number
  totalStudents?: number | null
  placedStudents?: number | null
  placementPercentage?: number | null
  averagePackage?: number | null
  medianPackage?: number | null
  highestPackage?: number | null
  lowestPackage?: number | null
  topRecruiters?: string[]
  departmentWiseData?: Record<string, any>
}

interface CollegePlacementsProps {
  collegeId: number
  collegeSlug?: string
}

export function CollegePlacements({ collegeId, collegeSlug }: CollegePlacementsProps) {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>("")

  useEffect(() => {
    fetchPlacements()
  }, [collegeId, selectedYear])

  const fetchPlacements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("collegeId", collegeId.toString())
      if (selectedYear) params.set("year", selectedYear)

      const response = await fetch(`/api/placements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPlacements(data.placements || [])
      }
    } catch (error) {
      console.error("Error fetching placements:", error)
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from(new Set(placements.map((p) => p.year))).sort((a, b) => b - a)

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A"
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`
    }
    return `₹${(amount / 100000).toFixed(2)}L`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading placement statistics...</div>
        </CardContent>
      </Card>
    )
  }

  if (placements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Placement Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No placement data available for this college.
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestPlacement = placements[0] // Already sorted by year desc

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Placement Statistics
          </CardTitle>
          {years.length > 0 && (
            <Select value={selectedYear || undefined} onValueChange={(value) => setSelectedYear(value === "all" ? "" : value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Latest Year Summary */}
        {latestPlacement && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Placement %</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {latestPlacement.placementPercentage || "N/A"}
                {latestPlacement.placementPercentage && "%"}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Avg Package</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(latestPlacement.averagePackage)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Highest</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(latestPlacement.highestPackage)}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Placed</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {latestPlacement.placedStudents?.toLocaleString() || "N/A"}
              </div>
            </div>
          </div>
        )}

        {/* Year-wise Details */}
        <div className="space-y-4">
          {placements.map((placement) => (
            <div key={placement.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">{placement.year} Placement Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Total Students</div>
                  <div className="text-lg font-semibold">
                    {placement.totalStudents?.toLocaleString() || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Placed Students</div>
                  <div className="text-lg font-semibold">
                    {placement.placedStudents?.toLocaleString() || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Placement %</div>
                  <div className="text-lg font-semibold">
                    {placement.placementPercentage ? `${placement.placementPercentage}%` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Median Package</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(placement.medianPackage)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Average Package</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(placement.averagePackage)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Highest Package</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {formatCurrency(placement.highestPackage)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Lowest Package</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(placement.lowestPackage)}
                  </div>
                </div>
              </div>
              {placement.topRecruiters && placement.topRecruiters.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Top Recruiters</div>
                  <div className="flex flex-wrap gap-2">
                    {placement.topRecruiters.map((recruiter, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {recruiter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

