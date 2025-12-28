"use client"

import { useState, useEffect } from "react"
import { Heart, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CounselingPackageForm } from "./CounselingPackageForm"
import { CounselorForm } from "./CounselorForm"

interface CounselingPackage {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  duration: number
  sessions: number
  features: string[]
  displayOrder: number
  isActive: boolean
}

interface Counselor {
  id: number
  name: string
  email: string
  phone: string | null
  bio: string | null
  specialization: string[]
  qualifications: string[]
  experience: number | null
  imageUrl: string | null
  isActive: boolean
}

export function CounselingManagement() {
  const [packages, setPackages] = useState<CounselingPackage[]>([])
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPackage, setEditingPackage] = useState<CounselingPackage | null>(null)
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null)
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [showCounselorForm, setShowCounselorForm] = useState(false)

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/counseling/packages?active=false")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    }
  }

  const fetchCounselors = async () => {
    try {
      const response = await fetch("/api/counseling/counselors?active=false")
      if (response.ok) {
        const data = await response.json()
        setCounselors(data.counselors || [])
      }
    } catch (error) {
      console.error("Error fetching counselors:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
    fetchCounselors()
  }, [])

  const handleDeletePackage = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await fetch(`/api/counseling/packages/${slug}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPackages()
      }
    } catch (error) {
      console.error("Error deleting package:", error)
    }
  }

  const handleDeleteCounselor = async (id: number) => {
    if (!confirm("Are you sure you want to delete this counselor?")) return

    try {
      const response = await fetch(`/api/counseling/counselors/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCounselors()
      }
    } catch (error) {
      console.error("Error deleting counselor:", error)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Counseling Management</h1>
        <p className="text-muted-foreground">Manage counseling packages and counselors</p>
      </div>

      {showPackageForm && (
        <CounselingPackageForm
          packageData={editingPackage}
          onClose={() => {
            setShowPackageForm(false)
            setEditingPackage(null)
            fetchPackages()
          }}
        />
      )}

      {showCounselorForm && (
        <CounselorForm
          counselor={editingCounselor}
          onClose={() => {
            setShowCounselorForm(false)
            setEditingCounselor(null)
            fetchCounselors()
          }}
        />
      )}

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="counselors">Counselors</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Counseling Packages ({packages.length})</CardTitle>
              <Button onClick={() => setShowPackageForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Package
              </Button>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No packages found. Create your first package!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.name}</TableCell>
                        <TableCell>{formatPrice(pkg.price, pkg.currency)}</TableCell>
                        <TableCell>{pkg.duration} min</TableCell>
                        <TableCell>{pkg.sessions}</TableCell>
                        <TableCell>
                          {pkg.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPackage(pkg)
                                setShowPackageForm(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePackage(pkg.slug)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counselors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Counselors ({counselors.length})</CardTitle>
              <Button onClick={() => setShowCounselorForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Counselor
              </Button>
            </CardHeader>
            <CardContent>
              {counselors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No counselors found. Add your first counselor!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {counselors.map((counselor) => (
                      <TableRow key={counselor.id}>
                        <TableCell className="font-medium">{counselor.name}</TableCell>
                        <TableCell>{counselor.email}</TableCell>
                        <TableCell>
                          {counselor.specialization && counselor.specialization.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {counselor.specialization.slice(0, 2).map((spec, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {counselor.specialization.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{counselor.specialization.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {counselor.experience ? `${counselor.experience} years` : "—"}
                        </TableCell>
                        <TableCell>
                          {counselor.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCounselor(counselor)
                                setShowCounselorForm(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCounselor(counselor.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

