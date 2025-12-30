"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, GraduationCap, MapPin, Building, Award, Users, Calendar, Globe, Mail, Phone, TrendingUp, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useDebounce } from "@/lib/hooks/useDebounce"

// Helper function to get college initials
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter((char) => char && /[A-Za-z]/.test(char))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface College {
  id: number
  name: string
  slug: string
  location: string | null
  city: string | null
  state: string | null
  description: string | null
  images: string[] | null
  ranking: number | null
  establishedYear: number | null
  accreditation: string | null
  hostelFees: number | null
  averagePackage: number | null
  highestPackage: number | null
  ownership: string | null
  campusSize: string | null
  totalStudents: number | null
  website: string | null
  email: string | null
  phone: string | null
  entranceExams: string[] | null
}

export function CollegeComparison() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<College[]>([])
  const [selectedColleges, setSelectedColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [collegeDetails, setCollegeDetails] = useState<Record<number, College>>({})
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [cutoffsData, setCutoffsData] = useState<Record<number, any[]>>({})
  const [placementsData, setPlacementsData] = useState<Record<number, any>>({})
  const [rankingsData, setRankingsData] = useState<Record<number, any[]>>({})

  const MAX_COMPARISONS = 4

  useEffect(() => {
    // Load selected colleges from URL params or localStorage
    const params = new URLSearchParams(window.location.search)
    const collegeIds = params.get("colleges")?.split(",").filter(Boolean).map(Number) || []
    
    if (collegeIds.length > 0) {
      fetchCollegesByIds(collegeIds)
    } else {
      // Try loading from localStorage
      const saved = localStorage.getItem("comparison_colleges")
      if (saved) {
        try {
          const ids = JSON.parse(saved)
          if (Array.isArray(ids) && ids.length > 0) {
            fetchCollegesByIds(ids)
          }
        } catch (e) {
          console.error("Error loading saved colleges:", e)
        }
      }
    }
  }, [])

  // Fetch additional data (cutoffs, placements, rankings) when colleges are selected
  useEffect(() => {
    if (selectedColleges.length > 0) {
      selectedColleges.forEach((college) => {
        fetchCutoffs(college.id)
        fetchPlacements(college.id)
        fetchRankings(college.id)
      })
    }
  }, [selectedColleges])

  const fetchCutoffs = async (collegeId: number) => {
    try {
      const response = await fetch(`/api/cutoffs?collegeId=${collegeId}&year=${new Date().getFullYear()}`)
      if (response.ok) {
        const data = await response.json()
        setCutoffsData((prev) => ({ ...prev, [collegeId]: data.cutoffs || [] }))
      }
    } catch (error) {
      console.error("Error fetching cutoffs:", error)
    }
  }

  const fetchPlacements = async (collegeId: number) => {
    try {
      const response = await fetch(`/api/placements?collegeId=${collegeId}&year=${new Date().getFullYear()}`)
      if (response.ok) {
        const data = await response.json()
        setPlacementsData((prev) => ({
          ...prev,
          [collegeId]: data.placements?.[0] || null,
        }))
      }
    } catch (error) {
      console.error("Error fetching placements:", error)
    }
  }

  const fetchRankings = async (collegeId: number) => {
    try {
      const response = await fetch(`/api/rankings?collegeId=${collegeId}`)
      if (response.ok) {
        const data = await response.json()
        setRankingsData((prev) => ({ ...prev, [collegeId]: data.rankings || [] }))
      }
    } catch (error) {
      console.error("Error fetching rankings:", error)
    }
  }

  const fetchCollegesByIds = async (ids: number[]) => {
    try {
      setLoading(true)
      const colleges: College[] = []
      
      for (const id of ids.slice(0, MAX_COMPARISONS)) {
        try {
          const response = await fetch(`/api/colleges/by-id/${id}`)
          if (response.ok) {
            const college = await response.json()
            colleges.push(college)
            setCollegeDetails(prev => ({ ...prev, [college.id]: college }))
          }
        } catch (err) {
          console.error(`Error fetching college ${id}:`, err)
        }
      }
      
      if (colleges.length > 0) {
        setSelectedColleges(colleges)
        // Save to localStorage
        localStorage.setItem("comparison_colleges", JSON.stringify(colleges.map(c => c.id)))
      }
    } catch (error) {
      console.error("Error fetching colleges:", error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Effect to trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const performSearch = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/colleges/search?search=${encodeURIComponent(debouncedSearchQuery)}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.colleges || [])
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearchQuery])

  const addCollege = (college: College) => {
    if (selectedColleges.length >= MAX_COMPARISONS) {
      alert(`You can compare up to ${MAX_COMPARISONS} colleges at once.`)
      return
    }

    if (selectedColleges.some(c => c.id === college.id)) {
      alert("This college is already in the comparison.")
      return
    }

    const newSelected = [...selectedColleges, college]
    setSelectedColleges(newSelected)
    setCollegeDetails(prev => ({ ...prev, [college.id]: college }))
    setSearchQuery("")
    setSearchResults([])
    
    // Save to localStorage
    localStorage.setItem("comparison_colleges", JSON.stringify(newSelected.map(c => c.id)))
    
    // Update URL
    const params = new URLSearchParams()
    params.set("colleges", newSelected.map(c => c.id).join(","))
    window.history.pushState({}, "", `/compare?${params.toString()}`)
  }

  const removeCollege = (collegeId: number) => {
    const newSelected = selectedColleges.filter(c => c.id !== collegeId)
    setSelectedColleges(newSelected)
    
    // Save to localStorage
    if (newSelected.length > 0) {
      localStorage.setItem("comparison_colleges", JSON.stringify(newSelected.map(c => c.id)))
      const params = new URLSearchParams()
      params.set("colleges", newSelected.map(c => c.id).join(","))
      window.history.pushState({}, "", `/compare?${params.toString()}`)
    } else {
      localStorage.removeItem("comparison_colleges")
      window.history.pushState({}, "", "/compare")
    }
  }

  const formatCurrency = (amount: number | null, currency: string = "INR") => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading && selectedColleges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading colleges...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Add Colleges */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white text-2xl">Add Colleges to Compare</CardTitle>
          <p className="text-white/90 text-sm">
            Search and select up to {MAX_COMPARISONS} colleges to compare
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search colleges by name, location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    // Search will be triggered automatically via debounced effect
                  }}
                  className="pl-12 h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors text-base"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border-2 border-gray-200 rounded-xl max-h-60 overflow-y-auto bg-white shadow-sm">
                {searchResults.map((college) => (
                  <div
                    key={college.id}
                    className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between transition-all duration-200"
                    onClick={() => addCollege(college)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{college.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {college.city || college.location || "Location not specified"}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Colleges Preview */}
            {selectedColleges.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold mb-3 text-gray-900">
                  Selected Colleges ({selectedColleges.length}/{MAX_COMPARISONS}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedColleges.map((college) => (
                    <Badge 
                      key={college.id} 
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 text-sm font-medium"
                    >
                      {college.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCollege(college.id)
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison - Mobile Card View */}
      {selectedColleges.length > 0 && (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                College Comparison
              </h2>
              <p className="text-sm text-gray-600">
                Compare selected colleges side-by-side
              </p>
            </div>
            
            {selectedColleges.map((college, index) => {
              const gradients = [
                "from-blue-500 to-cyan-600",
                "from-indigo-500 to-purple-600",
                "from-violet-500 to-purple-600",
                "from-teal-500 to-emerald-600",
              ]
              const gradient = gradients[index % gradients.length]

              return (
                <Card key={college.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className={`bg-gradient-to-br ${gradient} text-white rounded-t-lg pb-2`}>
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className={`w-16 h-16 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0 border border-white/30`}>
                      {college.images && college.images.length > 0 && college.images[0] && !imageErrors.has(college.id) ? (
                        <Image
                          src={Array.isArray(college.images) ? college.images[0] : college.images}
                          alt={college.name}
                          width={64}
                          height={64}
                          className="object-contain bg-white p-1"
                          style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(college.id))
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {getInitials(college.name)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/colleges/${college.slug}`} className="hover:underline">
                        <CardTitle className="text-white text-lg line-clamp-2">{college.name}</CardTitle>
                      </Link>
                      <p className="text-sm text-white/90 mt-1">
                        📍 {college.city || college.location || "N/A"}{college.state && `, ${college.state}`}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCollege(college.id)}
                      className="text-white hover:bg-white/20 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div>
                        <p className="text-muted-foreground text-xs">Ranking</p>
                        <p className="font-medium">{college.ranking ? `#${college.ranking}` : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Established</p>
                        <p className="font-medium">{college.establishedYear || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Accreditation</p>
                        <p className="font-medium">{college.accreditation || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Ownership</p>
                        <p className="font-medium">{college.ownership || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Students</p>
                        <p className="font-medium">{college.totalStudents ? college.totalStudents.toLocaleString() : "N/A"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-muted-foreground text-xs">Hostel Fees</p>
                        <p className="font-medium">{formatCurrency(college.hostelFees)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Avg Package</p>
                        <p className="font-medium">{formatCurrency(college.averagePackage)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Highest Package</p>
                        <p className="font-medium">{formatCurrency(college.highestPackage)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Campus Size</p>
                        <p className="font-medium">{college.campusSize || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entrance Exams */}
                  {college.entranceExams && college.entranceExams.length > 0 && (
                    <div className="mt-3">
                      <p className="text-muted-foreground text-xs mb-1">Entrance Exams</p>
                      <div className="flex flex-wrap gap-1">
                        {college.entranceExams.slice(0, 4).map((exam, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {exam}
                          </Badge>
                        ))}
                        {college.entranceExams.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{college.entranceExams.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Link href={`/colleges/${college.slug}`} className="block mt-4">
                    <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold`}>
                      View Full Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              )
            })}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-white text-2xl">College Comparison</CardTitle>
              <p className="text-white/90 text-sm">
                Side-by-side comparison of selected colleges
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
                      <th className="text-left p-4 font-bold text-gray-900 sticky left-0 bg-gradient-to-r from-slate-50 to-blue-50 z-10 min-w-[150px] lg:min-w-[200px] border-r-2 border-gray-200">
                        Criteria
                      </th>
                      {selectedColleges.map((college, index) => {
                        const gradients = [
                          "from-blue-500 to-cyan-600",
                          "from-indigo-500 to-purple-600",
                          "from-violet-500 to-purple-600",
                          "from-teal-500 to-emerald-600",
                        ]
                        const gradient = gradients[index % gradients.length]

                        return (
                          <th key={college.id} className="text-left p-4 font-semibold min-w-[200px] lg:min-w-[250px] border-l border-gray-200">
                            <div className="space-y-2">
                              <div className={`relative w-full h-24 lg:h-32 mb-2 rounded-lg overflow-hidden bg-gradient-to-br ${gradient} shadow-md`}>
                              {college.images && college.images.length > 0 && college.images[0] && !imageErrors.has(college.id) ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={Array.isArray(college.images) ? college.images[0] : college.images}
                                    alt={college.name}
                                    fill
                                    sizes="(max-width: 768px) 200px, 250px"
                                    className="object-contain rounded bg-white p-2"
                                    onError={() => {
                                      setImageErrors(prev => new Set(prev).add(college.id))
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl lg:text-2xl">
                                  {getInitials(college.name)}
                                </div>
                              )}
                            </div>
                            <Link href={`/colleges/${college.slug}`} className="hover:underline">
                              <p className="font-bold text-sm lg:text-lg line-clamp-2 text-gray-900">{college.name}</p>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCollege(college.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                  {/* Location */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Location
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.city || college.location || "N/A"}
                        {college.state && <span className="text-gray-600">, {college.state}</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Ranking */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        Ranking
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.ranking ? `#${college.ranking}` : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Established Year */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Established
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.establishedYear || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Accreditation */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        Accreditation
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.accreditation || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Ownership */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        Ownership
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.ownership || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Campus Size */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        Campus Size
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.campusSize || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Total Students */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        Total Students
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.totalStudents ? college.totalStudents.toLocaleString() : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Hostel Fees */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">₹</span>
                        Hostel Fees (per year)
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {formatCurrency(college.hostelFees)}
                      </td>
                    ))}
                  </tr>

                  {/* Average Package */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">₹</span>
                        Average Package
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {formatCurrency(college.averagePackage)}
                      </td>
                    ))}
                  </tr>

                  {/* Highest Package */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">₹</span>
                        Highest Package
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {formatCurrency(college.highestPackage)}
                      </td>
                    ))}
                  </tr>

                  {/* Entrance Exams */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        Entrance Exams
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        {college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0
                          ? (
                              <div className="flex flex-wrap gap-1">
                                {college.entranceExams.map((exam, idx) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                                    {exam}
                                  </Badge>
                                ))}
                              </div>
                            )
                          : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Contact Information */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Contact
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        <div className="space-y-1 text-sm">
                          {college.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-500" />
                              {college.phone}
                            </div>
                          )}
                          {college.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-500" />
                              {college.email}
                            </div>
                          )}
                          {college.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-gray-500" />
                              <a
                                href={college.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                          {!college.phone && !college.email && !college.website && "N/A"}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr className="border-b hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r-2 border-gray-200">
                      Description
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {college.description || "N/A"}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Placement Statistics */}
                  <tr className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-gradient-to-r from-blue-50 to-cyan-50 z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        Placement (Latest Year)
                      </div>
                    </td>
                    {selectedColleges.map((college) => {
                      const placement = placementsData[college.id]
                      return (
                        <td key={college.id} className="p-4 border-l border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                          {placement ? (
                            <div className="space-y-1 text-sm">
                              <div className="font-medium">Avg: {formatCurrency(placement.averagePackage)}</div>
                              <div className="font-medium">Highest: {formatCurrency(placement.highestPackage)}</div>
                              <div>%: {placement.placementPercentage || "N/A"}{placement.placementPercentage && "%"}</div>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Cutoff Information */}
                  <tr className="border-b bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-600" />
                        Recent Cutoffs
                      </div>
                    </td>
                    {selectedColleges.map((college) => {
                      const cutoffs = cutoffsData[college.id] || []
                      const latestCutoff = cutoffs[0]
                      return (
                        <td key={college.id} className="p-4 border-l border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                          {latestCutoff ? (
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold">{latestCutoff.examName}</div>
                              <div>
                                {latestCutoff.closingRank
                                  ? `Rank: ${latestCutoff.closingRank.toLocaleString()}`
                                  : latestCutoff.closingScore
                                  ? `Score: ${latestCutoff.closingScore}`
                                  : "N/A"}
                              </div>
                              {latestCutoff.category && (
                                <div className="text-xs text-gray-600">
                                  {latestCutoff.category}
                                </div>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Rankings */}
                  <tr className="border-b bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 sticky left-0 bg-gradient-to-r from-purple-50 to-pink-50 z-10 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        Rankings
                      </div>
                    </td>
                    {selectedColleges.map((college) => {
                      const rankings = rankingsData[college.id] || []
                      const nirfRanking = rankings.find((r: any) => r.rankingSource === "NIRF")
                      return (
                        <td key={college.id} className="p-4 border-l border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                          {nirfRanking ? (
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold">NIRF: #{nirfRanking.rank}</div>
                              {nirfRanking.category && (
                                <div className="text-xs text-gray-600">
                                  {nirfRanking.category}
                                </div>
                              )}
                            </div>
                          ) : college.ranking ? (
                            <div className="text-sm font-medium">#{college.ranking}</div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* View Details */}
                  <tr>
                    <td className="p-4 sticky left-0 bg-white z-10 border-r-2 border-gray-200"></td>
                    {selectedColleges.map((college, index) => {
                      const gradients = [
                        "from-blue-600 to-cyan-600",
                        "from-indigo-600 to-purple-600",
                        "from-violet-600 to-purple-600",
                        "from-teal-600 to-emerald-600",
                      ]
                      const gradient = gradients[index % gradients.length]

                      return (
                        <td key={college.id} className="p-4 border-l border-gray-200">
                          <Link href={`/colleges/${college.slug}`}>
                            <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold`}>
                              View Full Details
                            </Button>
                          </Link>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {selectedColleges.length === 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Colleges Selected</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No colleges selected for comparison. Search and add colleges above to get started.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Search className="h-4 w-4" />
              <span>Start typing to search colleges</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

