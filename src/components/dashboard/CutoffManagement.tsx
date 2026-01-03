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
import { CutoffForm } from "./CutoffForm"
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

interface Cutoff {
  id: number
  collegeId: number
  examName: string
  courseName?: string | null
  year: number
  category?: string | null
  openingRank?: number | null
  closingRank?: number | null
  openingScore?: number | null
  closingScore?: number | null
  round?: number
  quota?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface College {
  id: number
  name: string
  slug: string
}

export function CutoffManagement() {
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCutoff, setEditingCutoff] = useState<Cutoff | null>(null)
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterYear, setFilterYear] = useState<string>("")
  const [filterExam, setFilterExam] = useState<string>("")
  const [deleteCutoffId, setDeleteCutoffId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [mounted, setMounted] = useState(false)

  const fetchCutoffs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCollegeId) {
        params.set("collegeId", selectedCollegeId.toString())
      }
      if (filterYear) {
        params.set("year", filterYear)
      }
      if (filterExam) {
        params.set("examName", filterExam)
      }

      const response = await fetch(`/api/cutoffs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCutoffs(data.cutoffs || [])
      }
    } catch (error) {
      console.error("Error fetching cutoffs:", error)
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
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchColleges()
      fetchCutoffs()
    }
  }, [selectedCollegeId, filterYear, filterExam, mounted])

  const handleDelete = async () => {
    if (!deleteCutoffId) return

    try {
      const response = await fetch(`/api/cutoffs/${deleteCutoffId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCutoffs()
        setShowDeleteDialog(false)
        setDeleteCutoffId(null)
      } else {
        alert("Failed to delete cutoff")
      }
    } catch (error) {
      console.error("Error deleting cutoff:", error)
      alert("Failed to delete cutoff")
    }
  }

  const handleEdit = (cutoff: Cutoff) => {
    setEditingCutoff(cutoff)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingCutoff(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCutoff(null)
    fetchCutoffs()
  }

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await fetch("/api/cutoffs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cutoffs: data }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Imported ${result.success} cutoffs${result.errors > 0 ? `, ${result.errors} errors` : ""}`)
        fetchCutoffs()
      } else {
        const error = await response.json()
        alert(`Failed to import: ${error.error}`)
      }
    } catch (error) {
      console.error("Error importing cutoffs:", error)
      alert("Failed to import cutoffs. Please check the file format.")
    }

    // Reset input
    e.target.value = ""
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(cutoffs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cutoffs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filter cutoffs
  const filteredCutoffs = useMemo(() => {
    let filtered = cutoffs

    if (searchTerm) {
      filtered = filtered.filter(
        (cutoff) =>
          cutoff.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cutoff.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cutoff.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      if (b.round !== a.round) return (b.round || 0) - (a.round || 0)
      return a.examName.localeCompare(b.examName)
    })
  }, [cutoffs, searchTerm])

  // Paginate
  const paginatedCutoffs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredCutoffs.slice(startIndex, startIndex + pageSize)
  }, [filteredCutoffs, currentPage, pageSize])

  const totalPages = Math.ceil(filteredCutoffs.length / pageSize)

  const getCollegeName = (collegeId: number) => {
    const college = colleges.find((c) => c.id === collegeId)
    return college?.name || `College ID: ${collegeId}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Cutoff Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage entrance exam cutoffs for colleges</p>
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
            Add Cutoff
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Search by exam, course, or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={mounted && selectedCollegeId ? selectedCollegeId.toString() : "all"}
            onValueChange={(value) => {
              if (mounted) {
                setSelectedCollegeId(value === "all" ? null : parseInt(value))
                setCurrentPage(1)
              }
            }}
            disabled={!mounted}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Colleges" />
            </SelectTrigger>
            {mounted && (
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id.toString()}>
                    {college.name}
                  </SelectItem>
                ))}
              </SelectContent>
            )}
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
        <div className="w-full sm:w-48">
          <Input
            placeholder="Exam name"
            value={filterExam}
            onChange={(e) => {
              setFilterExam(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Loading cutoffs...</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">College</TableHead>
                  <TableHead className="min-w-[100px]">Exam</TableHead>
                  <TableHead className="min-w-[120px]">Course</TableHead>
                  <TableHead className="min-w-[80px]">Year</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[100px]">Opening Rank</TableHead>
                  <TableHead className="min-w-[100px]">Closing Rank</TableHead>
                  <TableHead className="min-w-[80px]">Round</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCutoffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No cutoffs found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCutoffs.map((cutoff) => (
                    <TableRow key={cutoff.id}>
                      <TableCell className="font-medium">
                        {getCollegeName(cutoff.collegeId)}
                      </TableCell>
                      <TableCell>{cutoff.examName}</TableCell>
                      <TableCell>{cutoff.courseName || "-"}</TableCell>
                      <TableCell>{cutoff.year}</TableCell>
                      <TableCell>{cutoff.category || "-"}</TableCell>
                      <TableCell>{cutoff.openingRank || "-"}</TableCell>
                      <TableCell>{cutoff.closingRank || "-"}</TableCell>
                      <TableCell>{cutoff.round || 1}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cutoff)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteCutoffId(cutoff.id)
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
                {Math.min(currentPage * pageSize, filteredCutoffs.length)} of{" "}
                {filteredCutoffs.length} cutoffs
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
        <CutoffForm
          cutoff={editingCutoff}
          collegeId={selectedCollegeId || undefined}
          onClose={handleFormClose}
          onSuccess={fetchCutoffs}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cutoff</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cutoff? This action cannot be undone.
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

