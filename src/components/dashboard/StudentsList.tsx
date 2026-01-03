"use client"

import { useState, useEffect } from "react"
import { Users, Calendar, MapPin, GraduationCap, Search, Trash2 } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StudentAnswer {
  id: number
  interests: string[]
  preferredLocation: string | null
  budgetMin: number | null
  budgetMax: number | null
  budgetCurrency: string | null
  studyMode: string | null
  academicLevel: string | null
  createdAt: Date | string
}

export function StudentsList() {
  const [students, setStudents] = useState<StudentAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<StudentAnswer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      student.preferredLocation?.toLowerCase().includes(searchLower) ||
      student.studyMode?.toLowerCase().includes(searchLower) ||
      student.academicLevel?.toLowerCase().includes(searchLower) ||
      student.interests.some((interest) => interest.toLowerCase().includes(searchLower))
    )
  })

  const handleDeleteClick = (student: StudentAnswer) => {
    setStudentToDelete(student)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/dashboard/students/${studentToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the deleted student from the list
        setStudents(students.filter((s) => s.id !== studentToDelete.id))
        setDeleteDialogOpen(false)
        setStudentToDelete(null)
      } else {
        const error = await response.json()
        console.error("Error deleting student:", error)
        alert("Failed to delete student response")
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      alert("Failed to delete student response")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading students...</div>
      </div>
    )
  }

  return (
    <>
      {/* Stats Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Total Quiz Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{students.length}</div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, study mode, interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interests</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Study Mode</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                      {student.interests.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{student.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{student.preferredLocation || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.budgetMin && student.budgetMax ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-muted-foreground">₹</span>
                        <span>
                          {student.budgetCurrency || "INR"}{" "}
                          {student.budgetMin.toLocaleString()} -{" "}
                          {student.budgetMax.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{student.studyMode || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{student.academicLevel || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(student)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No students found</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student Response</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student quiz response? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {studentToDelete && (
            <div className="py-4">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Interests:</span>{" "}
                  {studentToDelete.interests.join(", ")}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {studentToDelete.preferredLocation || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Level:</span>{" "}
                  {studentToDelete.academicLevel || "N/A"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setStudentToDelete(null)
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

