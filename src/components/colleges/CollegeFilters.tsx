"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, Filter } from "lucide-react"
import { useDebounce } from "@/lib/hooks/useDebounce"

interface CollegeFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onSearchChange: (search: string) => void
}

export interface FilterState {
  search: string
  location: string
  state: string
  course: string
  feesMin: string
  feesMax: string
  entranceExam: string
  ownership: string
  academicAlliance: boolean | null
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
]

const ENTRANCE_EXAMS = [
  "CAT", "GMAT", "GRE", "XAT", "MAT", "CMAT", "SNAP", "NMAT", "IIFT",
  "JEE Main", "JEE Advanced", "GATE", "NEET", "CLAT", "AILET", "LSAT"
]

const COURSE_TYPES = [
  "MBA", "PGDM", "BBA", "BBM", "Executive MBA",
  "BE", "B.Tech", "ME", "M.Tech", "Diploma in Engg.",
  "MBBS", "PG Medical",
  "LLB", "LLM",
  "B.Des", "M.Des"
]

export function CollegeFilters({ onFilterChange, onSearchChange }: CollegeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    state: "",
    course: "",
    feesMin: "",
    feesMax: "",
    entranceExam: "",
    ownership: "",
    academicAlliance: null,
  })

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 500)

  // Effect to trigger search when debounced value changes
  useEffect(() => {
    const newFilters = { ...filters, search: debouncedSearch }
    onFilterChange(newFilters)
    onSearchChange(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // For non-search filters, update immediately
    if (key !== "search") {
      onFilterChange(newFilters)
    }
  }

  const handleSearchChange = (value: string) => {
    // Update local state immediately for responsive UI
    setFilters((prev) => ({ ...prev, search: value }))
    // Debounced search will trigger via useEffect
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      location: "",
      state: "",
      course: "",
      feesMin: "",
      feesMax: "",
      entranceExam: "",
      ownership: "",
      academicAlliance: null,
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
    onSearchChange("")
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== false
  )

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl">Search & Filter Colleges</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search colleges by name, location, or course..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-6 text-base"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                City
              </label>
              <Input
                placeholder="Enter city"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />
            </div>

            {/* State */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                State
              </label>
              <Select
                value={filters.state}
                onValueChange={(value) => handleFilterChange("state", value)}
              >
                <SelectTrigger>
                  <SelectValue>{filters.state || "Select state"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Course Type
              </label>
              <Select
                value={filters.course}
                onValueChange={(value) => handleFilterChange("course", value)}
              >
                <SelectTrigger>
                  <SelectValue>{filters.course || "Select course"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {COURSE_TYPES.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entrance Exam */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Entrance Exam
              </label>
              <Select
                value={filters.entranceExam}
                onValueChange={(value) => handleFilterChange("entranceExam", value)}
              >
                <SelectTrigger>
                  <SelectValue>{filters.entranceExam || "Select exam"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Exams</SelectItem>
                  {ENTRANCE_EXAMS.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fees Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Min Fees (₹)
              </label>
              <Input
                type="number"
                placeholder="Min fees"
                value={filters.feesMin}
                onChange={(e) => handleFilterChange("feesMin", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Fees (₹)
              </label>
              <Input
                type="number"
                placeholder="Max fees"
                value={filters.feesMax}
                onChange={(e) => handleFilterChange("feesMax", e.target.value)}
              />
            </div>

            {/* Ownership */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ownership
              </label>
              <Select
                value={filters.ownership}
                onValueChange={(value) => handleFilterChange("ownership", value)}
              >
                <SelectTrigger>
                  <SelectValue>{filters.ownership || "Select ownership"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Academic Alliance */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Academic Alliance
              </label>
              <Select
                value={
                  filters.academicAlliance === null
                    ? ""
                    : filters.academicAlliance
                    ? "true"
                    : "false"
                }
                onValueChange={(value) =>
                  handleFilterChange(
                    "academicAlliance",
                    value === "" ? null : value === "true"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {filters.academicAlliance === null
                      ? "All colleges"
                      : filters.academicAlliance
                      ? "Academic Alliance Only"
                      : "Non-Alliance"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Colleges</SelectItem>
                  <SelectItem value="true">Academic Alliance Only</SelectItem>
                  <SelectItem value="false">Non-Alliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

