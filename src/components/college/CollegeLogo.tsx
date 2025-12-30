"use client"

import { useState } from "react"
import Image from "next/image"

interface CollegeLogoProps {
  collegeId: number
  collegeName: string
  imageUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "rounded" | "square" | "circle"
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
}

const sizeMap = {
  sm: { container: "w-12 h-12", text: "text-xs" },
  md: { container: "w-16 h-16", text: "text-sm" },
  lg: { container: "w-20 h-20", text: "text-base" },
}

const variantMap = {
  rounded: "rounded-lg",
  square: "rounded-none",
  circle: "rounded-full",
}

export function CollegeLogo({
  collegeId,
  collegeName,
  imageUrl,
  size = "md",
  className = "",
  variant = "rounded",
}: CollegeLogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = sizeMap[size]
  const variantClass = variantMap[variant]

  // Show fallback if no image URL or image failed to load
  if (!imageUrl || imageError) {
    return (
      <div
        className={`${sizeClasses.container} ${variantClass} bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold ${sizeClasses.text} border-2 border-gray-200 shadow-sm ${className}`}
      >
        {getInitials(collegeName)}
      </div>
    )
  }

  // Check if it's a local path that might not exist
  const isLocalPath = imageUrl.startsWith("/")
  
  // For local paths that might not exist, use unoptimized to avoid 400 errors from Next.js Image optimizer
  // For external URLs, Next.js will handle optimization but we'll catch 404s
  const useUnoptimized = isLocalPath
  const imageSize = size === "sm" ? 48 : size === "md" ? 64 : 80

  return (
    <div
      className={`${sizeClasses.container} ${variantClass} bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm ${className}`}
    >
      <Image
        src={imageUrl}
        alt={`${collegeName} logo`}
        width={imageSize}
        height={imageSize}
        className="object-contain p-1"
        style={{ 
          width: 'auto', 
          height: 'auto', 
          maxWidth: '100%', 
          maxHeight: '100%',
          objectFit: 'contain'
        }}
        unoptimized={useUnoptimized}
        onError={(e) => {
          // Silently handle image errors
          setImageError(true)
        }}
      />
    </div>
  )
}

