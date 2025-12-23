"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, GitCompare, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface CollegeCardProps {
  // Support both individual props and college object
  college?: any
  id?: number
  name?: string
  slug?: string
  location?: string | null
  city?: string | null
  description?: string | null
  images?: string[] | null
}

export function CollegeCard(props: CollegeCardProps) {
  // Support both prop patterns
  const college = props.college || props
  const id = college.id || props.id!
  const name = college.name || props.name!
  const slug = college.slug || props.slug!
  const location = college.location || props.location
  const city = college.city || props.city
  const description = college.description || props.description
  const images = college.images || props.images

  const router = useRouter()
  const { data: session } = useSession()
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Check if college is saved
  useEffect(() => {
    if (session?.user) {
      checkSavedStatus()
    }
  }, [session, id])

  const checkSavedStatus = async () => {
    try {
      const response = await fetch("/api/student/saved-colleges")
      if (response.ok) {
        const data = await response.json()
        const saved = data.savedColleges || []
        setIsSaved(saved.some((item: any) => item.collegeId === id))
      }
    } catch (err) {
      // Silently fail - user might not be logged in
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }

    setSaving(true)
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `/api/student/saved-colleges?collegeId=${id}`,
          { method: "DELETE" }
        )
        if (response.ok) {
          setIsSaved(false)
        }
      } else {
        // Save
        const response = await fetch("/api/student/saved-colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: id }),
        })
        if (response.ok) {
          setIsSaved(true)
        }
      }
    } catch (err) {
      console.error("Error saving/unsaving college:", err)
    } finally {
      setSaving(false)
    }
  }

  const imageUrl = images && images.length > 0 ? images[0] : "/placeholder-college.jpg"
  const displayLocation = city || location || "Location not specified"

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Get existing comparison colleges from localStorage
    const saved = localStorage.getItem("comparison_colleges")
    let collegeIds: number[] = []
    
    if (saved) {
      try {
        collegeIds = JSON.parse(saved)
        if (!Array.isArray(collegeIds)) collegeIds = []
      } catch (e) {
        collegeIds = []
      }
    }
    
    // Add this college if not already in list and under limit
    if (!collegeIds.includes(id) && collegeIds.length < 4) {
      collegeIds.push(id)
      localStorage.setItem("comparison_colleges", JSON.stringify(collegeIds))
    } else if (collegeIds.includes(id)) {
      // Already in comparison, just navigate
    } else {
      alert("You can compare up to 4 colleges at once. Please remove one from the comparison page.")
      router.push("/compare")
      return
    }
    
    // Navigate to comparison page
    router.push(`/compare?colleges=${collegeIds.join(",")}`)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {displayLocation}
        </CardDescription>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </CardContent>
      )}
      <CardFooter className="flex gap-2">
        <Link href={`/colleges/${slug}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {session?.user && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSave}
            title={isSaved ? "Remove from saved" : "Save college"}
            disabled={saving}
          >
            <Heart
              className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={handleCompare}
          title="Add to comparison"
        >
          <GitCompare className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

