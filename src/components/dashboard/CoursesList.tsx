"use client"

import { useState, useEffect, useMemo } from "react"
import { BookOpen, Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react"
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

const ITEMS_PER_PAGE = 20

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
  const [currentPage, setCurrentPage] = useState(1)

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

  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    }).sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
  }, [courses, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredCourses, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCollege])

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push("...")
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) {
        pages.push("...")
      }
      pages.push(totalPages)
    }
    return pages
  }

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

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {paginatedCourses.length} of {filteredCourses.length} courses
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
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
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
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
                  {paginatedCourses.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell className="text-muted-foreground">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate" title={course.name}>
                        {course.name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={getCollegeName(course.collegeId)}>
                        {getCollegeName(course.collegeId)}
                      </TableCell>
                      <TableCell>{course.duration || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          course.level === "undergraduate" 
                            ? "bg-green-100 text-green-700" 
                            : course.level === "graduate" 
                            ? "bg-blue-100 text-blue-700"
                            : course.level === "diploma"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {course.level || "-"}
                        </span>
                      </TableCell>
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
                            onClick={() => {
                              setDeleteCourseId(course.id)
                              setShowDeleteDialog(true)
                            }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                          ...
                        </span>
                      )
                    }
                    const pageNum = page as number
                    const isActive = pageNum === currentPage
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className={isActive ? "bg-primary" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
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

