"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, XCircle, Loader2, Edit2, MoreVertical, Eye, Trash2, AlertTriangle, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  USER_ROLES,
  ROLE_DISPLAY_NAMES,
  ASSIGNABLE_ROLES,
  isAutoApproved,
  type UserRole,
} from "@/lib/roles"

interface User {
  id: number
  name: string | null
  email: string
  role: string | null
  isApproved: boolean | null
  createdAt: string
  updatedAt: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [editingRole, setEditingRole] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: USER_ROLES.STUDENT as UserRole,
    isApproved: false,
  })
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleApprove = async (userId: number, isApproved: boolean) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/users/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, isApproved }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update user")
      }

      toast({
        title: "Success",
        description: `User ${isApproved ? "approved" : "rejected"} successfully`,
      })

      // Refresh users list
      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/users/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update user role")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: `User role updated to ${ROLE_DISPLAY_NAMES[newRole]}`,
      })

      // Refresh users list
      await fetchUsers()
      setEditingRole(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setUpdating(userToDelete.id)
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "Success",
        description: `User ${userToDelete.name || userToDelete.email} deleted successfully`,
      })

      // Refresh users list
      await fetchUsers()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (newUser.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          isApproved: newUser.isApproved,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast({
        title: "Success",
        description: `User ${newUser.name} created successfully`,
      })

      // Reset form
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: USER_ROLES.STUDENT,
        isApproved: false,
      })
      setCreateDialogOpen(false)

      // Refresh users list
      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "default"
      case USER_ROLES.MODERATOR:
        return "default"
      case USER_ROLES.STAFF:
        return "secondary"
      case USER_ROLES.COUNSELOR:
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const pendingUsers = users.filter(
    (u) => !u.isApproved && !isAutoApproved(u.role as UserRole)
  )

  return (
    <div className="space-y-6">
      {/* Create User Button */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} modal={true}>
        <DialogContent 
          className="sm:max-w-[500px] [&>*]:overflow-visible" 
          style={{ overflow: 'visible' }}
          onInteractOutside={(e) => {
            // Don't close dialog when clicking on Select dropdown
            const target = e.target as HTMLElement
            if (target.closest('[data-slot="select-content"]') || 
                target.closest('[data-baseui-select-popup]') ||
                target.closest('[data-baseui-select-positioner]')) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will be able to sign in with the provided credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-visible">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter user's full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 8 characters)"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => {
                  const role = value as UserRole
                  setNewUser({
                    ...newUser,
                    role,
                    // Auto-approve if role is auto-approved
                    isApproved: isAutoApproved(role) ? true : newUser.isApproved,
                  })
                }}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_DISPLAY_NAMES[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isAutoApproved(newUser.role) && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isApproved"
                  checked={newUser.isApproved}
                  onCheckedChange={(checked) =>
                    setNewUser({ ...newUser, isApproved: checked === true })
                  }
                />
                <Label
                  htmlFor="isApproved"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Approve user immediately
                </Label>
              </div>
            )}
            {isAutoApproved(newUser.role) && (
              <p className="text-sm text-muted-foreground">
                This role is automatically approved
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setNewUser({
                  name: "",
                  email: "",
                  password: "",
                  role: USER_ROLES.STUDENT,
                  isApproved: false,
                })
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Pending Approvals ({pendingUsers.length})
          </h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingRole === user.id ? (
                        <Select
                          value={user.role || USER_ROLES.STUDENT}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value as UserRole)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSIGNABLE_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_DISPLAY_NAMES[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {ROLE_DISPLAY_NAMES[(user.role as UserRole) || USER_ROLES.STUDENT]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-yellow-600">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={updating === user.id}
                            asChild
                          >
                            {updating === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleApprove(user.id, true)}
                            disabled={updating === user.id}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleApprove(user.id, false)}
                            disabled={updating === user.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingRole(user.id)}
                            disabled={updating === user.id}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          {user.role !== USER_ROLES.ADMIN && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(user)}
                                disabled={updating === user.id}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* All Users */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          All Users ({users.length})
        </h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {editingRole === user.id ? (
                      <Select
                        value={user.role || USER_ROLES.STUDENT}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as UserRole)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_DISPLAY_NAMES[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {ROLE_DISPLAY_NAMES[(user.role as UserRole) || USER_ROLES.STUDENT]}
                        </Badge>
                        {user.role !== USER_ROLES.ADMIN && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => setEditingRole(user.id)}
                            disabled={updating === user.id}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAutoApproved((user.role as UserRole) || USER_ROLES.STUDENT) ? (
                      <Badge variant="default">Auto-Approved</Badge>
                    ) : user.isApproved ? (
                      <Badge variant="default" className="text-green-600">
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={updating === user.id}
                          asChild
                        >
                          {updating === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!isAutoApproved((user.role as UserRole) || USER_ROLES.STUDENT) && (
                          <>
                            {!user.isApproved ? (
                              <DropdownMenuItem
                                onClick={() => handleApprove(user.id, true)}
                                disabled={updating === user.id}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleApprove(user.id, false)}
                                disabled={updating === user.id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Revoke Approval
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {user.role !== USER_ROLES.ADMIN && (
                          <DropdownMenuItem
                            onClick={() => setEditingRole(user.id)}
                            disabled={updating === user.id || editingRole === user.id}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            // View user details - can be implemented later
                            toast({
                              title: "User Details",
                              description: `Viewing details for ${user.name || user.email}`,
                            })
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {user.role !== USER_ROLES.ADMIN && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(user)}
                              disabled={updating === user.id}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

