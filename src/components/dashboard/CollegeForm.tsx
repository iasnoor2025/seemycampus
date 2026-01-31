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

import { Star, Calendar, Trash2, Plus, Building2, Loader2 } from "lucide-react"

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
  entranceExams?: string[] | null
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
    entranceExams: null,
  })
  const [logoUrl, setLogoUrl] = useState("")
  const [entranceExamsInput, setEntranceExamsInput] = useState("")
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
        entranceExams: college.entranceExams || null,
      })
      // Set logo URL from images array
      if (college.images && Array.isArray(college.images) && college.images.length > 0) {
        setLogoUrl(college.images[0])
      } else {
        setLogoUrl("")
      }

      // Set entrance exams input
      if (college.entranceExams && Array.isArray(college.entranceExams)) {
        setEntranceExamsInput(college.entranceExams.join(", "))
      } else {
        setEntranceExamsInput("")
      }

      // Fetch featured colleges data if editing
      if (college.id) {
        fetchFeaturedColleges(college.id)
      }
    } else {
      setLogoUrl("")
      setEntranceExamsInput("")
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
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
          {/* Header */}
          <div className="px-10 py-8 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {college ? "Modify Institution" : "Enroll Institution"}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Metadata Orchestration & Identity Profile
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-400">
              <Plus className="h-6 w-6 rotate-45" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Core Identity */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">Core Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institutional Profile</Label>
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
                    className="bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 resize-none"
                  />
                </div>
              </section>

              {/* Geographical Mapping */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">Geographical Mapping</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Metro/City</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value || null })
                      }
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">District/State</Label>
                    <Input
                      id="state"
                      value={formData.state || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value || null })
                      }
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Address</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value || null })
                      }
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sovereign State</Label>
                    <Input
                      id="country"
                      value={formData.country || "India"}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value || null })
                      }
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </section>

              {/* Digital Presence */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">Digital Presence</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value || null })
                      }
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value || null })
                      }
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </section>

              {/* Performance & Status */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">Performance & Status</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="ranking" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Global Ranking</Label>
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
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foundation Year</Label>
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
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="averagePackage" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Average Package (₹)</Label>
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
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="accreditation" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Accreditation Corps</Label>
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
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brand Identity (Logo URL)</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <Checkbox
                    id="isAcademicAlliance"
                    checked={formData.isAcademicAlliance}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isAcademicAlliance: checked as boolean,
                      })
                    }
                    className="scale-125 data-[state=checked]:bg-blue-600"
                  />
                  <div>
                    <Label htmlFor="isAcademicAlliance" className="text-[10px] font-black uppercase tracking-widest text-slate-800 cursor-pointer">
                      Academic Alliance Partner
                    </Label>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment as a verified strategic partner institution</p>
                  </div>
                </div>
              </section>

              {/* Admission & Exams */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 w-8 bg-blue-600 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-800">Admission & Exams</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entranceExams" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Accepted Entrance Exams (Comma Separated)</Label>
                  <Input
                    id="entranceExams"
                    placeholder="e.g., JEE Main, NEET, GATE, CAT"
                    value={entranceExamsInput}
                    onChange={(e) => {
                      const value = e.target.value
                      setEntranceExamsInput(value)

                      // Update form data immediately
                      const exams = value
                        ? value.split(",").map(item => item.trim()).filter(item => item.length > 0)
                        : []

                      setFormData(prev => ({
                        ...prev,
                        entranceExams: exams
                      }))
                    }}
                    className="h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10"
                  />
                  <p className="text-[10px] text-slate-400 pl-2">Enter exams separated by commas. These will be displayed as tags on the college page.</p>
                </div>
              </section>

              {/* High-Fidelity Promotion Management */}
              {college?.id && (
                <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative group/featured">
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover/featured:scale-125 transition-transform duration-1000">
                    <Star className="h-32 w-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-1 w-8 bg-blue-500 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Promotion Engine</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Top Featured Placement</h3>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setFeaturedError("")
                          setShowAddFeatured(true)
                        }}
                        className="h-10 px-6 bg-white text-slate-900 hover:bg-blue-500 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                      >
                        New Campaign
                      </Button>
                    </div>

                    {featuredLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Hydrating Campaign Data...</span>
                      </div>
                    ) : featuredColleges.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-white/5 rounded-[2rem]">
                        <Star className="h-12 w-12 text-blue-500 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active promotions</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 relative z-10">
                        {featuredColleges.map((featured) => (
                          <div
                            key={featured.id}
                            className={`flex items-center justify-between p-6 rounded-3xl transition-all border ${!featured.isActive
                              ? "bg-white/5 border-white/5 opacity-50"
                              : "bg-white/10 border-white/10 shadow-xl"
                              }`}
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5">
                                  {featured.category}
                                </Badge>
                                {!featured.isActive && (
                                  <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Offline</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Priority</span>
                                  <span className="text-xs font-black">{featured.displayOrder}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Launched</span>
                                  <span className="text-xs font-black">{new Date(featured.featuredAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Switch
                                checked={featured.isActive}
                                onCheckedChange={(checked) => handleToggleFeatured(featured.id, checked)}
                                className="data-[state=checked]:bg-blue-500"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFeatured(featured.id)}
                                className="h-10 w-10 rounded-xl hover:bg-red-500 hover:text-white transition-all text-slate-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              <div className="flex items-center justify-end gap-4 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="px-8 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-900 transition-all"
                >
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-10 h-12 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-xl hover:shadow-blue-500/20 text-[10px] font-black uppercase tracking-widest"
                >
                  {loading ? "Synchronizing..." : college ? "Commit Changes" : "Confirm Enrollment"}
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

