"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Inquiry {
  id: number
  collegeId: number
  studentId: number | null
  inquiryType: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  response: string | null
  respondedBy: number | null
  respondedAt: string | null
  createdAt: string
  college?: {
    name: string
    slug: string
  }
}

interface College {
  id: number
  name: string
  slug: string
}

export function InquiryManagement() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollege, setSelectedCollege] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [responseText, setResponseText] = useState("")
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    fetchColleges()
    fetchAllInquiries()
  }, [])

  useEffect(() => {
    fetchAllInquiries()
  }, [selectedCollege, statusFilter, typeFilter])

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

  const fetchAllInquiries = async () => {
    try {
      setLoading(true)
      let allInquiries: Inquiry[] = []

      if (selectedCollege === "all") {
        // Fetch from all colleges
        for (const college of colleges) {
          const params = new URLSearchParams()
          if (statusFilter !== "all") params.set("status", statusFilter)
          if (typeFilter !== "all") params.set("inquiryType", typeFilter)

          const response = await fetch(`/api/colleges/${college.slug}/inquiries?${params.toString()}`)
          if (response.ok) {
            const data = await response.json()
            const collegeInquiries = (data.inquiries || []).map((item: any) => ({
              ...item.inquiry,
              college: { name: college.name, slug: college.slug },
            }))
            allInquiries = [...allInquiries, ...collegeInquiries]
          }
        }
      } else {
        const college = colleges.find((c) => c.id.toString() === selectedCollege)
        if (college) {
          const params = new URLSearchParams()
          if (statusFilter !== "all") params.set("status", statusFilter)
          if (typeFilter !== "all") params.set("inquiryType", typeFilter)

          const response = await fetch(`/api/colleges/${college.slug}/inquiries?${params.toString()}`)
          if (response.ok) {
            const data = await response.json()
            allInquiries = (data.inquiries || []).map((item: any) => ({
              ...item.inquiry,
              college: { name: college.name, slug: college.slug },
            }))
          }
        }
      }

      setInquiries(allInquiries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedInquiry || !responseText.trim()) return

    setResponding(true)
    try {
      const response = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "responded",
          response: responseText,
        }),
      })

      if (response.ok) {
        fetchAllInquiries()
        setSelectedInquiry(null)
        setResponseText("")
      }
    } catch (error) {
      console.error("Error responding to inquiry:", error)
    } finally {
      setResponding(false)
    }
  }

  const handleStatusChange = async (inquiryId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchAllInquiries()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      responded: { variant: "default", icon: CheckCircle2, label: "Responded" },
      resolved: { variant: "default", icon: CheckCircle2, label: "Resolved" },
      closed: { variant: "outline", icon: XCircle, label: "Closed" },
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = !searchQuery ||
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.college?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">College Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to student inquiries
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedCollege} onValueChange={(value) => setSelectedCollege(value ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No inquiries found matching your search" : "No inquiries yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                          {getStatusBadge(inquiry.status)}
                          <Badge variant="outline">{inquiry.inquiryType}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Email: {inquiry.email}</div>
                          {inquiry.phone && <div>Phone: {inquiry.phone}</div>}
                          {inquiry.college && <div>College: {inquiry.college.name}</div>}
                          <div>Submitted: {new Date(inquiry.createdAt).toLocaleString()}</div>
                          {inquiry.respondedAt && (
                            <div>Responded: {new Date(inquiry.respondedAt).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInquiry(inquiry)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {inquiry.response ? "View/Edit Response" : "Respond"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Inquiry Details</DialogTitle>
                              <DialogDescription>
                                From {inquiry.name} ({inquiry.email})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Message</Label>
                                <div className="mt-1 p-3 bg-gray-50 rounded border">
                                  {inquiry.message}
                                </div>
                              </div>
                              {inquiry.response && (
                                <div>
                                  <Label>Previous Response</Label>
                                  <div className="mt-1 p-3 bg-blue-50 rounded border">
                                    {inquiry.response}
                                  </div>
                                </div>
                              )}
                              <div>
                                <Label htmlFor="response">Response</Label>
                                <Textarea
                                  id="response"
                                  value={responseText || inquiry.response || ""}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  rows={6}
                                  placeholder="Enter your response..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleRespond}
                                  disabled={responding || !responseText.trim()}
                                >
                                  {responding ? "Saving..." : "Save Response"}
                                </Button>
                                <Select
                                  value={inquiry.status}
                                  onValueChange={(value) => {
                                    if (value) {
                                      handleStatusChange(inquiry.id, value)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="responded">Responded</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

