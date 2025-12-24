"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, GraduationCap, MapPin, Building, DollarSign, Award, Users, Calendar, Globe, Mail, Phone } from "lucide-react"
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
    <div className="space-y-6">
      {/* Search and Add Colleges */}
      <Card>
        <CardHeader>
          <CardTitle>Add Colleges to Compare</CardTitle>
          <p className="text-sm text-muted-foreground">
            Search and select up to {MAX_COMPARISONS} colleges to compare
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search colleges by name, location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    // Search will be triggered automatically via debounced effect
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map((college) => (
                  <div
                    key={college.id}
                    className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                    onClick={() => addCollege(college)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{college.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {college.city || college.location || "Location not specified"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Colleges Preview */}
            {selectedColleges.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Colleges ({selectedColleges.length}/{MAX_COMPARISONS}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedColleges.map((college) => (
                    <Badge key={college.id} variant="secondary" className="flex items-center gap-1">
                      {college.name}
                      <button
                        onClick={() => removeCollege(college.id)}
                        className="ml-1 hover:text-destructive"
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
          <div className="md:hidden space-y-4">
            <h2 className="text-xl font-bold">College Comparison</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Compare selected colleges
            </p>
            
            {selectedColleges.map((college) => (
              <Card key={college.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0">
                      {college.images && college.images.length > 0 && college.images[0] && !imageErrors.has(college.id) ? (
                        <Image
                          src={Array.isArray(college.images) ? college.images[0] : college.images}
                          alt={college.name}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full bg-white p-1"
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
                        <CardTitle className="text-base line-clamp-2">{college.name}</CardTitle>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        📍 {college.city || college.location || "N/A"}{college.state && `, ${college.state}`}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCollege(college.id)}
                      className="text-destructive flex-shrink-0"
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
                    <Button variant="outline" className="w-full">
                      View Full Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>College Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Side-by-side comparison of selected colleges
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold sticky left-0 bg-background z-10 min-w-[150px] lg:min-w-[200px]">
                        Criteria
                      </th>
                      {selectedColleges.map((college) => (
                        <th key={college.id} className="text-left p-4 font-semibold min-w-[200px] lg:min-w-[250px] border-l">
                          <div className="space-y-2">
                            <div className="relative w-full h-24 lg:h-32 mb-2 rounded overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                              {college.images && college.images.length > 0 && college.images[0] && !imageErrors.has(college.id) ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={Array.isArray(college.images) ? college.images[0] : college.images}
                                    alt={college.name}
                                    fill
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
                              <p className="font-bold text-sm lg:text-lg line-clamp-2">{college.name}</p>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCollege(college.id)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                  {/* Location */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.city || college.location || "N/A"}
                        {college.state && <span className="text-muted-foreground">, {college.state}</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Ranking */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Ranking
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.ranking ? `#${college.ranking}` : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Established Year */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Established
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.establishedYear || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Accreditation */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Accreditation
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.accreditation || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Ownership */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Ownership
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.ownership || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Campus Size */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Campus Size
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.campusSize || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Total Students */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total Students
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.totalStudents ? college.totalStudents.toLocaleString() : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Hostel Fees */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Hostel Fees (per year)
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {formatCurrency(college.hostelFees)}
                      </td>
                    ))}
                  </tr>

                  {/* Average Package */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Average Package
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {formatCurrency(college.averagePackage)}
                      </td>
                    ))}
                  </tr>

                  {/* Highest Package */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Highest Package
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {formatCurrency(college.highestPackage)}
                      </td>
                    ))}
                  </tr>

                  {/* Entrance Exams */}
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Entrance Exams
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        {college.entranceExams && Array.isArray(college.entranceExams) && college.entranceExams.length > 0
                          ? (
                              <div className="flex flex-wrap gap-1">
                                {college.entranceExams.map((exam, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
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
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact
                      </div>
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        <div className="space-y-1 text-sm">
                          {college.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {college.phone}
                            </div>
                          )}
                          {college.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {college.email}
                            </div>
                          )}
                          {college.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              <a
                                href={college.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
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
                  <tr className="border-b">
                    <td className="p-4 font-medium sticky left-0 bg-background z-10">
                      Description
                    </td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {college.description || "N/A"}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* View Details */}
                  <tr>
                    <td className="p-4 sticky left-0 bg-background z-10"></td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="p-4 border-l">
                        <Link href={`/colleges/${college.slug}`}>
                          <Button variant="outline" className="w-full">
                            View Full Details
                          </Button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {selectedColleges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No colleges selected for comparison. Search and add colleges above to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

