import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Mail, Phone } from "lucide-react"
import Link from "next/link"

interface CollegeHeroProps {
  name: string
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
  location,
  city,
  website,
  email,
  phone,
  images,
  brochureUrl,
}: CollegeHeroProps) {
  const imageUrl = images && images.length > 0 ? images[0] : "/placeholder-college.jpg"
  const displayLocation = city || location || "Location not specified"

  return (
    <div className="relative w-full h-[400px] mb-8">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        priority
        sizes="100vw"
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
        {brochureUrl && (
          <Link href={brochureUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Download Brochure</Button>
          </Link>
        )}
      </div>
    </div>
  )
}

