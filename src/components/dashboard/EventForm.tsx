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

interface Event {
  id?: number
  title: string
  slug: string
  description: string | null
  type: string
  startDate: string
  endDate: string | null
  registrationDeadline: string | null
  maxAttendees: number | null
  platform: string | null
  meetingLink: string | null
  location: string | null
  organizer: string | null
  organizerEmail: string | null
  imageUrl: string | null
  tags: string[]
  isActive: boolean
  isPublic: boolean
}

interface EventFormProps {
  event: Event | null
  onClose: () => void
}

export function EventForm({ event, onClose }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    slug: "",
    description: null,
    type: "webinar",
    startDate: "",
    endDate: null,
    registrationDeadline: null,
    maxAttendees: null,
    platform: null,
    meetingLink: null,
    location: null,
    organizer: null,
    organizerEmail: null,
    imageUrl: null,
    tags: [],
    isActive: true,
    isPublic: true,
  })
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : null,
        registrationDeadline: event.registrationDeadline
          ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
          : null,
      })
    }
  }, [event])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.title || !formData.slug || !formData.startDate) {
      setError("Title, slug, and start date are required")
      setLoading(false)
      return
    }

    try {
      const url = event?.id ? `/api/events/${event.slug}` : "/api/events"
      const method = event?.id ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees.toString()) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save event")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{event ? "Edit Event" : "Add Event"}</h2>
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
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
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
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="type">Event Type *</Label>
              <Select
                value={formData.type || "webinar"}
                onValueChange={(value: string | null) => setFormData({ ...formData, type: value || "webinar" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="info_session">Info Session</SelectItem>
                  <SelectItem value="campus_tour">Campus Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
              />
            </div>

            <div>
              <Label htmlFor="registrationDeadline">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, registrationDeadline: e.target.value || null })
                }
              />
            </div>

            <div>
              <Label htmlFor="maxAttendees">Max Attendees</Label>
              <Input
                id="maxAttendees"
                type="number"
                value={formData.maxAttendees || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAttendees: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="platform">Platform (for online events)</Label>
              <Input
                id="platform"
                value={formData.platform || ""}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value || null })}
                placeholder="Zoom, Google Meet, etc."
              />
            </div>

            <div>
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                value={formData.meetingLink || ""}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value || null })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="location">Location (for in-person events)</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
                placeholder="Physical address"
              />
            </div>

            <div>
              <Label htmlFor="organizer">Organizer Name</Label>
              <Input
                id="organizer"
                value={formData.organizer || ""}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value || null })}
              />
            </div>

            <div>
              <Label htmlFor="organizerEmail">Organizer Email</Label>
              <Input
                id="organizerEmail"
                type="email"
                value={formData.organizerEmail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, organizerEmail: e.target.value || null })
                }
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
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked as boolean })
                }
              />
              <Label htmlFor="isPublic">Public</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

