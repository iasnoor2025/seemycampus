"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, RefreshCw, Search, User } from "lucide-react"
import { format } from "date-fns"

interface AttendanceRecord {
  id: number
  employeeId: number
  employeeName: string
  employeeEmail: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: string
  syncedToSheets: boolean
  createdAt: string
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/attendance/records")
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
      } else {
        console.error("Failed to load attendance records")
      }
    } catch (error) {
      console.error("Error loading attendance records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = dateFilter === "" || record.date === dateFilter
    return matchesSearch && matchesDate
  })

  const formatTime = (time: string | null) => {
    if (!time) return "--"
    return time.substring(0, 5) // HH:mm format
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const exportToCSV = () => {
    const headers = ["Date", "Employee Name", "Email", "Check-In", "Check-Out", "Status", "Synced"]
    const rows = filteredRecords.map((record) => [
      formatDate(record.date),
      record.employeeName,
      record.employeeEmail,
      formatTime(record.checkInTime),
      formatTime(record.checkOutTime),
      record.status,
      record.syncedToSheets ? "Yes" : "No",
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
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Synced</TableHead>
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
                        {record.checkInTime ? (
                          <Badge variant="outline" className="bg-green-50">
                            {formatTime(record.checkInTime)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.checkOutTime ? (
                          <Badge variant="outline" className="bg-blue-50">
                            {formatTime(record.checkOutTime)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
