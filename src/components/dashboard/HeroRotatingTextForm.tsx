"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface HeroRotatingText {
  id: number
  text: string
  displayOrder: number
  isActive: boolean
}

interface HeroRotatingTextFormProps {
  text: HeroRotatingText | null
  onClose: () => void
  onSuccess: () => void
}

export function HeroRotatingTextForm({ text, onClose, onSuccess }: HeroRotatingTextFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    text: "",
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    if (text) {
      setFormData({
        text: text.text || "",
        displayOrder: text.displayOrder || 0,
        isActive: text.isActive !== undefined ? text.isActive : true,
      })
    }
  }, [text])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = text
        ? `/api/dashboard/hero-rotating-texts/${text.id}`
        : "/api/dashboard/hero-rotating-texts"
      const method = text ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save text")
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save text")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {text ? "Edit Rotating Text" : "Add Rotating Text"}
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

          <div className="space-y-2">
            <Label htmlFor="text">Text *</Label>
            <Input
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="e.g., Find Over 25000+ Colleges in India"
              required
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground">
              {formData.text.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
              }
              min="0"
            />
            <p className="text-sm text-muted-foreground">
              Lower numbers appear first. Texts are sorted by order, then by creation date.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked === true })
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible on website)
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : text ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

