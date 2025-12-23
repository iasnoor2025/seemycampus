"use client"

import { useState, useEffect } from "react"
import { CollegeCard } from "@/components/college/CollegeCard"
import { Loader2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SavedCollege {
  id: number
  collegeId: number
  createdAt: string
  college: any
}

export function SavedCollegesTab() {
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedColleges()
  }, [])

  const fetchSavedColleges = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/saved-colleges")
      if (response.ok) {
        const data = await response.json()
        setSavedColleges(data.savedColleges || [])
      } else {
        setError("Failed to load saved colleges")
      }
    } catch (err) {
      setError("Failed to load saved colleges")
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (collegeId: number) => {
    try {
      const response = await fetch(
        `/api/student/saved-colleges?collegeId=${collegeId}`,
        {
          method: "DELETE",
        }
      )
      if (response.ok) {
        setSavedColleges((prev) =>
          prev.filter((item) => item.collegeId !== collegeId)
        )
      }
    } catch (err) {
      console.error("Error unsaving college:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (savedColleges.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No saved colleges yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start exploring colleges and save your favorites to compare them later.
        </p>
        <Link href="/colleges">
          <Button>Browse Colleges</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {savedColleges.length} saved {savedColleges.length === 1 ? "college" : "colleges"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedColleges.map((item) => (
          <div key={item.id} className="relative">
            <CollegeCard college={item.college} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnsave(item.collegeId)}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

