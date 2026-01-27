"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
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
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await fetch("/api/entrance-exams")
        if (response.ok) {
          const data = await response.json()
          const examsList = Array.isArray(data) ? data : (data.exams || [])

          if (examsList.length > 0) {
            const now = new Date()
            const oneYearLater = new Date()
            oneYearLater.setFullYear(now.getFullYear() + 1)

            let upcoming = examsList
              .filter((exam: EntranceExam) => {
                if (exam.examDate) {
                  try {
                    const examDate = new Date(exam.examDate)
                    return examDate >= now && examDate <= oneYearLater
                  } catch {
                    return true
                  }
                }
                return true
              })
              .sort((a: EntranceExam, b: EntranceExam) => {
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
              .slice(0, 9)

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
      if (window.innerWidth >= 1024) setItemsPerView(3)
      else if (window.innerWidth >= 640) setItemsPerView(2)
      else setItemsPerView(1)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxSlides = exams.length > 0 ? Math.ceil(exams.length / itemsPerView) : 0

  useEffect(() => {
    if (scrollContainerRef.current && maxSlides > 0 && !isReady && !loading) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = maxSlides * clientWidth
      setIsReady(true)
    }
  }, [maxSlides, isReady, loading])

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isReady || loading || maxSlides === 0) return
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

  useEffect(() => {
    if (loading || exams.length <= itemsPerView || isPaused || !isReady || maxSlides === 0) return

    const interval = setInterval(() => {
      goToNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [loading, exams.length, isPaused, isReady, currentSlide, itemsPerView, maxSlides])

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full mb-3 shadow-lg">
            <Calendar className="w-4 h-4" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Important Dates</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 tracking-tight">
            Upcoming Entrance Exams
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Stay ahead with key exam dates and registration periods
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : exams.length > 0 ? (
          <div
            className="relative group/carousel max-w-7xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute top-1/2 -left-4 -right-4 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-all">
              <button
                onClick={goToPrevious}
                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-4"
            >
              {[0, 1, 2].map((blockIndex) => (
                Array.from({ length: maxSlides }).map((_, slideIndex) => (
                  <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-4 px-2">
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
                            <Card className="h-full hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] transition-all duration-500 transform hover:-translate-y-2 border-slate-100/50 bg-white/80 backdrop-blur-md group relative overflow-hidden rounded-3xl">
                              <CardContent className="p-6 relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-5">
                                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <Calendar className="w-5 h-5" />
                                  </div>
                                  {isRegOpen ? (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase tracking-wider animate-pulse border border-emerald-200">
                                      Active
                                    </span>
                                  ) : isRegUpcoming && (
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full uppercase tracking-wider border border-amber-200">
                                      Upcoming
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors duration-300 mb-4 line-clamp-2 min-h-[2.5rem] tracking-tight leading-tight">
                                  {exam.name}
                                </h3>

                                <div className="space-y-3.5 mb-6">
                                  {examDate && (
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <span className="text-[9px] font-bold uppercase leading-none">{format(examDate, "MMM")}</span>
                                        <span className="text-xs font-black leading-none">{format(examDate, "dd")}</span>
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Exam Date</p>
                                        <p className="text-xs font-black text-slate-700">{format(examDate, "MMMM dd, yyyy")}</p>
                                      </div>
                                    </div>
                                  )}

                                  {regStart && regEnd && (
                                    <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl group-hover:bg-white transition-colors border border-slate-100">
                                      <Clock className="w-4 h-4 text-slate-400" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Registration</p>
                                        <p className="text-[10px] font-bold text-slate-600 truncate">
                                          {format(regStart, "MMM dd")} - {format(regEnd, "MMM dd, yyyy")}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center text-blue-600 font-black text-[10px] uppercase tracking-wider group-hover:gap-3 transition-all duration-300 mt-auto">
                                  <span>View Details</span>
                                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        )
                      })}
                    {slideIndex === maxSlides - 1 &&
                      exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                      Array.from({ length: itemsPerView - exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                        <div key={`empty-${blockIndex}-${i}`} className="flex-1" />
                      ))}
                  </div>
                ))
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-2">
              {Array.from({ length: maxSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 h-1 bg-blue-600" : "w-1 h-1 bg-blue-200"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm">No upcoming exams found.</p>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link href="/entrance-exams">
            <Button
              variant="outline"
              className="rounded-2xl px-8 py-5 h-auto text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group"
            >
              Explore All Exams
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
