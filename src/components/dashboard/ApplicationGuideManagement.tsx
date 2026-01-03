"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { ApplicationGuideForm } from "./ApplicationGuideForm"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ApplicationGuide {
  id: number
  collegeId: number
  courseId: number | null
  guideContent: string
  requiredDocs: string[]
  feeInfo: any
  deadlines: any
  tips: string | null
  applicationUrl: string | null
  contactInfo: any
  course?: {
    name: string
  } | null
}

interface College {
  id: number
  name: string
  slug: string
}

export function ApplicationGuideManagement() {
  const [guides, setGuides] = useState<ApplicationGuide[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingColleges, setLoadingColleges] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollege, setSelectedCollege] = useState<string>("")
  const [showForm, setShowForm] = useState(false)
  const [editingGuide, setEditingGuide] = useState<ApplicationGuide | null>(null)
  const [deletingGuide, setDeletingGuide] = useState<number | null>(null)
  const [currentCollege, setCurrentCollege] = useState<College | null>(null)

  useEffect(() => {
    fetchColleges()
  }, [])

  useEffect(() => {
    if (selectedCollege) {
      fetchGuides()
    } else {
      setGuides([])
      setLoading(false)
    }
  }, [selectedCollege])

  const fetchColleges = async () => {
    try {
      setLoadingColleges(true)
      const response = await fetch("/api/dashboard/colleges?all=true")
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
      }
    } catch (error) {
      console.error("Error fetching colleges:", error)
    } finally {
      setLoadingColleges(false)
    }
  }

  const fetchGuides = async () => {
    if (!selectedCollege) return

    try {
      setLoading(true)
      const college = colleges.find((c) => c.id.toString() === selectedCollege)
      if (!college) return

      setCurrentCollege(college)
      const response = await fetch(`/api/colleges/${college.slug}/application-guides`)
      if (response.ok) {
        const data = await response.json()
        setGuides((data.guides || []).map((g: any) => g.guide ? { ...g.guide, course: g.course } : g))
      }
    } catch (error) {
      console.error("Error fetching guides:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingGuide) return

    try {
      const response = await fetch(`/api/application-guides/${deletingGuide}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGuides()
        setDeletingGuide(null)
      }
    } catch (error) {
      console.error("Error deleting guide:", error)
    }
  }

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch = !searchQuery || 
      guide.guideContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.course?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Guides</h1>
          <p className="text-muted-foreground mt-1">
            Manage application form guides and requirements for colleges
          </p>
        </div>
        <Button onClick={() => {
          setEditingGuide(null)
          setShowForm(true)
        }} disabled={!selectedCollege}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedCollege} onValueChange={(value) => setSelectedCollege(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id.toString()}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingColleges ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !selectedCollege ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select a college to view application guides
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No guides found matching your search" : "No application guides yet. Create one to get started."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <Card key={guide.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {guide.course?.name || "General Application Guide"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {guide.guideContent.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingGuide(guide)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingGuide(guide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {guide.requiredDocs.length > 0 && (
                        <div>
                          <span className="font-medium">Documents: </span>
                          <span>{guide.requiredDocs.length}</span>
                        </div>
                      )}
                      {guide.feeInfo?.amount && (
                        <div>
                          <span className="font-medium">Fee: </span>
                          <span>{guide.feeInfo.currency || "₹"}{guide.feeInfo.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {guide.applicationUrl && (
                        <div>
                          <span className="font-medium">Has Application Link</span>
                        </div>
                      )}
                      {guide.contactInfo && (
                        <div>
                          <span className="font-medium">Has Contact Info</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && currentCollege && (
        <ApplicationGuideForm
          guide={editingGuide || undefined}
          collegeId={currentCollege.id}
          collegeSlug={currentCollege.slug}
          onClose={() => {
            setShowForm(false)
            setEditingGuide(null)
          }}
          onSuccess={() => {
            fetchGuides()
            setShowForm(false)
            setEditingGuide(null)
          }}
        />
      )}

      <AlertDialog open={deletingGuide !== null} onOpenChange={() => setDeletingGuide(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application Guide?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application guide.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

