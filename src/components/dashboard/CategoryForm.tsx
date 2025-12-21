"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface Category {
  id?: number
  name: string
  slug: string
  displayOrder: number
  isActive: boolean
}

interface CategoryFormProps {
  category: Category | null
  onClose: () => void
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    name: "",
    slug: "",
    displayOrder: 0,
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (category) {
      setFormData(category)
    }
  }, [category])

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
      const url = category?.id
        ? `/api/dashboard/menu/categories/${category.id}`
        : "/api/dashboard/menu/categories"
      const method = category?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMessage = data.error || `Failed to save category (Status: ${response.status})`
        throw new Error(errorMessage)
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save category")
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
              {category ? "Edit Category" : "Add New Category"}
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
              <Label htmlFor="name">Category Name *</Label>
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
                {loading ? "Saving..." : category ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

