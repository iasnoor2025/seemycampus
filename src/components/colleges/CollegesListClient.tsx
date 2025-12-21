"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CollegeFilters, FilterState } from "./CollegeFilters"
import { CollegePagination } from "./CollegePagination"

interface College {
  id: number
  name: string
  slug: string
  location?: string | null
  city?: string | null
  images?: string[] | null
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

  const fetchColleges = async (page: number = 1, filterState: FilterState = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
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
      params.set("page", page.toString())
      params.set("limit", "20")

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
        <div className="px-6 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Browse Colleges
          </h1>
          <p className="text-gray-600">
            Explore our comprehensive directory of colleges and universities
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 mb-6">
          <CollegeFilters
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="px-6 mb-4">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{totalCount}</span> colleges
            </p>
          </div>
        )}

        {/* Table Header */}
        <div className="px-6 mb-4">
          <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
            <div className="col-span-2 text-center">PREVIEW</div>
            <div className="col-span-5">COLLEGE NAME</div>
            <div className="col-span-3">LOCATION</div>
            <div className="col-span-2 text-center">VIEW</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">Loading colleges...</p>
          </div>
        )}

        {/* Colleges List */}
        {!loading && colleges.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No colleges found. Try adjusting your filters.</p>
          </div>
        )}

        {!loading && colleges.length > 0 && (
          <div className="space-y-0">
            {colleges.map((college, index) => (
              <div
                key={college.id}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                  index !== colleges.length - 1 ? "border-b border-gray-200" : ""
                } hover:bg-gray-50 transition-colors`}
              >
                {/* Preview - Logo */}
                <div className="col-span-2 flex justify-center">
                  {college.images && college.images.length > 0 ? (
                    <Image
                      src={college.images[0]}
                      alt={`${college.name} logo`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200">
                      {getInitials(college.name)}
                    </div>
                  )}
                </div>

                {/* College Name */}
                <div className="col-span-5">
                  <h3 className="text-base font-semibold text-gray-900">
                    {college.name}
                  </h3>
                </div>

                {/* Location */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">
                    {college.location || college.city || "Location not specified"}
                  </p>
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
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 mt-8">
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

