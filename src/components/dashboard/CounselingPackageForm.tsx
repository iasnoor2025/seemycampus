"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface CounselingPackage {
  id?: number
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  duration: number
  sessions: number
  features: string[]
  isActive: boolean
  displayOrder: number
}

interface CounselingPackageFormProps {
  packageData: CounselingPackage | null
  onClose: () => void
}

export function CounselingPackageForm({ packageData, onClose }: CounselingPackageFormProps) {
  const [formData, setFormData] = useState<Partial<CounselingPackage>>({
    name: "",
    slug: "",
    description: null,
    price: 0,
    currency: "INR",
    duration: 60,
    sessions: 1,
    features: [],
    isActive: true,
    displayOrder: 0,
  })
  const [featureInput, setFeatureInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (packageData) {
      setFormData(packageData)
    }
  }, [packageData])

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

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features?.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), featureInput.trim()],
      })
      setFeatureInput("")
    }
  }

  const handleRemoveFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((f) => f !== feature) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.name || !formData.slug || !formData.price || !formData.duration || !formData.sessions) {
      setError("Name, slug, price, duration, and sessions are required")
      setLoading(false)
      return
    }

    try {
      const url = packageData?.slug ? `/api/counseling/packages/${packageData.slug}` : "/api/counseling/packages"
      const method = packageData?.slug ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price.toString()),
          duration: parseInt(formData.duration.toString()),
          sessions: parseInt(formData.sessions.toString()),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save package")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save package")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {packageData ? "Edit Package" : "New Package"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency || "INR"}
                  onValueChange={(value: string | null) => setFormData({ ...formData, currency: value || "INR" })}
                >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || 60}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="sessions">Number of Sessions *</Label>
              <Input
                id="sessions"
                type="number"
                value={formData.sessions || 1}
                onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="features">Features</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="features"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddFeature()
                    }
                  }}
                  placeholder="Add a feature and press Enter"
                />
                <Button type="button" onClick={handleAddFeature}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features?.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : packageData ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

