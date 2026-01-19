"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, RefreshCw, Search, User, Trash2 } from "lucide-react"
import { useDebounce } from "@/lib/hooks/useDebounce"
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

interface AttendanceRecord {
  id: number
  employeeId: number
  employeeName: string
  employeeEmail: string
  employeeEmployeeId?: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: string
  checkInStatus: string | null
  checkOutStatus: string | null
  syncedToSheets: boolean
  createdAt: string
  updatedAt: string
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [syncingSheets, setSyncingSheets] = useState(false)
  
  // Debounce search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch("/api/attendance/records", {
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Loaded attendance records:", data.records?.length || 0)
        setRecords(data.records || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to load attendance records:", response.status, errorData)
        // Show error to user (using console for now, can add toast notification)
        if (errorData.error) {
          console.error("Error:", errorData.error)
        }
      }
    } catch (error: any) {
      console.error("Error loading attendance records:", error)
      if (error.name === 'AbortError') {
        console.error("Request timeout. Please check your connection and try again.")
      } else {
        console.error("Failed to load attendance records. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Use debounced search term for filtering
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      debouncedSearchTerm === "" ||
      record.employeeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.employeeEmail.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesDate = dateFilter === "" || record.date === dateFilter
    return matchesSearch && matchesDate
  })

  const formatTime = (time: string | null) => {
    if (!time) return "--"
    return time.substring(0, 5) // HH:mm format
  }

  const calculateTotalHours = (checkInTime: string | null, checkOutTime: string | null): string => {
    if (!checkInTime || !checkOutTime) return "--"
    
    try {
      const [inHours, inMinutes] = checkInTime.split(':').map(Number)
      const [outHours, outMinutes] = checkOutTime.split(':').map(Number)
      
      const checkInMinutes = inHours * 60 + inMinutes
      const checkOutMinutes = outHours * 60 + outMinutes
      
      // Handle case where check-out is next day (e.g., night shift)
      let diffMinutes = checkOutMinutes - checkInMinutes
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60 // Add 24 hours
      }
      
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      return `${hours}h ${minutes}m`
    } catch {
      return "--"
    }
  }

  const getStatusBadge = (status: string | null, type: 'check-in' | 'check-out') => {
    if (!status) return null
    
    const isCheckOut = type === 'check-out'
    const isEarly = status === 'early'
    const isLate = status === 'late'
    const isOnTime = status === 'on-time'
    
    let bgColor: string
    let textColor: string
    let label: string
    
    if (isEarly) {
      if (isCheckOut) {
        // Left Early = Red (bad)
        bgColor = 'bg-red-100'
        textColor = 'text-red-700'
        label = 'Left Early'
      } else {
        // Checked In Early = Green (good)
        bgColor = 'bg-green-100'
        textColor = 'text-green-700'
        label = 'Early'
      }
    } else if (isLate) {
      bgColor = 'bg-orange-100'
      textColor = 'text-orange-700'
      label = isCheckOut ? 'Left Late' : 'Late'
    } else if (isOnTime) {
      bgColor = 'bg-blue-100'
      textColor = 'text-blue-700'
      label = 'On Time'
    } else {
      return null
    }
    
    return (
      <Badge variant="outline" className={`${bgColor} ${textColor} text-xs ml-1`}>
        {label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const handleDeleteClick = (record: AttendanceRecord) => {
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/attendance/records/${recordToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the record from the list
        setRecords(records.filter((r) => r.id !== recordToDelete.id))
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to delete attendance record:", errorData)
        alert(errorData.error || "Failed to delete attendance record")
      }
    } catch (error) {
      console.error("Error deleting attendance record:", error)
      alert("Error deleting attendance record")
    } finally {
      setDeleting(false)
    }
  }

  const handleSyncSheets = async () => {
    try {
      setSyncingSheets(true)
      const response = await fetch("/api/attendance/sync-sheets", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        alert(`Successfully synced ${data.syncedCount} records to Google Sheets${data.failedCount > 0 ? `\n${data.failedCount} records failed to sync` : ""}`)
        loadRecords() // Refresh to update sync status
      } else {
        alert(`Failed to sync: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error syncing to Google Sheets:", error)
      alert("Error syncing to Google Sheets. Please try again.")
    } finally {
      setSyncingSheets(false)
    }
  }

  const exportToCSV = () => {
    const headers = ["Date", "Employee Name", "Email", "Employee ID", "Check-In", "Check-In Status", "Check-Out", "Check-Out Status", "Total Hours", "Status", "Synced", "Created At"]
    const rows = filteredRecords.map((record) => [
      record.date, // Use original date format
      record.employeeName,
      record.employeeEmail,
      record.employeeEmployeeId || String(record.employeeId),
      record.checkInTime || "--",
      record.checkInStatus || "--",
      record.checkOutTime || "--",
      record.checkOutStatus || "--",
      calculateTotalHours(record.checkInTime, record.checkOutTime),
      record.status,
      record.syncedToSheets ? "Yes" : "No",
      record.createdAt,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Records</h1>
          <p className="text-muted-foreground mt-1">
            View and manage employee attendance records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRecords} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleSyncSheets} variant="outline" disabled={syncingSheets}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncingSheets ? "animate-spin" : ""}`} />
            {syncingSheets ? "Syncing..." : "Sync to Sheets"}
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Records ({filteredRecords.length})
          </CardTitle>
          <CardDescription>
            {filteredRecords.length === records.length
              ? "All attendance records"
              : `Showing ${filteredRecords.length} of ${records.length} records`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {records.length === 0
                  ? "No attendance records found"
                  : "No records match your filters"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Synced</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.employeeEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {record.employeeEmployeeId || `ID: ${record.employeeId}`}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {record.checkInTime ? (
                            <Badge variant="outline" className="bg-green-50">
                              {formatTime(record.checkInTime)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                          {getStatusBadge(record.checkInStatus, 'check-in')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {record.checkOutTime ? (
                            <Badge variant="outline" className="bg-blue-50">
                              {formatTime(record.checkOutTime)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                          {getStatusBadge(record.checkOutStatus, 'check-out')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {calculateTotalHours(record.checkInTime, record.checkOutTime)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "present" ? "default" : "secondary"
                          }
                          className={
                            record.status === "present"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {record.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.syncedToSheets ? (
                          <Badge variant="outline" className="bg-green-50">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(record.createdAt), "MMM dd, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(record)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
              {recordToDelete && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="text-sm">
                    <strong>Date:</strong> {formatDate(recordToDelete.date)}
                  </div>
                  <div className="text-sm">
                    <strong>Employee:</strong> {recordToDelete.employeeName} ({recordToDelete.employeeEmail})
                  </div>
                  <div className="text-sm">
                    <strong>Check-In:</strong> {formatTime(recordToDelete.checkInTime)} | <strong>Check-Out:</strong> {formatTime(recordToDelete.checkOutTime)}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
