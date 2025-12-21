"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface MenuCourse {
  id?: number
  name: string
  slug: string
  categoryId: number
  href: string | null
  displayOrder: number
  isActive: boolean
}

interface Category {
  id: number
  name: string
}

interface MenuCourseFormProps {
  course: MenuCourse | null
  categoryId: number | null
  categories: Category[]
  onClose: () => void
}

export function MenuCourseForm({
  course,
  categoryId,
  categories,
  onClose,
}: MenuCourseFormProps) {
  const [formData, setFormData] = useState<MenuCourse>({
    name: "",
    slug: "",
    categoryId: categoryId || 0,
    href: null,
    displayOrder: 0,
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (course) {
      setFormData(course)
    } else if (categoryId) {
      setFormData({ ...formData, categoryId })
    }
  }, [course, categoryId])

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

    if (!formData.categoryId) {
      setError("Please select a category")
      setLoading(false)
      return
    }

    try {
      const url = course?.id
        ? `/api/dashboard/menu/menu-courses/${course.id}`
        : "/api/dashboard/menu/menu-courses"
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
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
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
            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value={0}>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <Label htmlFor="href">Link (href)</Label>
              <Input
                id="href"
                value={formData.href || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    href: e.target.value || null,
                  })
                }
                placeholder="/courses/mba"
              />
            </div>

            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isActive: checked as boolean,
                  })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
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
