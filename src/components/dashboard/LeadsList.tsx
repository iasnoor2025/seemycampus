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
  const [counselorSelectOpen, setCounselorSelectOpen] = useState(false)
  const [bulkCounselorSelectOpen, setBulkCounselorSelectOpen] = useState(false)
  const [statusSelectOpen, setStatusSelectOpen] = useState(false)
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
        console.log("Fetched counselors:", data.counselors)
        setCounselors(data.counselors || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error fetching counselors - response not ok:", response.status, errorData)
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
    setCounselorSelectOpen(false)
    fetchCounselors() // Ensure counselors are loaded
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
      {/* Platform Insights Grid - High Fidelity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div className="group relative bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
            <Users className="h-24 w-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pipeline</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{stats.total}</span>
              <span className="text-[10px] font-bold text-blue-600 mb-1.5 uppercase tracking-widest">+12%</span>
            </div>
          </div>
        </div>

        {[
          { label: "Incoming New", value: stats.new, color: "blue", icon: Clock },
          { label: "Active Contact", value: stats.contacted, color: "orange", icon: Phone },
          { label: "High Qualified", value: stats.qualified, color: "emerald", icon: CheckCircle },
          { label: "Successfully Converted", value: stats.converted, color: "indigo", icon: GraduationCap }
        ].map((item) => (
          <div key={item.label} className="group relative bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000 text-${item.color}-600`}>
              <item.icon className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <span className="text-3xl font-black text-slate-800 tracking-tight">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {/* Strategic Intelligence Header - Single Row */}
      <div className="bg-white p-3 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-slate-100/50 mb-8">
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
              <Search className="h-3 w-3 text-slate-400" />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
            <SelectTrigger className="h-12 w-[160px] bg-slate-50 border-none rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest px-3 hover:bg-slate-100 transition-all flex-shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">All Pipeline</SelectItem>
              <SelectItem value="new" className="text-[10px] font-bold uppercase tracking-widest">New</SelectItem>
              <SelectItem value="contacted" className="text-[10px] font-bold uppercase tracking-widest">Contacted</SelectItem>
              <SelectItem value="qualified" className="text-[10px] font-bold uppercase tracking-widest">Qualified</SelectItem>
              <SelectItem value="converted" className="text-[10px] font-bold uppercase tracking-widest">Converted</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Assign Button */}
          {isAdmin && (
            <Button
              onClick={() => {
                fetchCounselors()
                setBulkCounselorSelectOpen(false)
                setStatusSelectOpen(false)
                setBulkAssignDialogOpen(true)
              }}
              className="h-12 px-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[1.5rem] transition-all duration-500 shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2 group whitespace-nowrap flex-shrink-0"
            >
              <Users className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Assign</span>
            </Button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="py-6 pl-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Lead Identity</TableHead>
                <TableHead className="py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Channels</TableHead>
                <TableHead className="py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Source Origin</TableHead>
                {isAdmin && <TableHead className="py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Asset Manager</TableHead>}
                <TableHead className="py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Lifecycle Stage</TableHead>
                <TableHead className="py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Timeframe</TableHead>
                <TableHead className="py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right pr-10">Intelligence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="group/row hover:bg-slate-50/80 transition-all duration-300 border-slate-50">
                  <TableCell className="py-5 pl-10 font-medium">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover/row:scale-110 transition-transform duration-500">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover/row:text-blue-600 transition-colors">
                          {lead.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: SMX-{lead.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 group-hover/row:translate-x-1 transition-transform">
                        <div className="p-1 rounded bg-slate-100"><Mail className="h-2.5 w-2.5" /></div>
                        <a href={`mailto:${lead.email}`} className="hover:text-blue-600 truncate max-w-[150px]">
                          {lead.email}
                        </a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 group-hover/row:translate-x-1 transition-transform">
                          <div className="p-1 rounded bg-slate-100"><Phone className="h-2.5 w-2.5" /></div>
                          <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{lead.source || "Unknown"}</span>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="py-5">
                      {lead.counselor ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600 border border-indigo-100 uppercase tracking-widest">
                            {lead.counselor.name?.slice(0, 2) || "NA"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{lead.counselor.name || "N/A"}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{lead.counselor.email.split('@')[0]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 opacity-60">
                          <UserPlus className="h-3 w-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Vacant</span>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${getStatusColor(lead.status).split(' ')[0]}`}>
                        {getStatusIcon(lead.status)}
                      </div>
                      <Select
                        value={lead.status || "new"}
                        onValueChange={(value) => value && handleStatusUpdate(lead.id, value)}
                      >
                        <SelectTrigger className={`w-[120px] h-9 border-none rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new" className="text-[9px] font-bold uppercase tracking-widest">New Intake</SelectItem>
                          <SelectItem value="contacted" className="text-[9px] font-bold uppercase tracking-widest">Contacted</SelectItem>
                          <SelectItem value="qualified" className="text-[9px] font-bold uppercase tracking-widest">Qualified</SelectItem>
                          <SelectItem value="converted" className="text-[9px] font-bold uppercase tracking-widest">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(lead.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 pr-10">
                    <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover/row:opacity-100 transition-all duration-300">
                      {(lead.quizData || lead.source === "form") && (
                        <Dialog open={dialogOpen && selectedLead?.id === lead.id} onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) setSelectedLead(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              onClick={() => {
                                setSelectedLead(lead)
                                setDialogOpen(true)
                              }}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-transparent border-none shadow-none">
                            <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/20 h-full overflow-y-auto">
                              <div className="p-10">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8">Intelligence Dossier</h2>
                                <div className="space-y-8 mt-4">
                                  {/* Redesigned content inside Dossier */}
                                  <div className="grid grid-cols-2 gap-8">
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Identity Signature</p>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <User className="h-4 w-4 text-slate-900" />
                                          <span className="text-xs font-black uppercase tracking-tight">{lead.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <Mail className="h-4 w-4 text-slate-400" />
                                          <span className="text-xs font-bold text-slate-600">{lead.email}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Telemetry Data</p>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <Calendar className="h-4 w-4 text-slate-400" />
                                          <span className="text-xs font-bold text-slate-600">{new Date(lead.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className={`w-2 h-2 rounded-full ${getStatusColor(lead.status).split(' ')[0]}`} />
                                          <span className="text-[9px] font-black uppercase tracking-widest">{lead.status || "new"} Stage</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-10 flex justify-end">
                                  <Button onClick={() => setDialogOpen(false)} className="rounded-2xl bg-slate-900 hover:bg-blue-600 px-8">Close Dossier</Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                          onClick={() => handleAssignClick(lead)}
                          title="Assign to Counselor"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          onClick={() => handleDeleteClick(lead)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead to Counselor</DialogTitle>
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
              {counselors.length > 0 && (
                <p className="text-xs text-muted-foreground mb-1">
                  {counselors.length} counselor(s) available
                </p>
              )}
              <Select
                value={selectedCounselorId?.toString() || ""}
                open={counselorSelectOpen}
                onOpenChange={setCounselorSelectOpen}
                onValueChange={(value) => {
                  console.log("Counselor onValueChange:", value)
                  if (value) {
                    setSelectedCounselorId(parseInt(value))
                    setCounselorSelectOpen(false)
                  }
                }}
              >
                <SelectTrigger id="counselor">
                  <SelectValue placeholder="Select a counselor" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false)
                setLeadToAssign(null)
                setSelectedCounselorId(null)
                setCounselorSelectOpen(false)
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
        <DialogContent>
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
                open={bulkCounselorSelectOpen}
                onOpenChange={setBulkCounselorSelectOpen}
                onValueChange={(value) => {
                  console.log("Bulk Counselor onValueChange:", value)
                  if (value) {
                    setBulkSelectedCounselorId(parseInt(value))
                    setBulkCounselorSelectOpen(false)
                  }
                }}
              >
                <SelectTrigger id="bulk-counselor">
                  <SelectValue placeholder="Select a counselor" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
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
                value={bulkAssignCount}
                onChange={(e) => setBulkAssignCount(e.target.value)}
                placeholder="Enter number of leads (e.g., 1, 10, 100, 1000)"
              />
              {bulkSelectedCounselorId && (
                <p className="text-sm text-muted-foreground">
                  Available slots for this counselor: {counselors.find(c => c.id === bulkSelectedCounselorId)?.maxLeads! - counselors.find(c => c.id === bulkSelectedCounselorId)?.activeLeadsCount! || 0}.
                  System will assign up to available slots or available unassigned leads, whichever is lower.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Status to Assign</Label>
              <Select
                value={bulkAssignStatus}
                open={statusSelectOpen}
                onOpenChange={setStatusSelectOpen}
                onValueChange={(value) => {
                  console.log("Status onValueChange:", value)
                  if (value) {
                    setBulkAssignStatus(value)
                    setStatusSelectOpen(false)
                  }
                }}
              >
                <SelectTrigger id="bulk-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="new"
                    onSelect={() => console.log("Status selected: new")}
                  >
                    New
                  </SelectItem>
                  <SelectItem
                    value="contacted"
                    onSelect={() => console.log("Status selected: contacted")}
                  >
                    Contacted
                  </SelectItem>
                  <SelectItem
                    value="qualified"
                    onSelect={() => console.log("Status selected: qualified")}
                  >
                    Qualified
                  </SelectItem>
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
                setBulkCounselorSelectOpen(false)
                setStatusSelectOpen(false)
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

