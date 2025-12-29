"use client"

import { useState, useEffect } from "react"
import { FileText, Mail, Phone, Calendar, CheckCircle, Clock, XCircle, Search, User, Building, MapPin, GraduationCap, Edit, Trash2, UserPlus, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"

interface Lead {
  id: number
  name: string
  email: string
  phone: string | null
  source: string | null
  status: string | null
  counselorId: number | null
  counselor?: {
    id: number
    name: string | null
    email: string
  }
  quizData: any
  createdAt: Date | string
  updatedAt: Date | string
}

interface Counselor {
  id: number
  name: string | null
  email: string
  activeLeadsCount: number
  maxLeads: number
  canAssignMore: boolean
}

export function LeadsList() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role || "student"
  const isAdmin = userRole === "admin"
  const isCounselor = userRole === "counselor"
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [leadToAssign, setLeadToAssign] = useState<Lead | null>(null)
  const [selectedCounselorId, setSelectedCounselorId] = useState<number | null>(null)
  const [bulkSelectedCounselorId, setBulkSelectedCounselorId] = useState<number | null>(null)
  const [bulkAssignCount, setBulkAssignCount] = useState<string>("10")
  const [bulkAssignStatus, setBulkAssignStatus] = useState<string>("new")
  const [isAssigning, setIsAssigning] = useState(false)
  const [isBulkAssigning, setIsBulkAssigning] = useState(false)
  const [editFormData, setEditFormData] = useState<{
    name: string
    email: string
    phone: string
    source: "form" | "quiz" | "chat" | "direct"
  }>({
    name: "",
    email: "",
    phone: "",
    source: "form",
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leads?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCounselors = async () => {
    try {
      const response = await fetch("/api/leads/assign")
      if (response.ok) {
        const data = await response.json()
        setCounselors(data.counselors || [])
      }
    } catch (error) {
      console.error("Error fetching counselors:", error)
    }
  }

  useEffect(() => {
    fetchLeads()
    if (isAdmin) {
      fetchCounselors()
    }
  }, [isAdmin])

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchLeads()
      }
    } catch (error) {
      console.error("Error updating lead status:", error)
    }
  }

  const handleAssignClick = (lead: Lead) => {
    setLeadToAssign(lead)
    setSelectedCounselorId(lead.counselorId)
    setAssignDialogOpen(true)
  }

  const handleAssignLead = async () => {
    if (!leadToAssign || !selectedCounselorId) return

    setIsAssigning(true)
    try {
      const response = await fetch("/api/leads/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: leadToAssign.id,
          counselorId: selectedCounselorId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to assign lead")
      }

      await fetchLeads()
      await fetchCounselors()
      setAssignDialogOpen(false)
      setLeadToAssign(null)
      setSelectedCounselorId(null)
    } catch (error: any) {
      alert(error.message || "Failed to assign lead")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleBulkAssign = async () => {
    if (!bulkSelectedCounselorId || !bulkAssignCount || !bulkAssignStatus) return

    const count = parseInt(bulkAssignCount)
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid number of leads to assign")
      return
    }

    setIsBulkAssigning(true)
    try {
      const response = await fetch("/api/leads/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counselorId: bulkSelectedCounselorId,
          count: count,
          status: bulkAssignStatus,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to assign leads")
      }

      const data = await response.json()
      alert(data.message || `Successfully assigned ${data.assignedCount} lead(s)`)
      
      await fetchLeads()
      await fetchCounselors()
      setBulkAssignDialogOpen(false)
      setBulkSelectedCounselorId(null)
      setBulkAssignCount("10")
      setBulkAssignStatus("new")
    } catch (error: any) {
      alert(error.message || "Failed to assign leads")
    } finally {
      setIsBulkAssigning(false)
    }
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setEditFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      source: (lead.source as "form" | "quiz" | "chat" | "direct") || ("form" as const),
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedLead) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editFormData,
          quizData: selectedLead.quizData, // Preserve existing quizData
        }),
      })

      if (response.ok) {
        setEditDialogOpen(false)
        setSelectedLead(null)
        fetchLeads()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update lead")
      }
    } catch (error) {
      console.error("Error updating lead:", error)
      alert("Failed to update lead")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return

    try {
      const response = await fetch(`/api/leads/${leadToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDeleteDialogOpen(false)
        setLeadToDelete(null)
        fetchLeads()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete lead")
      }
    } catch (error) {
      console.error("Error deleting lead:", error)
      alert("Failed to delete lead")
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "new":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "contacted":
        return <CheckCircle className="h-4 w-4 text-yellow-500" />
      case "qualified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "converted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-green-100 text-green-800"
      case "converted":
        return "bg-green-200 text-green-900"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading leads...</div>
      </div>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Button
            onClick={() => {
              fetchCounselors()
              setBulkAssignDialogOpen(true)
            }}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Bulk Assign
          </Button>
        )}
      </div>

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                {isAdmin && <TableHead>Counselor</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${lead.email}`} className="hover:underline">
                          {lead.email}
                        </a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <a href={`tel:${lead.phone}`} className="hover:underline">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{lead.source || "N/A"}</span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {lead.counselor ? (
                        <div className="text-sm">
                          <div className="font-medium">{lead.counselor.name || "N/A"}</div>
                          <div className="text-muted-foreground text-xs">{lead.counselor.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(lead.status)}
                      <Select
                        value={lead.status || "new"}
                        onValueChange={(value) => value && handleStatusUpdate(lead.id, value)}
                      >
                        <SelectTrigger className={`w-[140px] h-8 ${getStatusColor(lead.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {(lead.quizData || lead.source === "form") && (
                        <Dialog open={dialogOpen && selectedLead?.id === lead.id} onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) setSelectedLead(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead)
                                setDialogOpen(true)
                              }}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Lead Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {lead.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 mt-4">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg">Basic Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Name</div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{lead.name}</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Email</div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                      {lead.email}
                                    </a>
                                  </div>
                                </div>
                                {lead.phone && (
                                  <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Phone</div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                        {lead.phone}
                                      </a>
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Source</div>
                                  <span className="text-sm capitalize">{lead.source || "N/A"}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Status</div>
                                  <span className={`text-sm px-2 py-1 rounded ${getStatusColor(lead.status)}`}>
                                    {lead.status || "new"}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Submitted</div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {new Date(lead.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Contact Form Details */}
                            {lead.source === "form" && lead.quizData && (
                              <div className="space-y-4 border-t pt-4">
                                <h3 className="font-semibold text-lg">Contact Form Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  {lead.quizData.firstName && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">First Name</div>
                                      <div className="font-medium">{lead.quizData.firstName}</div>
                                    </div>
                                  )}
                                  {lead.quizData.lastName && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">Last Name</div>
                                      <div className="font-medium">{lead.quizData.lastName}</div>
                                    </div>
                                  )}
                                  {lead.quizData.classYear && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">Class/Year</div>
                                      <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <span>{lead.quizData.classYear}</span>
                                      </div>
                                    </div>
                                  )}
                                  {lead.quizData.boardUniversity && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">Board/University</div>
                                      <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{lead.quizData.boardUniversity}</span>
                                      </div>
                                    </div>
                                  )}
                                  {lead.quizData.city && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">City</div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{lead.quizData.city}</span>
                                      </div>
                                    </div>
                                  )}
                                  {lead.quizData.interestedCourses && (
                                    <div className="space-y-1 col-span-2">
                                      <div className="text-sm text-muted-foreground">Interested Courses</div>
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>{lead.quizData.interestedCourses}</span>
                                      </div>
                                    </div>
                                  )}
                                  {lead.quizData.entranceExam && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">Entrance Exam</div>
                                      <div>{lead.quizData.entranceExam}</div>
                                    </div>
                                  )}
                                  {lead.quizData.examScore && (
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground">Exam Score</div>
                                      <div>{lead.quizData.examScore}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Quiz Data (for quiz leads) */}
                            {lead.source === "quiz" && lead.quizData && (
                              <div className="space-y-4 border-t pt-4">
                                <h3 className="font-semibold text-lg">Quiz Responses</h3>
                                <div className="bg-muted p-4 rounded-lg">
                                  <pre className="text-sm overflow-auto">
                                    {JSON.stringify(lead.quizData, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      )}
                      
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAssignClick(lead)}
                          title="Assign to Counselor"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(lead)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No leads found</p>
        </div>
      )}

      {/* Edit Lead Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-source">Source</Label>
              <Select
                value={editFormData.source}
                onValueChange={(value: string | null) => setEditFormData({ ...editFormData, source: (value || "form") as "form" | "quiz" | "chat" | "direct" })}
              >
                <SelectTrigger id="edit-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setSelectedLead(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead for{" "}
              <strong>{leadToDelete?.name}</strong> ({leadToDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Lead Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            // Prevent closing when clicking on Select dropdown
            const target = e.target as HTMLElement
            if (target.closest('[data-slot="select-content"]') || 
                target.closest('[data-baseui-select-positioner]') ||
                target.closest('[data-baseui-select-popup]')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Assign Lead to Counselor</DialogTitle>
            <DialogDescription>
              Select a counselor to assign this lead. Counselors can have a maximum of 10 active leads.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lead Information</Label>
              <div className="text-sm text-muted-foreground">
                <div><strong>Name:</strong> {leadToAssign?.name}</div>
                <div><strong>Email:</strong> {leadToAssign?.email}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="counselor">Counselor</Label>
              <Select
                value={selectedCounselorId?.toString() || ""}
                onValueChange={(value) => setSelectedCounselorId(parseInt(value))}
              >
                <SelectTrigger id="counselor">
                  <SelectValue placeholder="Select a counselor" />
                </SelectTrigger>
                <SelectContent>
                  {counselors.map((counselor) => (
                    <SelectItem
                      key={counselor.id}
                      value={counselor.id.toString()}
                      disabled={!counselor.canAssignMore}
                    >
                      {counselor.name || counselor.email} 
                      {counselor.canAssignMore 
                        ? ` (${counselor.activeLeadsCount}/${counselor.maxLeads} leads)`
                        : ` (FULL - ${counselor.activeLeadsCount}/${counselor.maxLeads} leads)`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {counselors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No counselors available. Please create counselor users first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false)
                setLeadToAssign(null)
                setSelectedCounselorId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignLead}
              disabled={!selectedCounselorId || isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Leads Dialog */}
      <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
        <DialogContent
          onInteractOutside={(e) => {
            // Prevent closing when clicking on Select dropdown
            const target = e.target as HTMLElement
            if (target.closest('[data-slot="select-content"]') || 
                target.closest('[data-baseui-select-positioner]') ||
                target.closest('[data-baseui-select-popup]')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Bulk Assign Leads to Counselor</DialogTitle>
            <DialogDescription>
              Randomly assign multiple unassigned leads to a counselor. The system will randomly select from available unassigned leads and assign them with the selected status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-counselor">Counselor</Label>
              <Select
                value={bulkSelectedCounselorId?.toString() || ""}
                onValueChange={(value) => setBulkSelectedCounselorId(parseInt(value))}
              >
                <SelectTrigger id="bulk-counselor">
                  <SelectValue placeholder="Select a counselor" />
                </SelectTrigger>
                <SelectContent>
                  {counselors.length > 0 ? (
                    counselors.map((counselor) => (
                      <SelectItem
                        key={counselor.id}
                        value={counselor.id.toString()}
                        disabled={!counselor.canAssignMore}
                      >
                        {counselor.name || counselor.email} 
                        {counselor.canAssignMore 
                          ? ` (${counselor.activeLeadsCount}/${counselor.maxLeads} leads - ${counselor.maxLeads - counselor.activeLeadsCount} available)`
                          : ` (FULL - ${counselor.activeLeadsCount}/${counselor.maxLeads} leads)`
                        }
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-counselors" disabled>
                      No counselors available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {counselors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No counselors available. Please create counselor users first.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-count">Number of Leads to Assign</Label>
              <Input
                id="bulk-count"
                type="number"
                min="1"
                max={bulkSelectedCounselorId ? counselors.find(c => c.id === bulkSelectedCounselorId)?.maxLeads || 10 : 10}
                value={bulkAssignCount}
                onChange={(e) => setBulkAssignCount(e.target.value)}
                placeholder="Enter number of leads (e.g., 10, 20)"
              />
              {bulkSelectedCounselorId && (
                <p className="text-sm text-muted-foreground">
                  Available slots: {counselors.find(c => c.id === bulkSelectedCounselorId)?.maxLeads! - counselors.find(c => c.id === bulkSelectedCounselorId)?.activeLeadsCount! || 0}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Status to Assign</Label>
              <Select
                value={bulkAssignStatus}
                onValueChange={(value) => setBulkAssignStatus(value)}
              >
                <SelectTrigger id="bulk-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                All assigned leads will have this status
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkAssignDialogOpen(false)
                setBulkSelectedCounselorId(null)
                setBulkAssignCount("10")
                setBulkAssignStatus("new")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={!bulkSelectedCounselorId || !bulkAssignCount || !bulkAssignStatus || isBulkAssigning}
            >
              {isBulkAssigning ? "Assigning..." : "Assign Leads"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

