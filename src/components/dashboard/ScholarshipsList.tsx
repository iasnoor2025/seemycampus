"use client"

import { useState, useEffect, useMemo } from "react"
import { Award, Edit, Trash2, Eye, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScholarshipForm } from "./ScholarshipForm"
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
import { format } from "date-fns"

interface Scholarship {
  id: number
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
  college: any
  isActive: boolean
  displayOrder: number
  createdAt: Date | string
  updatedAt: Date | string
}

export function ScholarshipsList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteScholarshipId, setDeleteScholarshipId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchScholarships = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/scholarships?all=true")
      if (response.ok) {
        const data = await response.json()
        setScholarships(data.scholarships || [])
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  const handleDelete = async () => {
    if (!deleteScholarshipId) return

    try {
      const response = await fetch(`/api/dashboard/scholarships/${deleteScholarshipId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchScholarships()
        setShowDeleteDialog(false)
        setDeleteScholarshipId(null)
      } else {
        alert("Failed to delete scholarship")
      }
    } catch (error) {
      console.error("Error deleting scholarship:", error)
      alert("Failed to delete scholarship")
    }
  }

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingScholarship(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingScholarship(null)
    fetchScholarships()
  }

  const formatAmount = (scholarship: Scholarship) => {
    if (!scholarship.amount) return "Not set"
    const currency = scholarship.amountCurrency === "INR" ? "₹" : scholarship.amountCurrency
    const amount = scholarship.amount.toLocaleString()
    if (scholarship.amountType === "percentage") {
      return `${amount}%`
    } else if (scholarship.amountType === "full_tuition") {
      return "Full Tuition"
    }
    return `${currency}${amount}`
  }

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((scholarship) => {
      const matchesSearch =
        scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [scholarships, searchTerm])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading scholarships...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Scholarship
          </Button>
        </div>

        {/* Table */}
        {filteredScholarships.length === 0 ? (
          <div className="text-center p-12 bg-muted rounded-lg">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No scholarships found matching your search." : "No scholarships yet. Click 'Add Scholarship' to get started."}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScholarships.map((scholarship) => (
                  <TableRow key={scholarship.id}>
                    <TableCell className="font-medium">{scholarship.title}</TableCell>
                    <TableCell>{scholarship.provider || "-"}</TableCell>
                    <TableCell>{formatAmount(scholarship)}</TableCell>
                    <TableCell>
                      {scholarship.category ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                          {scholarship.category.replace("-", " ")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{scholarship.level || "-"}</TableCell>
                    <TableCell>
                      {scholarship.applicationDeadline
                        ? format(new Date(scholarship.applicationDeadline), "MMM dd, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          scholarship.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {scholarship.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/scholarships/${scholarship.slug}`, "_blank")}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(scholarship)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteScholarshipId(scholarship.id)
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
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <ScholarshipForm
          scholarship={editingScholarship}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scholarship</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scholarship? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

