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

interface Scholarship {
  id?: number
  title: string
  slug: string
  description: string | null
  provider: string | null
  amount: number | null
  amountCurrency: string
  amountType: string | null
  eligibilityCriteria: string | null
  applicationDeadline: string | null
  applicationStartDate: string | null
  applicationUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  category: string | null
  level: string | null
  course: string | null
  collegeId: number | null
  isActive: boolean
  displayOrder: number
}

interface ScholarshipFormProps {
  scholarship: Scholarship | null
  onClose: () => void
}

export function ScholarshipForm({ scholarship, onClose }: ScholarshipFormProps) {
  const [formData, setFormData] = useState<Partial<Scholarship>>({
    title: "",
    slug: "",
    description: null,
    provider: null,
    amount: null,
    amountCurrency: "INR",
    amountType: null,
    eligibilityCriteria: null,
    applicationDeadline: null,
    applicationStartDate: null,
    applicationUrl: null,
    contactEmail: null,
    contactPhone: null,
    category: null,
    level: null,
    course: null,
    collegeId: null,
    isActive: true,
    displayOrder: 0,
  })
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (scholarship) {
      setFormData(scholarship)
    }
    fetchColleges()
  }, [scholarship])

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

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.title || !formData.slug) {
      setError("Title and slug are required")
      setLoading(false)
      return
    }

    try {
      const url = scholarship?.id
        ? `/api/dashboard/scholarships/${scholarship.id}`
        : "/api/dashboard/scholarships"
      const method = scholarship?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: formData.amount ? parseInt(formData.amount.toString()) : null,
          collegeId: formData.collegeId ? parseInt(formData.collegeId.toString()) : null,
          displayOrder: formData.displayOrder || 0,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save scholarship")
      }

      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save scholarship")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {scholarship ? "Edit Scholarship" : "Add Scholarship"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
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

            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider || ""}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merit-based">Merit-Based</SelectItem>
                  <SelectItem value="need-based">Need-Based</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="minority">Minority</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level || ""}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="collegeId">College (Optional)</Label>
              <Select
                value={formData.collegeId?.toString() || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, collegeId: value ? parseInt(value) : null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value ? parseInt(e.target.value) : null })
                }
              />
            </div>

            <div>
              <Label htmlFor="amountType">Amount Type</Label>
              <Select
                value={formData.amountType || ""}
                onValueChange={(value) => setFormData({ ...formData, amountType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="full_tuition">Full Tuition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="applicationStartDate">Application Start Date</Label>
              <Input
                id="applicationStartDate"
                type="date"
                value={formatDateForInput(formData.applicationStartDate || null)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationStartDate: e.target.value || null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={formatDateForInput(formData.applicationDeadline || null)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicationDeadline: e.target.value || null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input
                id="applicationUrl"
                type="url"
                value={formData.applicationUrl || ""}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ""}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone || ""}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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

            <div className="md:col-span-2">
              <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
              <Textarea
                id="eligibilityCriteria"
                value={formData.eligibilityCriteria || ""}
                onChange={(e) =>
                  setFormData({ ...formData, eligibilityCriteria: e.target.value })
                }
                rows={6}
                placeholder="Enter detailed eligibility requirements..."
              />
            </div>

            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : scholarship ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

