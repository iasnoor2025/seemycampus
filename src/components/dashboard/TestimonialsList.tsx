"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Testimonial {
  id: number
  name: string
  testimonial: string
  photoUrl: string | null
  avatarColor: string
  date: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function TestimonialsList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [deleteTestimonialId, setDeleteTestimonialId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    testimonial: "",
    photoUrl: "",
    avatarColor: "blue",
    date: new Date().toISOString().split("T")[0],
    displayOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTestimonialId) return

    try {
      const response = await fetch(`/api/dashboard/testimonials/${deleteTestimonialId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTestimonials()
        setShowDeleteDialog(false)
        setDeleteTestimonialId(null)
      } else {
        alert("Failed to delete testimonial")
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      alert("Failed to delete testimonial")
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      testimonial: testimonial.testimonial,
      photoUrl: testimonial.photoUrl || "",
      avatarColor: testimonial.avatarColor,
      date: new Date(testimonial.date).toISOString().split("T")[0],
      displayOrder: testimonial.displayOrder,
      isActive: testimonial.isActive,
    })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingTestimonial(null)
    setFormData({
      name: "",
      testimonial: "",
      photoUrl: "",
      avatarColor: "blue",
      date: new Date().toISOString().split("T")[0],
      displayOrder: 0,
      isActive: true,
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTestimonial
        ? `/api/dashboard/testimonials/${editingTestimonial.id}`
        : "/api/dashboard/testimonials"
      const method = editingTestimonial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchTestimonials()
        setIsFormOpen(false)
        setEditingTestimonial(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save testimonial")
      }
    } catch (error) {
      console.error("Error saving testimonial:", error)
      alert("Failed to save testimonial")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading testimonials...</div>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage testimonials displayed on the homepage
          </p>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No testimonials yet. Add your first testimonial!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteTestimonialId(testimonial.id)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                    <span className="ml-auto">
                      {testimonial.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {testimonial.testimonial}
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Order: {testimonial.displayOrder} • Color: {testimonial.avatarColor}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="testimonial">Testimonial *</Label>
                  <Textarea
                    id="testimonial"
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                  {formData.photoUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.photoUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="avatarColor">Avatar Color</Label>
                    <Select
                      value={formData.avatarColor}
                      onValueChange={(value) => setFormData({ ...formData, avatarColor: value || "blue" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="indigo">Indigo</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="isActive">Status</Label>
                    <Select
                      value={formData.isActive ? "true" : "false"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, isActive: value === "true" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingTestimonial(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTestimonial ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the testimonial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

