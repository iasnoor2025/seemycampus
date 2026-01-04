"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitCompare, Grid3x3, List, Star, MapPin, Award, TrendingUp, Building } from "lucide-react"
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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
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
    cutoffExam: "",
    cutoffCategory: "",
    cutoffYear: "",
    cutoffRankMin: "",
    cutoffRankMax: "",
    placementPackageMin: "",
    placementPackageMax: "",
    placementPercentageMin: "",
    rankingMin: "",
    rankingMax: "",
    rankingSource: "",
    rankingCategory: "",
    accreditation: "",
    campusSizeMin: "",
    totalStudentsMin: "",
    establishedYearMin: "",
    establishedYearMax: "",
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white py-12 md:py-16 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                  <Building className="w-5 h-5" />
                  <span className="font-medium text-sm">College Directory</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
                  Browse Colleges
                </h1>
                <p className="text-xl text-white/90 max-w-2xl">
                  Explore our comprehensive directory of colleges and universities
                </p>
              </div>
              <Link href="/compare">
                <Button 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare Colleges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4">
            <CollegeFilters
              onFilterChange={handleFilterChange}
              onSearchChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Results Count and Controls */}
        {!loading && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-gray-700 font-medium">
              Found <span className="font-bold text-blue-600">{totalCount}</span> colleges
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={sortBy} onValueChange={(value) => handleSortChange(value ?? "relevance")}>
                <SelectTrigger className="w-full sm:w-48 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="fees">Fees (High to Low)</SelectItem>
                  <SelectItem value="ranking">Ranking (Best First)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : ""}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table Header - Only for list view */}
        {viewMode === "list" && !loading && colleges.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
            <div className="hidden md:grid grid-cols-12 gap-4 py-2 font-semibold text-gray-900">
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
          <div className="py-12 text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading colleges...</p>
          </div>
        )}

        {/* Colleges List */}
        {!loading && colleges.length === 0 && (
          <div className="py-16 text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No colleges found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {!loading && colleges.length > 0 && (
          <>
            {viewMode === "list" ? (
              <div className="space-y-4">
                {colleges.map((college, index) => (
                  <div
                    key={college.id}
                    className={`md:grid md:grid-cols-12 md:gap-4 md:items-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 p-4 md:p-6`}
                  >
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Preview - Logo */}
                        <div className="flex-shrink-0">
                          {college.images && college.images.length > 0 && !imageErrors.has(college.id) ? (
                            <div className="w-16 h-16 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                              <Image
                                src={college.images[0]}
                                alt={`${college.name} logo`}
                                width={64}
                                height={64}
                                className="object-contain p-1"
                                loading="lazy"
                                quality={75}
                                decoding="async"
                                sizes="64px"
                                onError={() => {
                                  setImageErrors(prev => new Set(prev).add(college.id))
                                }}
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
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                          VIEW MORE
                        </Button>
                      </Link>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:contents">
                    {/* Preview - Logo */}
                    <div className="col-span-2 flex justify-center">
                      {college.images && college.images.length > 0 && !imageErrors.has(college.id) ? (
                        <div className="w-20 h-20 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                          <Image
                            src={college.images[0]}
                            alt={`${college.name} logo`}
                            width={80}
                            height={80}
                            className="object-contain p-1"
                            loading="lazy"
                            quality={75}
                            decoding="async"
                            sizes="80px"
                            onError={() => {
                              setImageErrors(prev => new Set(prev).add(college.id))
                            }}
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
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                          VIEW MORE
                        </Button>
                      </Link>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((college, index) => {
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
                    <div
                      key={college.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-slate-200"
                    >
                      {/* College Image/Logo */}
                      <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
                      {college.images && college.images.length > 0 ? (
                        <Image
                          src={college.images[0]}
                          alt={college.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain p-4"
                          loading="lazy"
                          quality={75}
                          decoding="async"
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
                      <div className="p-5">
                        <Link href={`/colleges/${college.slug}`}>
                          <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {college.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
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
                          <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold shadow-md hover:shadow-lg transition-all`}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8">
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

