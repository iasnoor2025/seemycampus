"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, Filter } from "lucide-react"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { SearchAutocomplete } from "./SearchAutocomplete"

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
  // Cutoff-based filters
  cutoffExam: string
  cutoffCategory: string
  cutoffYear: string
  cutoffRankMin: string
  cutoffRankMax: string
  // Placement filters
  placementPackageMin: string
  placementPackageMax: string
  placementPercentageMin: string
  // Ranking filters
  rankingMin: string
  rankingMax: string
  rankingSource: string
  rankingCategory: string
  // Additional filters
  accreditation: string
  campusSizeMin: string
  totalStudentsMin: string
  establishedYearMin: string
  establishedYearMax: string
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

const CUTOFF_CATEGORIES = [
  "General", "OBC", "SC", "ST", "EWS", "PWD"
]

const RANKING_SOURCES = [
  "NIRF", "QS", "Times", "Outlook", "India Today"
]

const RANKING_CATEGORIES = [
  "Overall", "Engineering", "Management", "Medical", "Law", "Pharmacy"
]

const ACCREDITATIONS = [
  "AICTE", "UGC", "NAAC", "NBA", "NIRF"
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
          <SearchAutocomplete
            placeholder="Search colleges by name, location, or course..."
            onSearch={(query) => {
              handleSearchChange(query)
            }}
            size="default"
          />
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
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

            {/* Cutoff Filters Section */}
            <div className="col-span-full border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Cutoff Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Exam for Cutoff
                  </label>
                  <Select
                    value={filters.cutoffExam}
                    onValueChange={(value) => handleFilterChange("cutoffExam", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{filters.cutoffExam || "Select exam"}</SelectValue>
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

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <Select
                    value={filters.cutoffCategory}
                    onValueChange={(value) => handleFilterChange("cutoffCategory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{filters.cutoffCategory || "Select category"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {CUTOFF_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Cutoff Year
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 2024"
                    value={filters.cutoffYear}
                    onChange={(e) => handleFilterChange("cutoffYear", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rank Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min rank"
                      value={filters.cutoffRankMin}
                      onChange={(e) => handleFilterChange("cutoffRankMin", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max rank"
                      value={filters.cutoffRankMax}
                      onChange={(e) => handleFilterChange("cutoffRankMax", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Placement Filters Section */}
            <div className="col-span-full border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Placement Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Average Package (₹) - Min
                  </label>
                  <Input
                    type="number"
                    placeholder="Min package"
                    value={filters.placementPackageMin}
                    onChange={(e) => handleFilterChange("placementPackageMin", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Average Package (₹) - Max
                  </label>
                  <Input
                    type="number"
                    placeholder="Max package"
                    value={filters.placementPackageMax}
                    onChange={(e) => handleFilterChange("placementPackageMax", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Placement % - Min
                  </label>
                  <Input
                    type="number"
                    placeholder="Min %"
                    min="0"
                    max="100"
                    value={filters.placementPercentageMin}
                    onChange={(e) => handleFilterChange("placementPercentageMin", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Ranking Filters Section */}
            <div className="col-span-full border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Ranking Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ranking Source
                  </label>
                  <Select
                    value={filters.rankingSource}
                    onValueChange={(value) => handleFilterChange("rankingSource", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{filters.rankingSource || "Select source"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sources</SelectItem>
                      {RANKING_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ranking Category
                  </label>
                  <Select
                    value={filters.rankingCategory}
                    onValueChange={(value) => handleFilterChange("rankingCategory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{filters.rankingCategory || "Select category"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {RANKING_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rank Range - Min
                  </label>
                  <Input
                    type="number"
                    placeholder="Min rank"
                    value={filters.rankingMin}
                    onChange={(e) => handleFilterChange("rankingMin", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rank Range - Max
                  </label>
                  <Input
                    type="number"
                    placeholder="Max rank"
                    value={filters.rankingMax}
                    onChange={(e) => handleFilterChange("rankingMax", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Additional Filters Section */}
            <div className="col-span-full border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Additional Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Accreditation
                  </label>
                  <Select
                    value={filters.accreditation}
                    onValueChange={(value) => handleFilterChange("accreditation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>{filters.accreditation || "Select accreditation"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {ACCREDITATIONS.map((acc) => (
                        <SelectItem key={acc} value={acc}>
                          {acc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Min Campus Size (acres)
                  </label>
                  <Input
                    type="number"
                    placeholder="Min size"
                    value={filters.campusSizeMin}
                    onChange={(e) => handleFilterChange("campusSizeMin", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Min Total Students
                  </label>
                  <Input
                    type="number"
                    placeholder="Min students"
                    value={filters.totalStudentsMin}
                    onChange={(e) => handleFilterChange("totalStudentsMin", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Established Year Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="From"
                      value={filters.establishedYearMin}
                      onChange={(e) => handleFilterChange("establishedYearMin", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="To"
                      value={filters.establishedYearMax}
                      onChange={(e) => handleFilterChange("establishedYearMax", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

