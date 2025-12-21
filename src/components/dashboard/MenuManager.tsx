"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CategoryForm } from "./CategoryForm"
import { MenuCourseForm } from "./MenuCourseForm"

interface Category {
  id: number
  name: string
  slug: string
  displayOrder: number
  isActive: boolean
}

interface MenuCourse {
  id: number
  name: string
  slug: string
  categoryId: number
  href: string | null
  displayOrder: number
  isActive: boolean
}

export function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuCourses, setMenuCourses] = useState<MenuCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingCourse, setEditingCourse] = useState<MenuCourse | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
  const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, coursesRes] = await Promise.all([
        fetch("/api/dashboard/menu/categories"),
        fetch("/api/dashboard/menu/menu-courses"),
      ])

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }
      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setMenuCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Error fetching menu data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return

    try {
      const response = await fetch(`/api/dashboard/menu/categories/${deleteCategoryId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchData()
        setShowDeleteCategoryDialog(false)
        setDeleteCategoryId(null)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return

    try {
      const response = await fetch(`/api/dashboard/menu/menu-courses/${deleteCourseId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchData()
        setShowDeleteCourseDialog(false)
        setDeleteCourseId(null)
      }
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Navigation Menu Structure</CardTitle>
            <Button onClick={() => {
              setEditingCategory(null)
              setShowCategoryForm(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => {
              const categoryCourses = menuCourses.filter(
                (c) => c.categoryId === category.id
              )
              const isExpanded = expandedCategories.has(category.id)

              return (
                <div key={category.id} className="border rounded-lg">
                  {/* Category Row */}
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-semibold">{category.name}</span>
                      {!category.isActive && (
                        <span className="text-xs text-muted-foreground">(Inactive)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category)
                          setShowCategoryForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCategoryId(category.id)
                          setEditingCourse(null)
                          setShowCourseForm(true)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteCategoryId(category.id)
                          setShowDeleteCategoryDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Courses */}
                  {isExpanded && (
                    <div className="pl-8 space-y-1">
                      {categoryCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-2 bg-white border-l-2 border-gray-300"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm">{course.name}</span>
                            {!course.isActive && (
                              <span className="text-xs text-muted-foreground">(Inactive)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCourse(course)
                                setShowCourseForm(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeleteCourseId(course.id)
                                setShowDeleteCourseDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Forms */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false)
            setEditingCategory(null)
            fetchData()
          }}
        />
      )}

      {showCourseForm && (
        <MenuCourseForm
          course={editingCourse}
          categoryId={selectedCategoryId}
          categories={categories}
          onClose={() => {
            setShowCourseForm(false)
            setEditingCourse(null)
            setSelectedCategoryId(null)
            fetchData()
          }}
        />
      )}

      {/* Delete Category Dialog */}
      <AlertDialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? All courses in this category will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={showDeleteCourseDialog} onOpenChange={setShowDeleteCourseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
