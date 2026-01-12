"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface FAQ {
  id: number
  question: string
  answer: string
  category: string | null
  source: string
  isApproved: boolean
  isActive: boolean
  displayOrder: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

const FAQ_CATEGORIES = [
  "admission",
  "fees",
  "courses",
  "colleges",
  "scholarships",
  "general"
]

export function FAQsList() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    displayOrder: 0,
    isActive: true,
    isApproved: true,
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/faqs/admin")
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (faqId: number, isApproved: boolean) => {
    try {
      const response = await fetch("/api/faqs/approve", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faqId, isApproved }),
      })

      if (response.ok) {
        setFaqs((prev) =>
          prev.map((faq) =>
            faq.id === faqId ? { ...faq, isApproved } : faq
          )
        )
      } else {
        alert("Failed to update FAQ approval status")
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
      alert("Failed to update FAQ approval status")
    }
  }

  const handleCreate = () => {
    setEditingFaq(null)
    setFormData({
      question: "",
      answer: "",
      category: "",
      displayOrder: 0,
      isActive: true,
      isApproved: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      displayOrder: faq.displayOrder,
      isActive: faq.isActive,
      isApproved: faq.isApproved,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Question and answer are required")
      return
    }

    try {
      let response
      if (editingFaq) {
        // Update existing FAQ
        response = await fetch(`/api/faqs/${editingFaq.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new FAQ
        response = await fetch("/api/faqs/admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      if (response.ok) {
        setIsDialogOpen(false)
        fetchFAQs() // Refresh list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save FAQ")
      }
    } catch (error) {
      console.error("Error saving FAQ:", error)
      alert("Failed to save FAQ")
    }
  }

  const handleDelete = async (faqId: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
      return
    }

    try {
      const response = await fetch(`/api/faqs/${faqId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFaqs((prev) => prev.filter((faq) => faq.id !== faqId))
      } else {
        alert("Failed to delete FAQ")
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      alert("Failed to delete FAQ")
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "approved" && faq.isApproved) ||
      (filter === "pending" && !faq.isApproved)

    return matchesSearch && matchesFilter
  })

  const pendingCount = faqs.filter((f) => !f.isApproved).length
  const approvedCount = faqs.filter((f) => f.isApproved).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading FAQs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filter, and Create Button */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
            size="sm"
          >
            Approved
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pending
          </Button>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create FAQ
          </Button>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No FAQs found
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      {faq.isApproved ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {faq.category && (
                        <Badge variant="secondary">{faq.category}</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      Source: {faq.source} • Views: {faq.viewCount} • Order: {faq.displayOrder}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {faq.answer}
                </p>
                <div className="flex gap-2">
                  {!faq.isApproved ? (
                    <Button
                      onClick={() => handleApprove(faq.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleApprove(faq.id, false)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEdit(faq)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(faq.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? "Edit FAQ" : "Create New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editingFaq
                ? "Update the FAQ information below."
                : "Fill in the details to create a new FAQ."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter the question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Enter the answer"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isApproved"
                  checked={formData.isApproved}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isApproved: checked })
                  }
                />
                <Label htmlFor="isApproved">Approved</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {editingFaq ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
