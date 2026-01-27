"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, ChevronLeft, Quote, Star, MessageCircle } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  testimonial: string
  photoUrl: string | null
  avatarColor: string
  date: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getColorClasses(color: string): string {
  const colorMap: Record<string, string> = {
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    orange: "from-orange-400 to-orange-600",
    indigo: "from-indigo-400 to-indigo-600",
    pink: "from-pink-400 to-pink-600",
    yellow: "from-yellow-400 to-yellow-600",
  }
  return colorMap[color] || colorMap.blue
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [itemsPerView, setItemsPerView] = useState(1)
  const [isReady, setIsReady] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        if (response.ok) {
          const data = await response.json()
          setTestimonials(data.testimonials || [])
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const maxSlides = testimonials.length > 0 ? Math.ceil(testimonials.length / itemsPerView) : 0

  useEffect(() => {
    if (scrollContainerRef.current && maxSlides > 0 && !isReady) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = maxSlides * clientWidth
      setIsReady(true)
    }
  }, [maxSlides, isReady])

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

  useEffect(() => {
    if (loading || testimonials.length <= itemsPerView || isPaused || !isReady || maxSlides === 0) return
    const interval = setInterval(() => goToNext(), 5000)
    return () => clearInterval(interval)
  }, [loading, testimonials.length, isPaused, isReady, currentSlide, itemsPerView, maxSlides])

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

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center text-white">Loading...</div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section
      className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg border border-white/30">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Student Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            What Our Students Say
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
            Real experiences from students who found their perfect college with us
          </p>
        </div>

        <div className="relative mb-12 group/carousel max-w-[1400px] mx-auto">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-4"
          >
            {[0, 1, 2].map((blockIndex) => (
              Array.from({ length: maxSlides }).map((_, slideIndex) => (
                <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-6 px-4">
                  {testimonials
                    .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                    .map((testimonial) => (
                      <Card key={`${blockIndex}-${testimonial.id}`} className="flex-1 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-2 rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 relative flex flex-col items-center h-full">
                          <Quote className="absolute top-4 left-4 h-8 w-8 text-white/10" />
                          <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 p-1 backdrop-blur-md shadow-2xl">
                              <div className="w-full h-full rounded-xl bg-slate-900/50 overflow-hidden relative border border-white/20">
                                {testimonial.photoUrl && (
                                  <img src={testimonial.photoUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                                )}
                                <div className={`w-full h-full flex items-center justify-center text-white text-2xl font-black bg-gradient-to-br ${getColorClasses(testimonial.avatarColor)} ${testimonial.photoUrl ? "hidden" : ""}`}>
                                  {getInitials(testimonial.name)}
                                </div>
                              </div>
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-lg flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />)}
                            </div>
                          </div>
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-black text-white">{testimonial.name}</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{new Date(testimonial.date).toDateString()}</p>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed text-center italic mb-8 flex-grow">&ldquo;{testimonial.testimonial}&rdquo;</p>
                          <Button className="w-full bg-white/10 hover:bg-white text-white hover:text-slate-900 font-bold py-3 h-auto rounded-xl border border-white/20 text-[10px] uppercase tracking-wider">
                            Success Story
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  {slideIndex === maxSlides - 1 &&
                    testimonials.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                    Array.from({ length: itemsPerView - testimonials.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                      <div key={`empty-${blockIndex}-${i}`} className="flex-1" />
                    ))}
                </div>
              ))
            ))}
          </div>

          {maxSlides > 1 && (
            <>
              <button onClick={goToPrevious} className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white p-4 rounded-full text-white hover:text-indigo-600 transition-all opacity-0 group-hover/carousel:opacity-100"><ChevronLeft className="h-6 w-6" /></button>
              <button onClick={goToNext} className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white p-4 rounded-full text-white hover:text-indigo-600 transition-all opacity-0 group-hover/carousel:opacity-100"><ChevronRight className="h-6 w-6" /></button>
            </>
          )}
        </div>

        {maxSlides > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: maxSlides }).map((_, idx) => (
              <button key={idx} onClick={() => goToSlide(idx)} className={`rounded-full transition-all ${idx === currentSlide ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
