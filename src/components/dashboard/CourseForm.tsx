"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Course {
  id?: number
  name: string
  slug: string
  collegeId: number
  description: string | null
  duration: string | null
  fees: number | null
  feesCurrency: string | null
  studyMode: string | null
  level: string | null
}

interface College {
  id: number
  name: string
}

interface CourseFormProps {
  course: Course | null
  colleges: College[]
  onClose: () => void
}

export function CourseForm({ course, colleges, onClose }: CourseFormProps) {
  const [formData, setFormData] = useState<Course>({
    name: "",
    slug: "",
    collegeId: 0,
    description: null,
    duration: null,
    fees: null,
    feesCurrency: "INR",
    studyMode: null,
    level: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (course) {
      setFormData(course)
    }
  }, [course])

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

    if (!formData.collegeId) {
      setError("Please select a college")
      setLoading(false)
      return
    }

    try {
      const url = course?.id
        ? `/api/dashboard/courses/${course.id}`
        : "/api/dashboard/courses"
      const method = course?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save course")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save course")
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
              {course ? "Edit Course" : "Add New Course"}
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
                <Label htmlFor="name">Course Name *</Label>
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

            <div>
              <Label htmlFor="collegeId">College *</Label>
              <select
                id="collegeId"
                value={formData.collegeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    collegeId: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value={0}>Select a college</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: e.target.value || null,
                    })
                  }
                  placeholder="e.g., 4 years, 2 years"
                />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={formData.level || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select level</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studyMode">Study Mode</Label>
                <select
                  id="studyMode"
                  value={formData.studyMode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studyMode: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <Label htmlFor="feesCurrency">Currency</Label>
                <select
                  id="feesCurrency"
                  value={formData.feesCurrency || "INR"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      feesCurrency: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="fees">Fees</Label>
              <Input
                id="fees"
                type="number"
                value={formData.fees || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fees: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Enter fees amount"
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

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : course ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

