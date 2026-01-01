"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Mail, Phone, GitCompare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShareButton } from "@/components/ui/ShareButton"

interface CollegeHeroProps {
  name: string
  collegeId?: number
  location?: string | null
  city?: string | null
  website?: string | null
  email?: string | null
  phone?: string | null
  images?: string[] | null
  brochureUrl?: string | null
}

export function CollegeHero({
  name,
  collegeId,
  location,
  city,
  website,
  email,
  phone,
  images,
  brochureUrl,
}: CollegeHeroProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const imageUrl = images && images.length > 0 && !imageError ? images[0] : "/placeholder-college.jpg"
  const displayLocation = city || location || "Location not specified"

  const handleCompare = () => {
    if (!collegeId || typeof window === "undefined") return
    
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
    if (!collegeIds.includes(collegeId) && collegeIds.length < 4) {
      collegeIds.push(collegeId)
      localStorage.setItem("comparison_colleges", JSON.stringify(collegeIds))
    } else if (collegeIds.includes(collegeId)) {
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
    <div className="relative w-full h-[400px] mb-8">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        onError={() => {
          setImageError(true)
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">{name}</h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>{displayLocation}</span>
          </div>
          {website && (
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline"
            >
              <Globe className="h-5 w-5" />
              <span>Website</span>
            </Link>
          )}
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span>{phone}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {collegeId && (
            <Button 
              variant="secondary" 
              onClick={handleCompare}
              className="flex items-center gap-2"
            >
              <GitCompare className="h-4 w-4" />
              Add to Compare
            </Button>
          )}
          {brochureUrl && (
            <Link href={brochureUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Download Brochure</Button>
            </Link>
          )}
          <ShareButton 
            title={name} 
            text={`Check out ${name} on SeeMyCampus!`}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  )
}

