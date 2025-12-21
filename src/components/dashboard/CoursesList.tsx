"use client"

import { useState, useEffect } from "react"
import { BookOpen, Edit, Trash2, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CourseForm } from "./CourseForm"
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

interface Course {
  id: number
  name: string
  slug: string
  collegeId: number
  description: string | null
  duration: string | null
  fees: number | null
  feesCurrency: string | null
  studyMode: string | null
  level: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface College {
  id: number
  name: string
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollege, setSelectedCollege] = useState<string>("")
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const url = selectedCollege
        ? `/api/dashboard/courses?limit=1000&collegeId=${selectedCollege}`
        : "/api/dashboard/courses?limit=1000"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/dashboard/colleges?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
      }
    } catch (error) {
      console.error("Error fetching colleges:", error)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchColleges()
  }, [selectedCollege])

  const handleDelete = async () => {
    if (!deleteCourseId) return

    try {
      const response = await fetch(`/api/dashboard/courses/${deleteCourseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCourses()
        setShowDeleteDialog(false)
        setDeleteCourseId(null)
      } else {
        alert("Failed to delete course")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Failed to delete course")
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingCourse(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCourse(null)
    fetchCourses()
  }

  const getCollegeName = (collegeId: number) => {
    const college = colleges.find((c) => c.id === collegeId)
    return college?.name || "Unknown"
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Colleges</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
          <Button className="flex items-center gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        {/* Table */}
        {filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-md">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No courses found</p>
            <p className="text-sm mt-2">
              {searchTerm || selectedCollege
                ? "Try a different search term or filter"
                : 'Click "Add Course" to get started'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Study Mode</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{getCollegeName(course.collegeId)}</TableCell>
                    <TableCell>{course.duration || "-"}</TableCell>
                    <TableCell>{course.level || "-"}</TableCell>
                    <TableCell>{course.studyMode || "-"}</TableCell>
                    <TableCell>
                      {course.fees
                        ? `${course.feesCurrency || "INR"} ${course.fees.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/courses/${course.slug}`, "_blank")
                          }
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(course)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <CourseForm
          course={editingCourse}
          colleges={colleges}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Course Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

