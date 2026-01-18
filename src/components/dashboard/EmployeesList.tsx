"use client"

import { useState, useEffect } from "react"
import { Users, Search, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

interface Employee {
  id: number
  name: string
  employeeId: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    isActive: true,
  })

  useEffect(() => {
    fetchEmployees()
  }, [isActiveFilter])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (isActiveFilter !== null) params.append("isActive", String(isActiveFilter))

      const response = await fetch(`/api/employees?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setEmployees(data.employees)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch employees",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchEmployees()
  }

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.temporaryPassword
            ? `Employee created. Temporary password: ${data.temporaryPassword}`
            : "Employee created successfully",
        })
        setCreateDialogOpen(false)
        setFormData({ name: "", employeeId: "", email: "", password: "" })
        fetchEmployees()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create employee",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedEmployee) return

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Employee updated successfully",
        })
        setEditDialogOpen(false)
        setSelectedEmployee(null)
        fetchEmployees()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update employee",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedEmployee) return

    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Employee deleted successfully",
        })
        setDeleteDialogOpen(false)
        setSelectedEmployee(null)
        fetchEmployees()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete employee",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      isActive: employee.isActive,
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  const filteredEmployees = employees.filter((emp) => {
    if (isActiveFilter !== null && emp.isActive !== isActiveFilter) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant={isActiveFilter === null ? "default" : "outline"}
              onClick={() => setIsActiveFilter(null)}
            >
              All
            </Button>
            <Button
              variant={isActiveFilter === true ? "default" : "outline"}
              onClick={() => setIsActiveFilter(true)}
            >
              Active
            </Button>
            <Button
              variant={isActiveFilter === false ? "default" : "outline"}
              onClick={() => setIsActiveFilter(false)}
            >
              Inactive
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Employee</DialogTitle>
                  <DialogDescription>
                    Add a new employee to the attendance system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Employees Table */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees found
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        {employee.isActive ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editFormData.password}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, password: e.target.value })
                }
                placeholder="Leave empty to keep current password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editFormData.isActive}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {selectedEmployee?.isActive ? "deactivate" : "delete"} the employee{" "}
              {selectedEmployee?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
