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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

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

  // Initialize scroll position to the middle block
  useEffect(() => {
    if (scrollContainerRef.current && testimonials.length > 0 && !isReady) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = testimonials.length * clientWidth
      setIsReady(true)
    }
  }, [testimonials.length, isReady])

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isReady) return
    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth === 0) return

    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth)
    const logicalSlideIndex = absoluteSlideIndex % testimonials.length

    if (logicalSlideIndex !== currentSlide) {
      setCurrentSlide(logicalSlideIndex)
    }

    // Infinite loop jump
    if (scrollLeft <= clientWidth * 0.5) {
      scrollContainerRef.current.scrollLeft = scrollLeft + (testimonials.length * clientWidth)
    } else if (scrollLeft >= clientWidth * (testimonials.length * 2 + testimonials.length - 0.5)) {
      scrollContainerRef.current.scrollLeft = scrollLeft - (testimonials.length * clientWidth)
    }
  }

  // Auto-slide testimonials every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1 || isPaused || !isReady) return

    const interval = setInterval(() => {
      goToNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length, isPaused, isReady, currentSlide])

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollTo({
      left: (index + testimonials.length) * scrollContainerRef.current.clientWidth,
      behavior: "smooth"
    })
  }

  const goToPrevious = () => {
    const prevSlide = (currentSlide - 1 + testimonials.length) % testimonials.length
    goToSlide(prevSlide)
  }

  const goToNext = () => {
    const nextSlide = (currentSlide + 1) % testimonials.length
    goToSlide(nextSlide)
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-slate-600">Loading testimonials...</div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section
      className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top border separator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      {/* Bottom border separator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Pattern overlay for texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-4 shadow-lg border border-white/30">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Student Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            What Our Students Say
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
            Real experiences from students who found their perfect college with us
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative mb-12 group/carousel max-w-4xl mx-auto">
          {/* Slides Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-4"
          >
            {[0, 1, 2].map((blockIndex) => (
              testimonials.map((testimonial) => (
                <div
                  key={`${blockIndex}-${testimonial.id}`}
                  className="min-w-full snap-start snap-always flex justify-center px-4"
                >
                  <Card
                    className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-2 rounded-3xl group/card overflow-hidden"
                  >
                    <CardContent className="p-6 relative flex flex-col items-center"> {/* Reduced from p-10 to p-6 */}
                      {/* Quote Decoration */}
                      <Quote className="absolute top-4 left-4 h-8 w-8 text-white/10 group-hover/card:text-white/20 transition-colors" /> {/* Smaller quote */}

                      <div className="relative mb-4 pt-2"> {/* Reduced spacing */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 p-1 backdrop-blur-md shadow-2xl group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500"> {/* Smaller avatar */}
                          <div className="w-full h-full rounded-xl bg-slate-900/50 overflow-hidden relative border border-white/20">
                            {testimonial.photoUrl ? (
                              <img
                                src={testimonial.photoUrl}
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                  if (fallback) fallback.style.display = "flex"
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center text-white text-2xl font-black bg-gradient-to-br ${getColorClasses(testimonial.avatarColor)} ${testimonial.photoUrl ? "hidden" : ""}`}
                            >
                              {getInitials(testimonial.name)}
                            </div>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-2xl flex items-center gap-1 border border-slate-100 scale-90 group-hover/card:scale-100 transition-transform">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3 h-3 text-orange-500 fill-orange-500" />
                          ))}
                        </div>
                      </div>

                      <div className="text-center mb-4 relative z-10"> {/* Reduced spacing */}
                        <h3 className="text-xl font-black text-white mb-1 tracking-tight group-hover/card:text-blue-200 transition-colors"> {/* Smaller text */}
                          {testimonial.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-white/60 font-bold text-xs uppercase tracking-widest">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(testimonial.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>

                      <p className="text-white/80 text-base leading-relaxed text-center font-medium italic mb-6 relative z-10"> {/* Smaller text and spacing */}
                        &ldquo;{testimonial.testimonial}&rdquo;
                      </p>

                      <Link href="/contact" className="w-full mt-auto relative z-10">
                        <Button className="w-full bg-white/10 hover:bg-white text-white hover:text-slate-900 font-black py-5 rounded-xl transition-all duration-500 border border-white/20 group/btn"> {/* Smaller button */}
                          Success Story
                          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))
            ))}
          </div>

          {/* Navigation Controls - Hidden by default, show on hover */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white backdrop-blur-md shadow-2xl rounded-full p-4 text-white hover:text-indigo-600 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              <button
                onClick={goToNext}
                className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white backdrop-blur-md shadow-2xl rounded-full p-4 text-white hover:text-indigo-600 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${index === currentSlide
                  ? "w-4 h-1.5 bg-white shadow-lg"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
