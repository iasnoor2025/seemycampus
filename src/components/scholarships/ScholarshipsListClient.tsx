"use client"

import { useState, useEffect } from "react"
import { ScholarshipCard } from "./ScholarshipCard"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Scholarship {
  id: number
  title: string
  slug: string
  description: string | null
  provider: string | null
  amount: number | null
  amountCurrency: string
  amountType: string | null
  eligibilityCriteria: string | null
  applicationDeadline: string | null
  applicationStartDate: string | null
  applicationUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  category: string | null
  level: string | null
  course: string | null
  collegeId: number | null
  college: any
  isActive: boolean
}

export function ScholarshipsListClient() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")

  useEffect(() => {
    fetchScholarships()
  }, [categoryFilter, levelFilter])

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (levelFilter !== "all") params.append("level", levelFilter)
      params.append("activeOnly", "true")

      const response = await fetch(`/api/scholarships?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setScholarships(data.scholarships || [])
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchScholarships()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="merit-based">Merit-Based</SelectItem>
              <SelectItem value="need-based">Need-Based</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="minority">Minority</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value || "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
              <SelectItem value="diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Search Scholarships
          </Button>
        </div>
      </div>

      {/* Results */}
      {scholarships.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">
            No scholarships found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Found {scholarships.length} scholarship{scholarships.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

