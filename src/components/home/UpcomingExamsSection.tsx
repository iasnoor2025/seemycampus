"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"

interface EntranceExam {
  id: number
  name: string
  slug: string
  examDate: string | null
  registrationStartDate: string | null
  registrationEndDate: string | null
}

export function UpcomingExamsSection() {
  const [exams, setExams] = useState<EntranceExam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await fetch("/api/entrance-exams")
        if (response.ok) {
          const data = await response.json()
          
          // Handle both array and object with exams property
          const examsList = Array.isArray(data) ? data : (data.exams || [])
          
          if (examsList.length > 0) {
            const now = new Date()
            const oneYearLater = new Date()
            oneYearLater.setFullYear(now.getFullYear() + 1)
            
            // Get upcoming exams - prioritize exams with dates, but also include exams without dates
            let upcoming = examsList
              .filter((exam: EntranceExam) => {
                // Include exams with dates in the future (up to 1 year)
                if (exam.examDate) {
                  try {
                    const examDate = new Date(exam.examDate)
                    return examDate >= now && examDate <= oneYearLater
                  } catch {
                    return true // Include if date parsing fails
                  }
                }
                // Also include exams without dates (they might be TBD)
                return true
              })
              .sort((a: EntranceExam, b: EntranceExam) => {
                // Sort by exam date if available, otherwise by name
                if (a.examDate && b.examDate) {
                  try {
                    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
                  } catch {
                    return 0
                  }
                }
                if (a.examDate) return -1
                if (b.examDate) return 1
                return a.name.localeCompare(b.name)
              })
              .slice(0, 6)
            
            // If no upcoming exams with dates, show any exams (up to 6)
            if (upcoming.length === 0 && examsList.length > 0) {
              upcoming = examsList.slice(0, 6)
            }
            
            setExams(upcoming)
          }
        }
      } catch (error) {
        console.error("Error fetching exams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Calendar className="w-5 h-5" />
            <span className="font-medium text-sm">Important Dates</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
            Upcoming Entrance Exams
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Stay ahead with important exam dates and registration deadlines
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading exams...</p>
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {exams.map((exam) => {
            const examDate = exam.examDate ? new Date(exam.examDate) : null
            const regStart = exam.registrationStartDate ? new Date(exam.registrationStartDate) : null
            const regEnd = exam.registrationEndDate ? new Date(exam.registrationEndDate) : null
            const now = new Date()
            
            const isRegOpen = regStart && regEnd && now >= regStart && now <= regEnd
            const isRegUpcoming = regStart && now < regStart

            return (
              <Link key={exam.id} href={`/entrance-exams/${exam.slug}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 bg-white group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                        {exam.name}
                      </h3>
                      {isRegOpen && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Open
                        </span>
                      )}
                      {isRegUpcoming && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                    
                    {examDate && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {format(examDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}
                    
                    {regStart && regEnd && (
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                        <Clock className="w-3 h-3" />
                        <span>
                          Reg: {format(regStart, "MMM dd")} - {format(regEnd, "MMM dd")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No upcoming exams found. Check back soon for updates!</p>
          </div>
        )}

        <div className="text-center">
          <Link href="/entrance-exams">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              View All Exams
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

