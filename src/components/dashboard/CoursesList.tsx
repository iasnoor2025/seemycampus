"use client"

import { useState, useEffect, useMemo } from "react"
import { BookOpen, Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
      const response = await fetch("/api/dashboard/colleges?all=true")
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

  // Filter courses based on search term (by college name)
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!searchTerm) return true
      const collegeName = getCollegeName(course.collegeId).toLowerCase()
      return collegeName.includes(searchTerm.toLowerCase())
    }).sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
  }, [courses, searchTerm, colleges])

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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* Search Field */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by college name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          {/* Filter and Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <Select
              value={selectedCollege}
              onValueChange={(value) => setSelectedCollege(value || "")}
            >
              <SelectTrigger className="w-[220px] sm:w-[280px] lg:w-[320px] h-10 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:pr-6 [&_[data-slot=select-value]]:max-w-full">
                <SelectValue placeholder="All Colleges">
                  {(value: string | null) => {
                    if (!value || value === "") return "All Colleges"
                    const college = colleges.find((c) => c.id.toString() === value)
                    return college?.name || "All Colleges"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-[400px]">
                <SelectItem value="">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id.toString()}>
                    {college.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAdd}
              className="h-10 px-4 sm:px-6 whitespace-nowrap shadow-sm flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Course</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">Showing </span>
          <span>{paginatedCourses.length} of {filteredCourses.length} courses</span>
          {totalPages > 1 && <span className="hidden sm:inline"> (Page {currentPage} of {totalPages})</span>}
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
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {paginatedCourses.map((course, index) => (
                <div key={course.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
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
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2" title={course.name}>
                        {course.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title={getCollegeName(course.collegeId)}>
                        {getCollegeName(course.collegeId)}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {course.duration && <span>📅 {course.duration}</span>}
                        {course.studyMode && <span>📚 {course.studyMode}</span>}
                        {course.fees && (
                          <span>💰 {course.feesCurrency || "INR"} {course.fees.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(`/courses/${course.slug}`, "_blank")}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(course)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setDeleteCourseId(course.id)
                          setShowDeleteDialog(true)
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">College</TableHead>
                    <TableHead className="hidden xl:table-cell">Duration</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="hidden xl:table-cell">Study Mode</TableHead>
                    <TableHead className="hidden lg:table-cell">Fees</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCourses.map((course, index) => (
                    <TableRow key={course.id}>
                      <TableCell className="text-muted-foreground">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] lg:max-w-[300px] truncate" title={course.name}>
                        {course.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[150px] xl:max-w-[200px] truncate" title={getCollegeName(course.collegeId)}>
                        {getCollegeName(course.collegeId)}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">{course.duration || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
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
                      <TableCell className="hidden xl:table-cell">{course.studyMode || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {course.fees
                          ? `${course.feesCurrency || "INR"} ${course.fees.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                            className="h-8 w-8"
                            onClick={() => handleEdit(course)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                {/* Mobile: Simple prev/next with page indicator */}
                <div className="flex sm:hidden items-center gap-2 w-full justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground whitespace-nowrap px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Desktop: Full pagination */}
                <div className="hidden sm:flex items-center gap-2">
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

