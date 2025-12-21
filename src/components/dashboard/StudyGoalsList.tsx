"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, GraduationCap, Briefcase, ShoppingCart, Palette, Stethoscope, Scale, BookOpen } from "lucide-react"
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

interface StudyGoal {
  id: number
  name: string
  slug: string
  icon: string
  collegeCount: string | null
  courses: string[]
  link: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const iconOptions = [
  { value: "GraduationCap", label: "Graduation Cap" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "ShoppingCart", label: "Shopping Cart" },
  { value: "Palette", label: "Palette" },
  { value: "Stethoscope", label: "Stethoscope" },
  { value: "Scale", label: "Scale" },
  { value: "BookOpen", label: "Book Open" },
]

export function StudyGoalsList() {
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null)
  const [deleteGoalId, setDeleteGoalId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "GraduationCap",
    collegeCount: "",
    courses: [] as string[],
    link: "",
    displayOrder: 0,
    isActive: true,
  })
  const [courseInput, setCourseInput] = useState("")

  useEffect(() => {
    fetchStudyGoals()
  }, [])

  const fetchStudyGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/study-goals")
      if (response.ok) {
        const data = await response.json()
        setStudyGoals(data.studyGoals || [])
      }
    } catch (error) {
      console.error("Error fetching study goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteGoalId) return

    try {
      const response = await fetch(`/api/dashboard/study-goals/${deleteGoalId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchStudyGoals()
        setShowDeleteDialog(false)
        setDeleteGoalId(null)
      } else {
        alert("Failed to delete study goal")
      }
    } catch (error) {
      console.error("Error deleting study goal:", error)
      alert("Failed to delete study goal")
    }
  }

  const handleEdit = (goal: StudyGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      slug: goal.slug,
      icon: goal.icon,
      collegeCount: goal.collegeCount || "",
      courses: goal.courses || [],
      link: goal.link,
      displayOrder: goal.displayOrder,
      isActive: goal.isActive,
    })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingGoal(null)
    setFormData({
      name: "",
      slug: "",
      icon: "GraduationCap",
      collegeCount: "",
      courses: [],
      link: "",
      displayOrder: 0,
      isActive: true,
    })
    setCourseInput("")
    setIsFormOpen(true)
  }

  const handleAddCourse = () => {
    if (courseInput.trim()) {
      setFormData({
        ...formData,
        courses: [...formData.courses, courseInput.trim()],
      })
      setCourseInput("")
    }
  }

  const handleRemoveCourse = (index: number) => {
    setFormData({
      ...formData,
      courses: formData.courses.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingGoal
        ? `/api/dashboard/study-goals/${editingGoal.id}`
        : "/api/dashboard/study-goals"
      const method = editingGoal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          collegeCount: formData.collegeCount || null,
          link: formData.link || `/colleges/${formData.slug}`,
        }),
      })

      if (response.ok) {
        fetchStudyGoals()
        setIsFormOpen(false)
        setEditingGoal(null)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save study goal")
      }
    } catch (error) {
      console.error("Error saving study goal:", error)
      alert("Failed to save study goal")
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      GraduationCap: <GraduationCap className="h-5 w-5" />,
      Briefcase: <Briefcase className="h-5 w-5" />,
      ShoppingCart: <ShoppingCart className="h-5 w-5" />,
      Palette: <Palette className="h-5 w-5" />,
      Stethoscope: <Stethoscope className="h-5 w-5" />,
      Scale: <Scale className="h-5 w-5" />,
      BookOpen: <BookOpen className="h-5 w-5" />,
    }
    return iconMap[iconName] || <GraduationCap className="h-5 w-5" />
  }

  if (loading) {
    return <div className="text-center py-8">Loading study goals...</div>
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage study goals displayed in the "Select Your Study Goal" section
          </p>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Study Goal
          </Button>
        </div>

        {studyGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No study goals yet. Add your first study goal!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        {getIconComponent(goal.icon)}
                      </div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteGoalId(goal.id)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Colleges: </span>
                      <span>{goal.collegeCount || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Courses: </span>
                      <span>{goal.courses.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Link: </span>
                      <span className="text-xs">{goal.link}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={goal.isActive ? "text-green-600" : "text-gray-400"}>
                        {goal.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Order: {goal.displayOrder}
                      </span>
                    </div>
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
                {editingGoal ? "Edit Study Goal" : "Add New Study Goal"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (!editingGoal) {
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          }))
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon *</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) => setFormData({ ...formData, icon: value || "GraduationCap" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="collegeCount">College Count</Label>
                    <Input
                      id="collegeCount"
                      value={formData.collegeCount}
                      onChange={(e) => setFormData({ ...formData, collegeCount: e.target.value })}
                      placeholder="e.g., 6348 Colleges"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder={`/colleges/${formData.slug}`}
                  />
                </div>

                <div>
                  <Label>Courses *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={courseInput}
                      onChange={(e) => setCourseInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddCourse()
                        }
                      }}
                      placeholder="Add a course (e.g., BE/B.Tech)"
                    />
                    <Button type="button" onClick={handleAddCourse}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.courses.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{course}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
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
                      setEditingGoal(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formData.courses.length === 0}>
                    {editingGoal ? "Update" : "Create"}
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
              This action cannot be undone. This will permanently delete the study goal.
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

