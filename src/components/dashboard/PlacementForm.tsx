"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface Placement {
  id?: number
  collegeId: number
  year: number
  totalStudents?: number | null
  placedStudents?: number | null
  placementPercentage?: number | null
  averagePackage?: number | null
  medianPackage?: number | null
  highestPackage?: number | null
  lowestPackage?: number | null
  topRecruiters?: string[]
  departmentWiseData?: Record<string, any>
}

interface PlacementFormProps {
  placement: Placement | null
  collegeId?: number
  onClose: () => void
  onSuccess: () => void
}

export function PlacementForm({ placement, collegeId, onClose, onSuccess }: PlacementFormProps) {
  const [formData, setFormData] = useState<Placement>({
    collegeId: collegeId || 0,
    year: new Date().getFullYear(),
    totalStudents: null,
    placedStudents: null,
    placementPercentage: null,
    averagePackage: null,
    medianPackage: null,
    highestPackage: null,
    lowestPackage: null,
    topRecruiters: [],
    departmentWiseData: {},
  })
  const [topRecruitersText, setTopRecruitersText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (placement) {
      setFormData(placement)
      setTopRecruitersText((placement.topRecruiters || []).join(", "))
    } else if (collegeId) {
      setFormData((prev) => ({ ...prev, collegeId }))
    }
  }, [placement, collegeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Parse top recruiters from comma-separated text
      const topRecruiters = topRecruitersText
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)

      const submitData = {
        ...formData,
        topRecruiters,
      }

      const url = placement?.id
        ? `/api/placements/${placement.id}`
        : "/api/placements"
      const method = placement?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save placement")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save placement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {placement ? "Edit Placement Statistics" : "Add New Placement Statistics"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!collegeId && (
            <div>
              <Label htmlFor="collegeId">College ID *</Label>
              <Input
                id="collegeId"
                type="number"
                required
                value={formData.collegeId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, collegeId: parseInt(e.target.value) })
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                required
                value={formData.year || ""}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="totalStudents">Total Students</Label>
              <Input
                id="totalStudents"
                type="number"
                value={formData.totalStudents || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalStudents: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placedStudents">Placed Students</Label>
              <Input
                id="placedStudents"
                type="number"
                value={formData.placedStudents || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placedStudents: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="placementPercentage">Placement Percentage (%)</Label>
              <Input
                id="placementPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.placementPercentage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placementPercentage: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="averagePackage">Average Package (₹)</Label>
              <Input
                id="averagePackage"
                type="number"
                value={formData.averagePackage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    averagePackage: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="medianPackage">Median Package (₹)</Label>
              <Input
                id="medianPackage"
                type="number"
                value={formData.medianPackage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medianPackage: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="highestPackage">Highest Package (₹)</Label>
              <Input
                id="highestPackage"
                type="number"
                value={formData.highestPackage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    highestPackage: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="lowestPackage">Lowest Package (₹)</Label>
              <Input
                id="lowestPackage"
                type="number"
                value={formData.lowestPackage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowestPackage: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="topRecruiters">Top Recruiters (comma-separated)</Label>
            <Input
              id="topRecruiters"
              value={topRecruitersText}
              onChange={(e) => setTopRecruitersText(e.target.value)}
              placeholder="e.g., Google, Microsoft, Amazon"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : placement ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

