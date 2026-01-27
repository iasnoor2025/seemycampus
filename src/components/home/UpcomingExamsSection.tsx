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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-slate-500 font-bold animate-pulse">Scanning important dates...</p>
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {exams.map((exam, index) => {
              const examDate = exam.examDate ? new Date(exam.examDate) : null
              const regStart = exam.registrationStartDate ? new Date(exam.registrationStartDate) : null
              const regEnd = exam.registrationEndDate ? new Date(exam.registrationEndDate) : null
              const now = new Date()

              const isRegOpen = regStart && regEnd && now >= regStart && now <= regEnd
              const isRegUpcoming = regStart && now < regStart

              return (
                <Link key={exam.id} href={`/entrance-exams/${exam.slug}`}>
                  <Card className="h-full hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)] transition-all duration-500 transform hover:-translate-y-3 border-slate-100 bg-white/70 backdrop-blur-md group relative overflow-hidden rounded-3xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-x-4 -translate-y-4 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Calendar className="w-6 h-6" />
                        </div>
                        {isRegOpen && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-extrabold rounded-full uppercase tracking-wider animate-pulse">
                            Active
                          </span>
                        )}
                        {isRegUpcoming && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-extrabold rounded-full uppercase tracking-wider">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 mb-4 line-clamp-2">
                        {exam.name}
                      </h3>

                      <div className="space-y-4 mb-8">
                        {examDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                              <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{format(examDate, "MMM")}</span>
                              <span className="text-sm font-extrabold leading-none">{format(examDate, "dd")}</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Date</p>
                              <p className="text-sm font-extrabold text-slate-700">{format(examDate, "MMMM dd, yyyy")}</p>
                            </div>
                          </div>
                        )}

                        {regStart && regEnd && (
                          <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl group-hover:bg-white transition-colors">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration Window</p>
                              <p className="text-sm font-bold text-slate-600">
                                {format(regStart, "MMM dd")} - {format(regEnd, "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-blue-600 font-extrabold text-sm group-hover:gap-4 transition-all duration-300">
                        <span>Details & Application</span>
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300" />
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

