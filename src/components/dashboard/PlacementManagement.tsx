"use client"

import { useState, useEffect, useMemo } from "react"
import { Edit, Trash2, Plus, Upload, Download } from "lucide-react"
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
import { PlacementForm } from "./PlacementForm"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Placement {
  id: number
  collegeId: number
  year: number
  totalStudents?: number | null
  placedStudents?: number | null
  placementPercentage?: number | null
  averagePackage?: number | null
  medianPackage?: number | null
  highestPackage?: number | null
  lowestPackage?: number | null
  topRecruiters?: string[]
  departmentWiseData?: Record<string, any>
  createdAt: Date | string
  updatedAt: Date | string
}

interface College {
  id: number
  name: string
  slug: string
}

export function PlacementManagement() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null)
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterYear, setFilterYear] = useState<string>("")
  const [deletePlacementId, setDeletePlacementId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const fetchPlacements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCollegeId) {
        params.set("collegeId", selectedCollegeId.toString())
      }
      if (filterYear) {
        params.set("year", filterYear)
      }

      const response = await fetch(`/api/placements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPlacements(data.placements || [])
      }
    } catch (error) {
      console.error("Error fetching placements:", error)
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
    fetchColleges()
    fetchPlacements()
  }, [selectedCollegeId, filterYear])

  const handleDelete = async () => {
    if (!deletePlacementId) return

    try {
      const response = await fetch(`/api/placements/${deletePlacementId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPlacements()
        setShowDeleteDialog(false)
        setDeletePlacementId(null)
      } else {
        alert("Failed to delete placement")
      }
    } catch (error) {
      console.error("Error deleting placement:", error)
      alert("Failed to delete placement")
    }
  }

  const handleEdit = (placement: Placement) => {
    setEditingPlacement(placement)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingPlacement(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingPlacement(null)
    fetchPlacements()
  }

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await fetch("/api/placements/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ placements: data }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Imported ${result.success} placements${result.errors > 0 ? `, ${result.errors} errors` : ""}`)
        fetchPlacements()
      } else {
        const error = await response.json()
        alert(`Failed to import: ${error.error}`)
      }
    } catch (error) {
      console.error("Error importing placements:", error)
      alert("Failed to import placements. Please check the file format.")
    }

    e.target.value = ""
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(placements, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `placements-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredPlacements = useMemo(() => {
    let filtered = placements

    if (searchTerm) {
      filtered = filtered.filter((placement) => {
        const college = colleges.find((c) => c.id === placement.collegeId)
        return college?.name.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    return filtered.sort((a, b) => b.year - a.year)
  }, [placements, searchTerm, colleges])

  const paginatedPlacements = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredPlacements.slice(startIndex, startIndex + pageSize)
  }, [filteredPlacements, currentPage, pageSize])

  const totalPages = Math.ceil(filteredPlacements.length / pageSize)

  const getCollegeName = (collegeId: number) => {
    const college = colleges.find((c) => c.id === collegeId)
    return college?.name || `College ID: ${collegeId}`
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "-"
    return `₹${(amount / 100000).toFixed(2)}L`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Placement Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage placement statistics for colleges</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleBulkImport}
              className="hidden"
            />
          </label>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Placement
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Search by college name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={selectedCollegeId?.toString() || ""}
            onValueChange={(value) => {
              setSelectedCollegeId(value ? parseInt(value) : null)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Colleges">
                {(value: string | null) => {
                  if (!value || value === "") return "All Colleges"
                  const college = colleges.find((c) => c.id.toString() === value)
                  return college?.name || "All Colleges"
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Colleges</SelectItem>
              {colleges.map((college) => (
                <SelectItem key={college.id} value={college.id.toString()}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-32">
          <Input
            type="number"
            placeholder="Year"
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Loading placements...</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">College</TableHead>
                  <TableHead className="min-w-[80px]">Year</TableHead>
                  <TableHead className="min-w-[100px]">Total Students</TableHead>
                  <TableHead className="min-w-[100px]">Placed</TableHead>
                  <TableHead className="min-w-[100px]">Placement %</TableHead>
                  <TableHead className="min-w-[120px]">Avg Package</TableHead>
                  <TableHead className="min-w-[120px]">Highest Package</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPlacements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No placements found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPlacements.map((placement) => (
                    <TableRow key={placement.id}>
                      <TableCell className="font-medium">
                        {getCollegeName(placement.collegeId)}
                      </TableCell>
                      <TableCell>{placement.year}</TableCell>
                      <TableCell>{placement.totalStudents?.toLocaleString() || "-"}</TableCell>
                      <TableCell>{placement.placedStudents?.toLocaleString() || "-"}</TableCell>
                      <TableCell>{placement.placementPercentage ? `${placement.placementPercentage}%` : "-"}</TableCell>
                      <TableCell>{formatCurrency(placement.averagePackage)}</TableCell>
                      <TableCell>{formatCurrency(placement.highestPackage)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(placement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletePlacementId(placement.id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredPlacements.length)} of{" "}
                {filteredPlacements.length} placements
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <PlacementForm
          placement={editingPlacement}
          collegeId={selectedCollegeId || undefined}
          onClose={handleFormClose}
          onSuccess={fetchPlacements}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Placement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this placement statistic? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

