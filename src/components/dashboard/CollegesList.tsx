"use client"

import { useState, useEffect, useMemo } from "react"
import { Building2, Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CollegeForm } from "./CollegeForm"
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
  images: string[] | null
  createdAt: Date | string
  updatedAt: Date | string
}

// Helper function to get college initials
function getInitials(name: string): string {
  const words = name.split(" ").filter(word => word.length > 0)
  if (words.length === 0) return "CO"
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  const first = words[0][0]?.toUpperCase() || ""
  const last = words[words.length - 1][0]?.toUpperCase() || ""
  return (first + last).slice(0, 2) || "CO"
}

export function CollegesList() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteCollegeId, setDeleteCollegeId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(20) // Items per page

  const fetchColleges = async () => {
    try {
      setLoading(true)
      // Fetch all colleges for client-side filtering and pagination
      const response = await fetch("/api/dashboard/colleges?all=true")
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
        setTotalCount(data.pagination?.totalCount || data.colleges?.length || 0)
      } else {
        console.error("Failed to fetch colleges:", response.status, response.statusText)
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

  const handleDelete = async () => {
    if (!deleteCollegeId) return

    try {
      const response = await fetch(`/api/dashboard/colleges/${deleteCollegeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchColleges()
        setShowDeleteDialog(false)
        setDeleteCollegeId(null)
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

  // Filter and sort colleges
  const filteredAndSortedColleges = useMemo(() => {
    const filtered = colleges.filter((college) =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Sort by name alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [colleges, searchTerm])

  // Paginate filtered results
  const paginatedColleges = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedColleges.slice(startIndex, endIndex)
  }, [filteredAndSortedColleges, currentPage, pageSize])

  const totalFilteredPages = Math.ceil(filteredAndSortedColleges.length / pageSize)

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
        {paginatedColleges.length === 0 && filteredAndSortedColleges.length === 0 ? (
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
                  <TableHead className="w-[100px]">Logo</TableHead>
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
                {paginatedColleges.map((college) => {
                  const logoUrl = college.images && Array.isArray(college.images) && college.images.length > 0 
                    ? college.images[0] 
                    : null
                  const hasValidLogo = logoUrl && (logoUrl.startsWith("http://") || logoUrl.startsWith("https://"))
                  
                  return (
                    <TableRow key={college.id}>
                    <TableCell>
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm border border-gray-200">
                        {hasValidLogo ? (
                          <>
                            <Image
                              src={logoUrl}
                              alt={college.name}
                              fill
                              sizes="80px"
                              className="object-contain p-2 bg-white"
                              onError={(e) => {
                                // Hide image on error, show initials
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const parent = target.parentElement
                                if (parent) {
                                  const fallback = parent.querySelector(".logo-fallback") as HTMLElement
                                  if (fallback) fallback.style.display = "flex"
                                }
                              }}
                            />
                            <div 
                              className="logo-fallback absolute inset-0 flex items-center justify-center text-white font-bold text-sm"
                              style={{ display: "none" }}
                            >
                              {getInitials(college.name)}
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(college.name)}
                          </div>
                        )}
                      </div>
                    </TableCell>
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
                          onClick={() => {
                            setDeleteCollegeId(college.id)
                            setShowDeleteDialog(true)
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredAndSortedColleges.length > 0 && totalFilteredPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedColleges.length)} of {filteredAndSortedColleges.length} colleges
              {searchTerm && ` (filtered from ${totalCount} total)`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                  let pageNum: number
                  if (totalFilteredPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalFilteredPages - 2) {
                    pageNum = totalFilteredPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  const isActive = pageNum === currentPage
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalFilteredPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
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

      {/* Delete College Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete College</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this college? All courses associated with this college will also be deleted. This action cannot be undone.
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

export { CollegesList as default }

