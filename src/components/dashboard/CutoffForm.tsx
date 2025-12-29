"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface Cutoff {
  id?: number
  collegeId: number
  examName: string
  courseName?: string | null
  year: number
  category?: string | null
  openingRank?: number | null
  closingRank?: number | null
  openingScore?: number | null
  closingScore?: number | null
  round?: number
  quota?: string | null
}

interface CutoffFormProps {
  cutoff: Cutoff | null
  collegeId?: number
  onClose: () => void
  onSuccess: () => void
}

const ENTRANCE_EXAMS = [
  "CAT", "GMAT", "GRE", "XAT", "MAT", "CMAT", "SNAP", "NMAT", "IIFT",
  "JEE Main", "JEE Advanced", "GATE", "NEET", "CLAT", "AILET", "LSAT"
]

const CUTOFF_CATEGORIES = [
  "General", "OBC", "SC", "ST", "EWS", "PWD"
]

export function CutoffForm({ cutoff, collegeId, onClose, onSuccess }: CutoffFormProps) {
  const [formData, setFormData] = useState<Cutoff>({
    collegeId: collegeId || 0,
    examName: "",
    courseName: null,
    year: new Date().getFullYear(),
    category: null,
    openingRank: null,
    closingRank: null,
    openingScore: null,
    closingScore: null,
    round: 1,
    quota: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (cutoff) {
      setFormData(cutoff)
    } else if (collegeId) {
      setFormData((prev) => ({ ...prev, collegeId }))
    }
  }, [cutoff, collegeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = cutoff?.id
        ? `/api/cutoffs/${cutoff.id}`
        : "/api/cutoffs"
      const method = cutoff?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save cutoff")
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save cutoff")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {cutoff ? "Edit Cutoff" : "Add New Cutoff"}
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
              <Label htmlFor="examName">Exam Name *</Label>
              <Select
                value={formData.examName}
                onValueChange={(value) => setFormData({ ...formData, examName: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {ENTRANCE_EXAMS.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={formData.courseName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value || null })
                }
                placeholder="e.g., MBA, B.Tech"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {CUTOFF_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingRank">Opening Rank</Label>
              <Input
                id="openingRank"
                type="number"
                value={formData.openingRank || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingRank: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="closingRank">Closing Rank</Label>
              <Input
                id="closingRank"
                type="number"
                value={formData.closingRank || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    closingRank: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingScore">Opening Score/Percentile</Label>
              <Input
                id="openingScore"
                type="number"
                value={formData.openingScore || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingScore: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="closingScore">Closing Score/Percentile</Label>
              <Input
                id="closingScore"
                type="number"
                value={formData.closingScore || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    closingScore: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="round">Round</Label>
              <Input
                id="round"
                type="number"
                min="1"
                value={formData.round || 1}
                onChange={(e) =>
                  setFormData({ ...formData, round: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div>
              <Label htmlFor="quota">Quota</Label>
              <Input
                id="quota"
                value={formData.quota || ""}
                onChange={(e) =>
                  setFormData({ ...formData, quota: e.target.value || null })
                }
                placeholder="e.g., All India, State"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : cutoff ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

