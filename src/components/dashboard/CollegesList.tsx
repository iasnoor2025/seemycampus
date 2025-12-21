"use client"

import { useState, useEffect } from "react"
import { Building2, Edit, Trash2, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CollegeForm } from "./CollegeForm"

interface College {
  id: number
  name: string
  slug: string
  location: string | null
  city: string | null
  state: string | null
  country: string | null
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  isAcademicAlliance: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export function CollegesList() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchColleges = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/colleges?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
      }
    } catch (error) {
      console.error("Error fetching colleges:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColleges()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this college?")) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/colleges/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchColleges()
      } else {
        alert("Failed to delete college")
      }
    } catch (error) {
      console.error("Error deleting college:", error)
      alert("Failed to delete college")
    }
  }

  const handleEdit = (college: College) => {
    setEditingCollege(college)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingCollege(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCollege(null)
    fetchColleges()
  }

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading colleges...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button className="flex items-center gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add College
          </Button>
        </div>

        {/* Table */}
        {filteredColleges.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-md">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No colleges found</p>
            <p className="text-sm mt-2">
              {searchTerm ? "Try a different search term" : 'Click "Add College" to get started'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Academic Alliance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell className="font-medium">{college.name}</TableCell>
                    <TableCell>{college.location || "-"}</TableCell>
                    <TableCell>{college.city || "-"}</TableCell>
                    <TableCell>{college.email || "-"}</TableCell>
                    <TableCell>{college.phone || "-"}</TableCell>
                    <TableCell>
                      {college.isAcademicAlliance ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/colleges/${college.slug}`, "_blank")}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(college)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(college.id)}
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
        <CollegeForm
          college={editingCollege}
          onClose={handleFormClose}
        />
      )}
    </>
  )
}

export { CollegesList as default }

