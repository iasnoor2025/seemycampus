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
  const [mounted, setMounted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingGuide, setEditingGuide] = useState<ApplicationGuide | null>(null)
  const [deletingGuide, setDeletingGuide] = useState<number | null>(null)
  const [currentCollege, setCurrentCollege] = useState<College | null>(null)

  useEffect(() => {
    setMounted(true)
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
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Application Guides</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage application form guides and requirements for colleges
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingGuide(null)
            setShowForm(true)
          }} 
          disabled={!selectedCollege}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Guide
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end pb-2">
        <div className="w-full sm:w-64">
          <Select 
            value={mounted && selectedCollege ? selectedCollege : undefined} 
            onValueChange={(value) => {
              if (mounted) {
                setSelectedCollege(value || "")
              }
            }}
            disabled={!mounted || loadingColleges}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select college" />
            </SelectTrigger>
            {mounted && (
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id.toString()}>
                    {college.name}
                  </SelectItem>
                ))}
              </SelectContent>
            )}
          </Select>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={!selectedCollege}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          {loadingColleges ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !selectedCollege ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium mb-2">
                Please select a college to view application guides
              </p>
              <p className="text-muted-foreground text-sm">
                Choose a college from the dropdown above to get started
              </p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                {searchQuery ? (
                  <Search className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <Plus className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <p className="text-muted-foreground text-lg font-medium mb-2">
                {searchQuery ? "No guides found matching your search" : "No application guides yet"}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "Create your first guide to get started"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => {
                    setEditingGuide(null)
                    setShowForm(true)
                  }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Guide
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-3">
                          {guide.course?.name || "General Application Guide"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {guide.guideContent.substring(0, 150)}
                          {guide.guideContent.length > 150 && "..."}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGuide(guide)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingGuide(guide.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-4 text-sm pt-2 border-t">
                      {guide.requiredDocs.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-muted-foreground">Documents:</span>
                          <span className="font-semibold">{guide.requiredDocs.length}</span>
                        </div>
                      )}
                      {guide.feeInfo?.amount && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-muted-foreground">Fee:</span>
                          <span className="font-semibold">
                            {guide.feeInfo.currency || "₹"}{guide.feeInfo.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {guide.applicationUrl && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-muted-foreground">Application Link</span>
                        </div>
                      )}
                      {guide.contactInfo && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-muted-foreground">Contact Info</span>
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

