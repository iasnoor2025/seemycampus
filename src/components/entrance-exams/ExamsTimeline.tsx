"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { EntranceExamCard } from "./EntranceExamCard"
import { Loader2, Search, Calendar as CalendarIcon, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface EntranceExam {
  id: number
  name: string
  slug: string
  description: string | null
  examDate: string | null
  registrationStartDate: string | null
  registrationEndDate: string | null
  officialWebsite: string | null
  examPattern: string | null
}

export function ExamsTimeline() {
  const [exams, setExams] = useState<EntranceExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await fetch("/api/entrance-exams")
        if (!response.ok) throw new Error("Failed to fetch exams")
        const data = await response.json()
        setExams(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  const filteredExams = exams.filter(exam => 
    exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading admission timeline...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-semibold">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-xl border shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search entrance exams..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="flex-1 md:flex-none gap-2">
            <CalendarIcon className="h-4 w-4" />
            All Dates
          </Button>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No entrance exams found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <EntranceExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}

      {/* Timeline Section (Visual enhancement) */}
      <div className="mt-12 bg-[#18254a] text-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <CalendarIcon className="h-6 w-6" />
          Quick Timeline Overview 2024-25
        </h2>
        <div className="relative space-y-8 before:absolute before:left-2 md:before:left-1/2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-400/30">
          {exams.slice(0, 5).map((exam, index) => (
            <div key={exam.id} className={`relative flex items-center justify-between md:justify-normal ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
              <div className="hidden md:block w-1/2" />
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#18254a] z-10" />
              <div className={`w-full md:w-1/2 pl-8 md:pl-0 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                  <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">
                    {exam.examDate ? format(new Date(exam.examDate), "MMMM yyyy") : "Date TBD"}
                  </span>
                  <h3 className="font-bold text-lg">{exam.name}</h3>
                  <p className="text-sm text-gray-300 line-clamp-1">{exam.slug.toUpperCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

