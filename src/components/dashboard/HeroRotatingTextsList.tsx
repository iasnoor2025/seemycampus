"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { HeroRotatingTextForm } from "./HeroRotatingTextForm"

interface HeroRotatingText {
  id: number
  text: string
  displayOrder: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export function HeroRotatingTextsList() {
  const [texts, setTexts] = useState<HeroRotatingText[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingText, setEditingText] = useState<HeroRotatingText | null>(null)
  const [deleteTextId, setDeleteTextId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchTexts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/hero-rotating-texts")
      if (response.ok) {
        const data = await response.json()
        setTexts(data.texts || [])
      }
    } catch (error) {
      console.error("Error fetching texts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTexts()
  }, [])

  const handleAdd = () => {
    setEditingText(null)
    setIsFormOpen(true)
  }

  const handleEdit = (text: HeroRotatingText) => {
    setEditingText(text)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    setDeleteTextId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTextId) return

    try {
      const response = await fetch(`/api/dashboard/hero-rotating-texts/${deleteTextId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTexts()
      }
    } catch (error) {
      console.error("Error deleting text:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteTextId(null)
    }
  }

  const handleToggleActive = async (text: HeroRotatingText) => {
    try {
      const response = await fetch(`/api/dashboard/hero-rotating-texts/${text.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...text,
          isActive: !text.isActive,
        }),
      })

      if (response.ok) {
        fetchTexts()
      }
    } catch (error) {
      console.error("Error toggling text status:", error)
    }
  }

  const handleOrderChange = async (text: HeroRotatingText, direction: "up" | "down") => {
    const currentIndex = texts.findIndex((t) => t.id === text.id)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= texts.length) return

    const targetText = texts[targetIndex]
    const newOrder = targetText.displayOrder
    const oldOrder = text.displayOrder

    try {
      await Promise.all([
        fetch(`/api/dashboard/hero-rotating-texts/${text.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...text, displayOrder: newOrder }),
        }),
        fetch(`/api/dashboard/hero-rotating-texts/${targetText.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...targetText, displayOrder: oldOrder }),
        }),
      ])

      fetchTexts()
    } catch (error) {
      console.error("Error updating text order:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading texts...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hero Rotating Texts</h1>
          <p className="text-muted-foreground mt-1">
            Manage the rotating text messages displayed in the hero section
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Text
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Text</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {texts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No rotating texts found. Click "Add Text" to create one.
                </TableCell>
              </TableRow>
            ) : (
              texts.map((text) => (
                <TableRow key={text.id}>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-[44px] min-w-[44px]"
                        onClick={() => handleOrderChange(text, "up")}
                        disabled={texts.findIndex((t) => t.id === text.id) === 0}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-[44px] min-w-[44px]"
                        onClick={() => handleOrderChange(text, "down")}
                        disabled={texts.findIndex((t) => t.id === text.id) === texts.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{text.text}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(text)}
                      title={text.isActive ? "Deactivate" : "Activate"}
                    >
                      {text.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(text)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(text.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <HeroRotatingTextForm
          text={editingText}
          onClose={() => {
            setIsFormOpen(false)
            setEditingText(null)
          }}
          onSuccess={() => {
            fetchTexts()
            setIsFormOpen(false)
            setEditingText(null)
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rotating Text</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rotating text? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

