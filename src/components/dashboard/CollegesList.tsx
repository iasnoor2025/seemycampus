"use client"

import { useState, useEffect, useMemo } from "react"
import { Building2, Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight, Power, Ban, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  isEnabled: boolean
  images: string[] | null
  googlePlaceId?: string | null
  ranking?: number | null
  establishedYear?: number | null
  averagePackage?: number | null
  accreditation?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  entranceExams?: string[] | null
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
  const { toast } = useToast()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")
  const [deleteCollegeId, setDeleteCollegeId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkDisableDialog, setShowBulkDisableDialog] = useState(false)
  const [showBulkEnableDialog, setShowBulkEnableDialog] = useState(false)
  const [bulkDisableState, setBulkDisableState] = useState<string | null>(null)
  const [bulkEnableState, setBulkEnableState] = useState<string | null>(null)
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
        toast({
          title: "Success",
          description: "College deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete college",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting college:", error)
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (college: College) => {
    try {
      // Fetch full college data to ensure we have all fields
      const response = await fetch(`/api/dashboard/colleges/${college.id}`)
      if (response.ok) {
        const fullCollege = await response.json()
        setEditingCollege(fullCollege)
        setIsFormOpen(true)
      } else {
        // Fallback to the college from the list if fetch fails
        setEditingCollege(college)
        setIsFormOpen(true)
      }
    } catch (error) {
      console.error("Error fetching college:", error)
      // Fallback to the college from the list if fetch fails
      setEditingCollege(college)
      setIsFormOpen(true)
    }
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

  const handleToggleEnabled = async (collegeId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/colleges/${collegeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: !currentStatus }),
      })

      if (response.ok) {
        fetchColleges()
        toast({
          title: "Success",
          description: `College ${!currentStatus ? "enabled" : "disabled"} successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update college status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating college status:", error)
      toast({
        title: "Error",
        description: "Failed to update college status",
        variant: "destructive",
      })
    }
  }

  const handleBulkDisableState = async () => {
    if (!bulkDisableState) return

    try {
      const response = await fetch("/api/dashboard/colleges", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: bulkDisableState, isEnabled: false }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Successfully disabled ${data.count} colleges in ${bulkDisableState}`,
        })
        fetchColleges()
        setShowBulkDisableDialog(false)
        setBulkDisableState(null)
        setSelectedState("all")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to disable colleges",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error bulk disabling colleges:", error)
      toast({
        title: "Error",
        description: "Failed to disable colleges",
        variant: "destructive",
      })
    }
  }

  const handleBulkEnableState = async () => {
    if (!bulkEnableState) return

    try {
      const response = await fetch("/api/dashboard/colleges", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: bulkEnableState, isEnabled: true }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `Successfully enabled ${data.count} colleges in ${bulkEnableState}`,
        })
        fetchColleges()
        setShowBulkEnableDialog(false)
        setBulkEnableState(null)
        setSelectedState("all")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to enable colleges",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error bulk enabling colleges:", error)
      toast({
        title: "Error",
        description: "Failed to enable colleges",
        variant: "destructive",
      })
    }
  }

  const handleBulkDisableClick = () => {
    if (selectedState === "all") {
      toast({
        title: "Please select a state",
        description: "You need to select a state first to disable all colleges in that state",
        variant: "destructive",
      })
      return
    }
    setBulkDisableState(selectedState)
    setShowBulkDisableDialog(true)
  }

  const handleBulkEnableClick = () => {
    if (selectedState === "all") {
      toast({
        title: "Please select a state",
        description: "You need to select a state first to enable all colleges in that state",
        variant: "destructive",
      })
      return
    }
    setBulkEnableState(selectedState)
    setShowBulkEnableDialog(true)
  }

  // Check if selected state has any disabled colleges
  const hasDisabledColleges = useMemo(() => {
    if (selectedState === "all") return false
    return colleges.some(college => college.state === selectedState && !college.isEnabled)
  }, [colleges, selectedState])

  // Check if selected state has any enabled colleges
  const hasEnabledColleges = useMemo(() => {
    if (selectedState === "all") return false
    return colleges.some(college => college.state === selectedState && college.isEnabled)
  }, [colleges, selectedState])

  const uniqueStates = useMemo(() => {
    const states = new Set<string>()
    colleges.forEach((college) => {
      // Include all states (for dashboard management, we need to see all states to disable them)
      if (college.state) {
        states.add(college.state)
      }
    })
    return Array.from(states).sort()
  }, [colleges])

  // Extract unique cities based on selected state (show all cities in dashboard for management)
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>()
    colleges.forEach((college) => {
      // In dashboard, show all cities (enabled and disabled) for management purposes
      // If a state is selected, only include cities from that state
      if (selectedState !== "all") {
        if (college.city && college.state === selectedState) {
          cities.add(college.city)
        }
      } else {
        // If no state is selected, show all cities
        if (college.city) {
          cities.add(college.city)
        }
      }
    })
    return Array.from(cities).sort()
  }, [colleges, selectedState])

  // Filter and sort colleges
  const filteredAndSortedColleges = useMemo(() => {
    let filtered = colleges.filter((college) => {
      // Search filter
      const matchesSearch =
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.state?.toLowerCase().includes(searchTerm.toLowerCase())

      // City filter
      const matchesCity = selectedCity === "all" || college.city === selectedCity

      // State filter
      const matchesState = selectedState === "all" || college.state === selectedState

      return matchesSearch && matchesCity && matchesState
    })

    // Sort by name alphabetically
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [colleges, searchTerm, selectedCity, selectedState])

  // Paginate filtered results
  const paginatedColleges = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedColleges.slice(startIndex, endIndex)
  }, [filteredAndSortedColleges, currentPage, pageSize])

  const totalFilteredPages = Math.ceil(filteredAndSortedColleges.length / pageSize)

  // Reset city filter when state changes if current city is not in the filtered list
  useEffect(() => {
    if (selectedState !== "all" && selectedCity !== "all") {
      const citiesInState = uniqueCities
      if (!citiesInState.includes(selectedCity)) {
        setSelectedCity("all")
      }
    }
  }, [selectedState, uniqueCities, selectedCity])

  // Reset to page 1 when search term or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCity, selectedState])

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
        {/* Header with Search, Filters, and Add Button - Designer Grade */}
        <div className="bg-white p-3 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100/50">
          <div className="flex flex-row items-center gap-3 flex-nowrap">
            {/* Search - Flexible */}
            <div className="relative flex-1 min-w-0 group">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-blue-500/20 text-[11px] font-bold uppercase tracking-wider text-slate-700 placeholder:text-slate-400 transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                <Building2 className="h-3 w-3 text-slate-400" />
              </div>
            </div>

            {/* State Filter */}
            <Select
              value={selectedState}
              onValueChange={(value) => {
                setSelectedState(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-12 w-[140px] bg-slate-50 border-none rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest px-3 hover:bg-slate-100 transition-all flex-shrink-0">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-[300px]">
                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state} className="text-[10px] font-bold uppercase tracking-widest">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-12 w-[140px] bg-slate-50 border-none rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest px-3 hover:bg-slate-100 transition-all flex-shrink-0">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-[300px]">
                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">
                  {selectedState !== "all" ? "All Cities" : "All Cities"}
                </SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city} className="text-[10px] font-bold uppercase tracking-widest">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Button */}
            <Button
              className="h-12 px-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] transition-all duration-500 shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2 group whitespace-nowrap flex-shrink-0"
              onClick={handleAdd}
            >
              <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add</span>
            </Button>
          </div>
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
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Identity</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Institution</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Geography</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Connectivity</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Alliance</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Visibility</TableHead>
                  <TableHead className="py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right pr-10">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedColleges.map((college) => {
                  const logoUrl = college.images && Array.isArray(college.images) && college.images.length > 0
                    ? college.images[0]
                    : null
                  const hasValidLogo = logoUrl && (logoUrl.startsWith("http://") || logoUrl.startsWith("https://"))

                  return (
                    <TableRow key={college.id} className="group/row hover:bg-slate-50/80 transition-all duration-300 border-slate-100">
                      <TableCell className="py-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-center transition-transform group-hover/row:scale-110 duration-500">
                          {hasValidLogo ? (
                            <Image
                              src={logoUrl}
                              alt={college.name}
                              fill
                              sizes="80px"
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                              {getInitials(college.name)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1 group-hover/row:text-blue-600 transition-colors">
                            {college.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{college.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{college.city || "-"}</span>
                          <span className="text-[10px] font-medium text-slate-400">{college.state || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-medium text-slate-600">{college.email || "-"}</span>
                          <span className="text-[10px] font-medium text-slate-400">{college.phone || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {college.isAcademicAlliance ? (
                          <div className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">Partner</div>
                        ) : (
                          <div className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-slate-200">Standard</div>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={college.isEnabled}
                            onCheckedChange={() => handleToggleEnabled(college.id, college.isEnabled)}
                            className="scale-75 data-[state=checked]:bg-emerald-500"
                          />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${college.isEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                            {college.isEnabled ? "Live" : "Ghost"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-10">
                        <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover/row:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            onClick={() => window.open(`/colleges/${college.slug}`, "_blank")}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            onClick={() => handleEdit(college)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            onClick={() => {
                              setDeleteCollegeId(college.id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Bulk Disable State Dialog */}
      <AlertDialog open={showBulkDisableDialog} onOpenChange={setShowBulkDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable All Colleges in {bulkDisableState}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable all colleges in <strong>{bulkDisableState}</strong>?
              This will hide all colleges from this state on the public site. You can re-enable them individually or in bulk later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowBulkDisableDialog(false)
              setBulkDisableState(null)
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDisableState} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disable All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Enable State Dialog */}
      <AlertDialog open={showBulkEnableDialog} onOpenChange={setShowBulkEnableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable All Colleges in {bulkEnableState}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to enable all colleges in <strong>{bulkEnableState}</strong>?
              This will make all colleges from this state visible on the public site again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowBulkEnableDialog(false)
              setBulkEnableState(null)
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkEnableState} className="bg-green-600 text-white hover:bg-green-700">
              Enable All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { CollegesList as default }

