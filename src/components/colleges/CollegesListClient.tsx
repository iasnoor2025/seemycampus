"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitCompare, Grid3x3, List, Star, MapPin, Award, TrendingUp } from "lucide-react"
import { CollegeFilters, FilterState } from "./CollegeFilters"
import { CollegePagination } from "./CollegePagination"
import { Badge } from "@/components/ui/badge"

interface College {
  id: number
  name: string
  slug: string
  location?: string | null
  city?: string | null
  state?: string | null
  images?: string[] | null
  ranking?: number | null
  averagePackage?: number | null
  highestPackage?: number | null
  establishedYear?: number | null
  accreditation?: string | null
  ownership?: string | null
}

interface CollegesListClientProps {
  initialColleges: College[]
  initialTotalCount?: number
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
}

export function CollegesListClient({ initialColleges, initialTotalCount = 0 }: CollegesListClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>(initialColleges)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    location: "",
    state: "",
    course: "",
    feesMin: "",
    feesMax: "",
    entranceExam: "",
    ownership: "",
    academicAlliance: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const fetchColleges = async (page: number = 1, filterState: FilterState = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Basic filters
      if (filterState.search) params.set("search", filterState.search)
      if (filterState.location) params.set("location", filterState.location)
      if (filterState.state) params.set("state", filterState.state)
      if (filterState.course) params.set("course", filterState.course)
      if (filterState.feesMin) params.set("feesMin", filterState.feesMin)
      if (filterState.feesMax) params.set("feesMax", filterState.feesMax)
      if (filterState.entranceExam) params.set("entranceExam", filterState.entranceExam)
      if (filterState.ownership) params.set("ownership", filterState.ownership)
      if (filterState.academicAlliance !== null) {
        params.set("academicAlliance", filterState.academicAlliance ? "true" : "false")
      }
      
      // Cutoff filters
      if (filterState.cutoffExam) params.set("cutoffExam", filterState.cutoffExam)
      if (filterState.cutoffCategory) params.set("cutoffCategory", filterState.cutoffCategory)
      if (filterState.cutoffYear) params.set("cutoffYear", filterState.cutoffYear)
      if (filterState.cutoffRankMin) params.set("cutoffRankMin", filterState.cutoffRankMin)
      if (filterState.cutoffRankMax) params.set("cutoffRankMax", filterState.cutoffRankMax)
      
      // Placement filters
      if (filterState.placementPackageMin) params.set("placementPackageMin", filterState.placementPackageMin)
      if (filterState.placementPackageMax) params.set("placementPackageMax", filterState.placementPackageMax)
      if (filterState.placementPercentageMin) params.set("placementPercentageMin", filterState.placementPercentageMin)
      
      // Ranking filters
      if (filterState.rankingMin) params.set("rankingMin", filterState.rankingMin)
      if (filterState.rankingMax) params.set("rankingMax", filterState.rankingMax)
      if (filterState.rankingSource) params.set("rankingSource", filterState.rankingSource)
      if (filterState.rankingCategory) params.set("rankingCategory", filterState.rankingCategory)
      
      // Additional filters
      if (filterState.accreditation) params.set("accreditation", filterState.accreditation)
      if (filterState.campusSizeMin) params.set("campusSizeMin", filterState.campusSizeMin)
      if (filterState.totalStudentsMin) params.set("totalStudentsMin", filterState.totalStudentsMin)
      if (filterState.establishedYearMin) params.set("establishedYearMin", filterState.establishedYearMin)
      if (filterState.establishedYearMax) params.set("establishedYearMax", filterState.establishedYearMax)
      
      params.set("page", page.toString())
      params.set("limit", "20")
      params.set("sortBy", sortBy)

      const response = await fetch(`/api/colleges/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
        setTotalCount(data.pagination?.totalCount || 0)
        setTotalPages(data.pagination?.totalPages || 1)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error("Error fetching colleges:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize search from URL on mount
  useEffect(() => {
    const searchQuery = searchParams.get("search")
    if (searchQuery && !filters.search) {
      const initialFilters = { ...filters, search: searchQuery }
      setFilters(initialFilters)
      fetchColleges(1, initialFilters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    fetchColleges(1, newFilters)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
    fetchColleges(1, filters)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A"
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`
    }
    return `₹${(amount / 100000).toFixed(2)}L`
  }

  const handleSearchChange = (search: string) => {
    // Search is handled by filter change
  }

  const handlePageChange = (page: number) => {
    fetchColleges(page, filters)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-red-600">
      {/* Main Content - White Central Column */}
      <div className="max-w-6xl mx-auto bg-white min-h-screen py-8">
        {/* Page Header */}
        <div className="px-4 sm:px-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Browse Colleges
              </h1>
              <p className="text-gray-600">
                Explore our comprehensive directory of colleges and universities
              </p>
            </div>
            <Link href="/compare">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50"
              >
                <GitCompare className="h-4 w-4" />
                Compare Colleges
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 mb-6">
          <CollegeFilters
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Results Count and Controls */}
        {!loading && (
          <div className="px-4 sm:px-6 mb-4 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{totalCount}</span> colleges
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="fees">Fees (High to Low)</SelectItem>
                  <SelectItem value="ranking">Ranking (Best First)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table Header - Only for list view */}
        {viewMode === "list" && !loading && colleges.length > 0 && (
          <div className="px-4 sm:px-6 mb-4">
            <div className="hidden md:grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
              <div className="col-span-2 text-center">PREVIEW</div>
              <div className="col-span-4">COLLEGE NAME</div>
              <div className="col-span-2">LOCATION</div>
              <div className="col-span-2">KEY METRICS</div>
              <div className="col-span-2 text-center">VIEW</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="px-4 sm:px-6 py-12 text-center">
            <p className="text-gray-600">Loading colleges...</p>
          </div>
        )}

        {/* Colleges List */}
        {!loading && colleges.length === 0 && (
          <div className="px-4 sm:px-6 py-12 text-center">
            <p className="text-gray-600">No colleges found. Try adjusting your filters.</p>
          </div>
        )}

        {!loading && colleges.length > 0 && (
          <>
            {viewMode === "list" ? (
              <div className="space-y-0">
                {colleges.map((college, index) => (
                  <div
                    key={college.id}
                    className={`md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 sm:px-6 py-4 ${
                      index !== colleges.length - 1 ? "border-b border-gray-200" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Preview - Logo */}
                        <div className="flex-shrink-0">
                          {college.images && college.images.length > 0 ? (
                            <div className="w-16 h-16 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                              <Image
                                src={college.images[0]}
                                alt={`${college.name} logo`}
                                width={64}
                                height={64}
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200 shadow-sm">
                              {getInitials(college.name)}
                            </div>
                          )}
                        </div>

                        {/* College Name */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/colleges/${college.slug}`} className="hover:underline">
                            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                              {college.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                            <MapPin className="h-3 w-3" />
                            <span>{college.city || college.location || "N/A"}</span>
                            {college.state && <span>, {college.state}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {college.ranking && (
                              <Badge variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                #{college.ranking}
                              </Badge>
                            )}
                            {college.accreditation && (
                              <Badge variant="outline" className="text-xs">
                                {college.accreditation}
                              </Badge>
                            )}
                          </div>
                          {college.averagePackage && (
                            <div className="flex items-center gap-1 text-sm">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span className="font-medium text-green-700">
                                {formatCurrency(college.averagePackage)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Link href={`/colleges/${college.slug}`}>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm">
                          VIEW MORE
                        </Button>
                      </Link>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:contents">
                    {/* Preview - Logo */}
                    <div className="col-span-2 flex justify-center">
                      {college.images && college.images.length > 0 ? (
                        <div className="w-20 h-20 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                          <Image
                            src={college.images[0]}
                            alt={`${college.name} logo`}
                            width={80}
                            height={80}
                            className="object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200 shadow-sm">
                          {getInitials(college.name)}
                        </div>
                      )}
                    </div>

                    {/* College Name */}
                    <div className="col-span-4">
                      <Link href={`/colleges/${college.slug}`} className="hover:underline">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {college.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {college.ranking && (
                          <Badge variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            #{college.ranking}
                          </Badge>
                        )}
                        {college.accreditation && (
                          <Badge variant="outline" className="text-xs">
                            {college.accreditation}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{college.city || college.location || "N/A"}</span>
                      </div>
                      {college.state && (
                        <p className="text-xs text-gray-500 mt-0.5">{college.state}</p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="col-span-2">
                      <div className="space-y-1 text-xs">
                        {college.averagePackage && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-green-700">
                              {formatCurrency(college.averagePackage)}
                            </span>
                          </div>
                        )}
                        {college.establishedYear && (
                          <div className="text-gray-600">
                            Est. {college.establishedYear}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="col-span-2 flex justify-center">
                      <Link href={`/colleges/${college.slug}`}>
                        <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm">
                          VIEW MORE
                        </Button>
                      </Link>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {colleges.map((college) => (
                  <div
                    key={college.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    {/* College Image/Logo */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-700">
                      {college.images && college.images.length > 0 ? (
                        <Image
                          src={college.images[0]}
                          alt={college.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                          {getInitials(college.name)}
                        </div>
                      )}
                      {college.ranking && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold text-gray-900">
                          <Award className="h-3 w-3" />
                          #{college.ranking}
                        </div>
                      )}
                    </div>

                    {/* College Info */}
                    <div className="p-4">
                      <Link href={`/colleges/${college.slug}`}>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-red-600 transition-colors line-clamp-2">
                          {college.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{college.city || college.location || "N/A"}</span>
                        {college.state && <span>, {college.state}</span>}
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-2 mb-4">
                        {college.averagePackage && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Avg Package</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(college.averagePackage)}
                            </span>
                          </div>
                        )}
                        {college.establishedYear && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Established</span>
                            <span className="font-medium">{college.establishedYear}</span>
                          </div>
                        )}
                        {college.accreditation && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {college.accreditation}
                            </Badge>
                            {college.ownership && (
                              <Badge variant="outline" className="text-xs">
                                {college.ownership}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <Link href={`/colleges/${college.slug}`}>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 sm:px-6 mt-8">
            <CollegePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

