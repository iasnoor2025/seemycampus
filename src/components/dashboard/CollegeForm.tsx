"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { PlaceIdHelper } from "./PlaceIdHelper"

import { Star, Calendar, Trash2, Plus } from "lucide-react"

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
  ranking?: number | null
  establishedYear?: number | null
  averagePackage?: number | null
  accreditation?: string | null
}

interface FeaturedCollege {
  id: number
  collegeId: number
  category: string
  displayOrder: number
  isActive: boolean
  featuredAt: string
  expiresAt?: string
}

interface CollegeFormProps {
  college: College | null
  onClose: () => void
}

export function CollegeForm({ college, onClose }: CollegeFormProps) {
  const { toast } = useToast()
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
    ranking: null,
    establishedYear: null,
    averagePackage: null,
    accreditation: null,
  })
  const [logoUrl, setLogoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [featuredColleges, setFeaturedColleges] = useState<FeaturedCollege[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const [showAddFeatured, setShowAddFeatured] = useState(false)
  const [newFeatured, setNewFeatured] = useState({
    category: "",
    displayOrder: "0",
    expiresAt: "",
  })
  const [featuredError, setFeaturedError] = useState("")

  useEffect(() => {
    if (college) {
      setFormData({
        name: college.name || "",
        slug: college.slug || "",
        location: college.location || null,
        city: college.city || null,
        state: college.state || null,
        country: college.country || "India",
        description: college.description || null,
        website: college.website || null,
        email: college.email || null,
        phone: college.phone || null,
        isAcademicAlliance: college.isAcademicAlliance || false,
        images: college.images || null,
        googlePlaceId: college.googlePlaceId || null,
        ranking: college.ranking ?? null,
        establishedYear: college.establishedYear ?? null,
        averagePackage: college.averagePackage ?? null,
        accreditation: college.accreditation || null,
      })
      // Set logo URL from images array
      if (college.images && Array.isArray(college.images) && college.images.length > 0) {
        setLogoUrl(college.images[0])
      } else {
        setLogoUrl("")
      }
      // Fetch featured colleges data if editing
      if (college.id) {
        fetchFeaturedColleges(college.id)
      }
    } else {
      setLogoUrl("")
      setFeaturedColleges([])
    }
  }, [college])

  const fetchFeaturedColleges = async (collegeId: number) => {
    try {
      setFeaturedLoading(true)
      const response = await fetch(`/api/colleges/featured?collegeId=${collegeId}&includeInactive=true`)
      if (response.ok) {
        const data = await response.json()
        const collegeFeatured = data.colleges.filter((fc: FeaturedCollege) => fc.collegeId === collegeId)
        setFeaturedColleges(collegeFeatured)
      }
    } catch (error) {
      console.error("Error fetching featured colleges:", error)
    } finally {
      setFeaturedLoading(false)
    }
  }

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

  const handleToggleFeatured = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/colleges/featured/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `College ${isActive ? "enabled" : "disabled"} in featured list`,
        })
        setFeaturedColleges(prev =>
          prev.map(fc => (fc.id === id ? { ...fc, isActive } : fc))
        )
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update featured college",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling featured college:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFeatured = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this college from the featured list?")) {
      return
    }

    try {
      const response = await fetch(`/api/colleges/featured/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "College removed from featured list",
        })
        setFeaturedColleges(prev => prev.filter(fc => fc.id !== id))
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to remove featured college",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting featured college:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddFeatured = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeaturedError("")

    if (!college?.id || !newFeatured.category) {
      setFeaturedError("Please select a category")
      return
    }

    try {
      const response = await fetch("/api/colleges/featured", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collegeId: college.id,
          category: newFeatured.category,
          displayOrder: parseInt(newFeatured.displayOrder),
          expiresAt: newFeatured.expiresAt || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message || "Added to featured list",
        })
        setShowAddFeatured(false)
        setNewFeatured({
          category: "",
          displayOrder: "0",
          expiresAt: "",
        })
        fetchFeaturedColleges(college.id)
      } else {
        const errorData = await response.json()
        setFeaturedError(errorData.error || "Failed to add featured college")
      }
    } catch (error) {
      console.error("Error adding featured college:", error)
      setFeaturedError("An unexpected error occurred")
    }
  }

  const CATEGORIES = [
    { value: "management", label: "Management" },
    { value: "engineering", label: "Engineering" },
    { value: "medical", label: "Medical" },
    { value: "law", label: "Law" },
    { value: "design", label: "Design" },
    { value: "bba", label: "BBA" },
  ]

  return (
    <>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ranking">Ranking</Label>
                  <Input
                    id="ranking"
                    type="number"
                    placeholder="e.g., 55"
                    value={formData.ranking || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ranking: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    College ranking number
                  </p>
                </div>
                <div>
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    placeholder="e.g., 2003"
                    value={formData.establishedYear || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        establishedYear: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Year the college was established
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="averagePackage">Average Package (₹)</Label>
                  <Input
                    id="averagePackage"
                    type="number"
                    placeholder="e.g., 750000"
                    value={formData.averagePackage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        averagePackage: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Average placement package in INR
                  </p>
                </div>
                <div>
                  <Label htmlFor="accreditation">Accreditation</Label>
                  <Input
                    id="accreditation"
                    placeholder="e.g., UGC, AICTE"
                    value={formData.accreditation || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accreditation: e.target.value || null,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Accreditation bodies (comma-separated)
                  </p>
                </div>
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
                        sizes="200px"
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

              {/* Featured Colleges Management */}
              {college?.id && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Top Featured Colleges in India
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage this college's featured status across different categories
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFeaturedError("")
                        setShowAddFeatured(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Category
                    </Button>
                  </div>

                  {featuredLoading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading featured data...
                    </div>
                  ) : featuredColleges.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">Not featured in any category</p>
                      <p className="text-sm text-muted-foreground">
                        Add this college to "Top Featured Colleges in India" to increase visibility
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {featuredColleges.map((featured) => (
                        <div
                          key={featured.id}
                          className={`flex items-center justify-between p-4 border rounded-lg ${!featured.isActive ? "opacity-60 bg-gray-50" : "bg-white"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={featured.isActive ? "default" : "secondary"}>
                                  {featured.category}
                                </Badge>
                                {!featured.isActive && (
                                  <Badge variant="destructive">Disabled</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Order: {featured.displayOrder}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(featured.featuredAt).toLocaleDateString()}
                                </span>
                                {featured.expiresAt && (
                                  <span className="flex items-center gap-1">
                                    Expires: {new Date(featured.expiresAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={featured.isActive}
                              onCheckedChange={(checked) => handleToggleFeatured(featured.id, checked)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFeatured(featured.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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

      {/* Add Featured Modal */}
      {showAddFeatured && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Add to Top Featured Colleges
              </h3>

              {featuredError && (
                <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-md text-sm italic">
                  {featuredError}
                </div>
              )}

              <form onSubmit={handleAddFeatured} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newFeatured.category}
                    onValueChange={(value) => setNewFeatured(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={newFeatured.displayOrder}
                    onChange={(e) => setNewFeatured(prev => ({ ...prev, displayOrder: e.target.value }))}
                    placeholder="0 (highest priority)"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newFeatured.expiresAt}
                    onChange={(e) => setNewFeatured(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Add to Featured
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddFeatured(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

