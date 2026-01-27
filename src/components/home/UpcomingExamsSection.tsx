"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

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
              .slice(0, 9) // Increased to 9 for better slider feel

            // If no upcoming exams with dates, show any exams (up to 6)
            if (upcoming.length === 0 && examsList.length > 0) {
              upcoming = examsList.slice(0, 9)
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxSlides = Math.ceil(exams.length / itemsPerView)

  useEffect(() => {
    if (scrollContainerRef.current && maxSlides > 0 && !isReady) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = maxSlides * clientWidth
      setIsReady(true)
    }
  }, [maxSlides, isReady])

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isReady) return
    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth === 0) return

    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth)
    const logicalSlideIndex = absoluteSlideIndex % maxSlides

    if (logicalSlideIndex !== currentSlide) {
      setCurrentSlide(logicalSlideIndex)
    }

    if (scrollLeft <= clientWidth * 0.5) {
      scrollContainerRef.current.scrollLeft = scrollLeft + (maxSlides * clientWidth)
    } else if (scrollLeft >= clientWidth * (maxSlides * 2 + maxSlides - 0.5)) {
      scrollContainerRef.current.scrollLeft = scrollLeft - (maxSlides * clientWidth)
    }
  }

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollTo({
      left: (index + maxSlides) * scrollContainerRef.current.clientWidth,
      behavior: "smooth"
    })
  }

  const goToPrevious = () => {
    const prevSlide = (currentSlide - 1 + maxSlides) % maxSlides
    goToSlide(prevSlide)
  }

  const goToNext = () => {
    const nextSlide = (currentSlide + 1) % maxSlides
    goToSlide(nextSlide)
  }

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
          <div className="relative group/carousel max-w-7xl mx-auto mb-16 px-4 md:px-12">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-4"
            >
              {[0, 1, 2].map((blockIndex) => (
                Array.from({ length: maxSlides }).map((_, slideIndex) => (
                  <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-6 md:gap-8">
                    {exams
                      .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                      .map((exam) => {
                        const examDate = exam.examDate ? new Date(exam.examDate) : null
                        const regStart = exam.registrationStartDate ? new Date(exam.registrationStartDate) : null
                        const regEnd = exam.registrationEndDate ? new Date(exam.registrationEndDate) : null
                        const now = new Date()

                        const isRegOpen = regStart && regEnd && now >= regStart && now <= regEnd
                        const isRegUpcoming = regStart && now < regStart

                        return (
                          <Link key={`${blockIndex}-${exam.id}`} href={`/entrance-exams/${exam.slug}`} className="flex-1 min-w-0">
                            <Card className="h-full hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)] transition-all duration-500 transform hover:-translate-y-3 border-slate-100 bg-white/70 backdrop-blur-md group relative overflow-hidden rounded-3xl">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-x-4 -translate-y-4 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>

                              <CardContent className="p-6 md:p-8 relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <Calendar className="w-6 h-6" />
                                  </div>
                                  {isRegOpen && (
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider animate-pulse">
                                      Active
                                    </span>
                                  )}
                                  {isRegUpcoming && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                                      Upcoming
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 mb-4 line-clamp-2">
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
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Date</p>
                                        <p className="text-sm font-extrabold text-slate-700">{format(examDate, "MMMM dd, yyyy")}</p>
                                      </div>
                                    </div>
                                  )}

                                  {regStart && regEnd && (
                                    <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl group-hover:bg-white transition-colors">
                                      <Clock className="w-5 h-5 text-slate-400" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration</p>
                                        <p className="text-xs font-bold text-slate-600 truncate">
                                          {format(regStart, "MMM dd")} - {format(regEnd, "MMM dd, yyyy")}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center text-blue-600 font-extrabold text-sm group-hover:gap-4 transition-all duration-300">
                                  <span>Details</span>
                                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}
                    {/* Fill empty spaces */}
                    {slideIndex === maxSlides - 1 &&
                      exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                      Array.from({ length: itemsPerView - exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                        <div key={`empty-${blockIndex}-${i}`} className="flex-1" />
                      ))}
                  </div>
                ))
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrevious}
              className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white backdrop-blur-md shadow-xl rounded-full p-3 text-blue-600 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white backdrop-blur-md shadow-xl rounded-full p-3 text-blue-600 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 ${index === currentSlide
                    ? "w-6 h-1.5 bg-blue-600 shadow-sm"
                    : "w-1.5 h-1.5 bg-blue-200 hover:bg-blue-300"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
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

