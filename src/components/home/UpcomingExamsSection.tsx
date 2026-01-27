"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

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
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3)
      else if (window.innerWidth >= 640) setItemsPerView(2)
      else setItemsPerView(1)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch("/api/entrance-exams")
        if (response.ok) {
          const data = await response.json()
          setExams(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error fetching exams:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
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
    if (!scrollContainerRef.current || !isReady || maxSlides === 0) return
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
    const interval = setInterval(() => goToNext(), 5000)
    return () => clearInterval(interval)
  }, [loading, exams.length, isPaused, isReady, currentSlide, itemsPerView, maxSlides])

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-5 h-5" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Exam Alerts</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
            Upcoming Entrance Exams
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Stay ahead with the latest exam dates and registration deadlines
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : exams.length > 0 ? (
          <div
            className="relative max-w-7xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {maxSlides > 1 ? (
              <div className="group/carousel">
                <div className="absolute top-1/2 -left-4 -right-4 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-all">
                  <button onClick={goToPrevious} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={goToNext} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all pointer-events-auto border border-white/50"><ChevronRight className="w-5 h-5" /></button>
                </div>

                <div ref={scrollContainerRef} onScroll={handleScroll} className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-4">
                  {[0, 1, 2].map((blockIndex) => (
                    Array.from({ length: maxSlides }).map((_, slideIndex) => (
                      <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-6 px-4">
                        {exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).map((exam) => (
                          <div key={`${blockIndex}-${exam.id}`} className="flex-1 min-w-0">
                            <ExamCard exam={exam} />
                          </div>
                        ))}
                        {slideIndex === maxSlides - 1 && exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                          Array.from({ length: itemsPerView - exams.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                            <div key={`empty-${blockIndex}-${i}`} className="flex-1" />
                          ))}
                      </div>
                    ))
                  ))}
                </div>

                <div className="flex justify-center gap-1.5 mt-4">
                  {Array.from({ length: maxSlides }).map((_, idx) => (
                    <button key={idx} onClick={() => goToSlide(idx)} className={`rounded-full transition-all duration-300 ${idx === currentSlide ? "w-6 h-1 bg-blue-600" : "w-1 h-1 bg-blue-200"}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                {exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-slate-100 shadow-inner">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No upcoming exams at the moment</p>
          </div>
        )}
      </div>
    </section>
  )
}

function ExamCard({ exam }: { exam: EntranceExam }) {
  const examDate = exam.examDate ? new Date(exam.examDate) : null
  const regStart = exam.registrationStartDate ? new Date(exam.registrationStartDate) : null
  const regEnd = exam.registrationEndDate ? new Date(exam.registrationEndDate) : null
  const now = new Date()

  const isRegOpen = regStart && regEnd && now >= regStart && now <= regEnd
  const isRegUpcoming = regStart && now < regStart

  return (
    <Link href={`/entrance-exams/${exam.slug}`} className="block h-full group">
      <Card className="h-full hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all duration-500 transform hover:-translate-y-2 border-slate-100/60 bg-white relative overflow-hidden rounded-3xl group/card">
        <CardContent className="p-8 flex flex-col h-full relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500 shadow-sm border border-blue-100/50">
              <Calendar className="w-7 h-7" />
            </div>
            {isRegOpen ? (
              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100/50 shadow-sm">Active</span>
            ) : isRegUpcoming && (
              <span className="px-3.5 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-100/50 shadow-sm">Upcoming</span>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-800 group-hover/card:text-blue-600 transition-colors duration-300 mb-6 leading-tight tracking-tight">
            {exam.name}
          </h3>

          <div className="space-y-5 mb-10 flex-grow">
            {examDate && (
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover/card:bg-blue-50 group-hover/card:text-blue-600 transition-colors border border-slate-100">
                  <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{format(examDate, "MMM")}</span>
                  <span className="text-lg font-black leading-none">{format(examDate, "dd")}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exam Date</p>
                  <p className="text-sm font-black text-slate-800">{format(examDate, "MMMM dd, yyyy")}</p>
                </div>
              </div>
            )}
            {regStart && regEnd && (
              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group-hover/card:bg-blue-50/30 group-hover/card:border-blue-100 transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration</span>
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {format(regStart, "MMM dd")} - {format(regEnd, "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-5 flex items-center text-blue-600 font-black text-xs uppercase tracking-widest border-t border-slate-100 group-hover/card:border-blue-100 transition-colors">
            View Exam Details
            <ArrowRight className="w-4 h-4 ml-auto transform group-hover/card:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
