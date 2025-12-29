"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { PlaceIdHelper } from "./PlaceIdHelper"

interface College {
  id?: number
  name: string
  slug: string
  location: string | null
  city: string | null
  state: string | null
  country: string | null
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  isAcademicAlliance: boolean
  images?: string[] | null
  googlePlaceId?: string | null
}

interface CollegeFormProps {
  college: College | null
  onClose: () => void
}

export function CollegeForm({ college, onClose }: CollegeFormProps) {
  const [formData, setFormData] = useState<College>({
    name: "",
    slug: "",
    location: null,
    city: null,
    state: null,
    country: "India",
    description: null,
    website: null,
    email: null,
    phone: null,
    isAcademicAlliance: false,
    images: null,
    googlePlaceId: null,
  })
  const [logoUrl, setLogoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (college) {
      setFormData(college)
      // Set logo URL from images array
      if (college.images && Array.isArray(college.images) && college.images.length > 0) {
        setLogoUrl(college.images[0])
      } else {
        setLogoUrl("")
      }
    } else {
      setLogoUrl("")
    }
  }, [college])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = college?.id
        ? `/api/dashboard/colleges/${college.id}`
        : "/api/dashboard/colleges"
      const method = college?.id ? "PUT" : "POST"

      // Prepare data with images array from logoUrl
      const submitData = {
        ...formData,
        images: logoUrl.trim() ? [logoUrl.trim()] : [],
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save college")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save college")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {college ? "Edit College" : "Add New College"}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">College Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value || null })
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value || null })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value || null })
                }
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || "India"}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value || null })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value || null,
                  })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value || null })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value || null })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value || null })
                }
              />
            </div>

            <div>
              <PlaceIdHelper
                value={formData.googlePlaceId || ""}
                onChange={(value) =>
                  setFormData({ ...formData, googlePlaceId: value || null })
                }
              />
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full URL of the college logo image
              </p>
              {logoUrl && (
                <div className="mt-3 p-3 border rounded-md bg-gray-50">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="relative w-24 h-24 rounded overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt="Logo preview"
                      fill
                      className="object-contain p-1 bg-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent) {
                          const fallback = parent.querySelector(".logo-preview-fallback") as HTMLElement
                          if (fallback) fallback.style.display = "flex"
                        }
                      }}
                    />
                    <div 
                      className="logo-preview-fallback absolute inset-0 flex items-center justify-center text-white font-bold text-xs"
                      style={{ display: "none" }}
                    >
                      Invalid
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAcademicAlliance"
                checked={formData.isAcademicAlliance}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isAcademicAlliance: checked as boolean,
                  })
                }
              />
              <Label htmlFor="isAcademicAlliance" className="cursor-pointer">
                Academic Alliance Partner
              </Label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : college ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

