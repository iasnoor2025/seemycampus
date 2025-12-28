"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Counselor {
  id?: number
  name: string
  email: string
  phone: string | null
  bio: string | null
  specialization: string[]
  experience: number | null
  qualifications: string[]
  imageUrl: string | null
  isActive: boolean
}

interface CounselorFormProps {
  counselor: Counselor | null
  onClose: () => void
}

export function CounselorForm({ counselor, onClose }: CounselorFormProps) {
  const [formData, setFormData] = useState<Partial<Counselor>>({
    name: "",
    email: "",
    phone: null,
    bio: null,
    specialization: [],
    experience: null,
    qualifications: [],
    imageUrl: null,
    isActive: true,
  })
  const [specializationInput, setSpecializationInput] = useState("")
  const [qualificationInput, setQualificationInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (counselor) {
      setFormData(counselor)
    }
  }, [counselor])

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization?.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        specialization: [...(formData.specialization || []), specializationInput.trim()],
      })
      setSpecializationInput("")
    }
  }

  const handleRemoveSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization?.filter((s) => s !== spec) || [],
    })
  }

  const handleAddQualification = () => {
    if (qualificationInput.trim() && !formData.qualifications?.includes(qualificationInput.trim())) {
      setFormData({
        ...formData,
        qualifications: [...(formData.qualifications || []), qualificationInput.trim()],
      })
      setQualificationInput("")
    }
  }

  const handleRemoveQualification = (qual: string) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications?.filter((q) => q !== qual) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.name || !formData.email) {
      setError("Name and email are required")
      setLoading(false)
      return
    }

    try {
      const url = counselor?.id ? `/api/counseling/counselors/${counselor.id}` : "/api/counseling/counselors"
      const method = counselor?.id ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          experience: formData.experience ? parseInt(formData.experience.toString()) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save counselor")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save counselor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{counselor ? "Edit Counselor" : "New Counselor"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
              />
            </div>

            <div>
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || null })}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value || null })}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value || null })}
                placeholder="Counselor biography..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="specialization">Specialization</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="specialization"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSpecialization()
                    }
                  }}
                  placeholder="Add specialization and press Enter"
                />
                <Button type="button" onClick={handleAddSpecialization}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialization?.map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(spec)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="qualifications"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddQualification()
                    }
                  }}
                  placeholder="Add qualification and press Enter"
                />
                <Button type="button" onClick={handleAddQualification}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.qualifications?.map((qual, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
                  >
                    {qual}
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(qual)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
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
              {loading ? "Saving..." : counselor ? "Update Counselor" : "Create Counselor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

