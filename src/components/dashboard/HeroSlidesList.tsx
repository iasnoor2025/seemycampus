"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HeroSlideForm } from "./HeroSlideForm"
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
import Image from "next/image"

interface HeroSlide {
  id: number
  title: string | null
  subtitle: string | null
  imageUrl: string
  buttonText: string | null
  buttonLink: string | null
  displayOrder: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export function HeroSlidesList() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [deleteSlideId, setDeleteSlideId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/hero-slides")
      if (response.ok) {
        const data = await response.json()
        setSlides(data.slides || [])
      }
    } catch (error) {
      console.error("Error fetching slides:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const handleAdd = () => {
    setEditingSlide(null)
    setIsFormOpen(true)
  }

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeleteSlideId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteSlideId) return

    try {
      const response = await fetch(`/api/dashboard/hero-slides/${deleteSlideId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSlides()
      }
    } catch (error) {
      console.error("Error deleting slide:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteSlideId(null)
    }
  }

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/dashboard/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...slide,
          isActive: !slide.isActive,
        }),
      })

      if (response.ok) {
        fetchSlides()
      }
    } catch (error) {
      console.error("Error toggling slide status:", error)
    }
  }

  const handleOrderChange = async (slide: HeroSlide, direction: "up" | "down") => {
    const currentIndex = slides.findIndex((s) => s.id === slide.id)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return

    const targetSlide = slides[targetIndex]
    const newOrder = targetSlide.displayOrder
    const oldOrder = slide.displayOrder

    try {
      // Update both slides
      await Promise.all([
        fetch(`/api/dashboard/hero-slides/${slide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...slide, displayOrder: newOrder }),
        }),
        fetch(`/api/dashboard/hero-slides/${targetSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...targetSlide, displayOrder: oldOrder }),
        }),
      ])

      fetchSlides()
    } catch (error) {
      console.error("Error updating slide order:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading slides...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {slides.length} slide{slides.length !== 1 ? "s" : ""} total
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {slides.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((slide, index) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <div className="relative w-20 h-20 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={slide.imageUrl}
                        alt={slide.title || "Slide image"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {slide.title || <span className="text-muted-foreground">No title</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                    {slide.subtitle || "No subtitle"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleOrderChange(slide, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleOrderChange(slide, "down")}
                        disabled={index === slides.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(slide)}
                      className={slide.isActive ? "text-green-600" : "text-gray-400"}
                    >
                      {slide.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(slide)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(slide.id)}
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
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No slides found</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Slide
          </Button>
        </div>
      )}

      {isFormOpen && (
        <HeroSlideForm
          slide={editingSlide}
          onClose={() => {
            setIsFormOpen(false)
            setEditingSlide(null)
          }}
          onSuccess={fetchSlides}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this slide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

