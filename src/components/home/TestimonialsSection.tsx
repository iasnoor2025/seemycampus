"use client"

import { useState, useEffect } from "react"
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

  // Auto-slide testimonials every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 3 || isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlides = Math.ceil(testimonials.length / 3)
        return (prev + 1) % maxSlides
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length, isPaused])

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
    return null // Don't show section if no testimonials
  }

  // Group testimonials into slides of 3
  const slides: Testimonial[][] = []
  for (let i = 0; i < testimonials.length; i += 3) {
    slides.push(testimonials.slice(i, i + 3))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
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
        <div className="relative overflow-hidden mb-8">
          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, slideIndex) => (
              <div 
                key={slideIndex}
                className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-2"
              >
                {slide.map((testimonial, cardIndex) => (
                  <Card 
                    key={testimonial.id} 
                    className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 overflow-hidden group"
                  >
                    <CardContent className="p-8 relative">
                      {/* Quote Icon */}
                      <div className="absolute top-6 right-6 opacity-10">
                        <Quote className="h-24 w-24 text-blue-500" />
                      </div>

                      {/* Profile Section */}
                      <div className="flex flex-col items-center mb-6 relative z-10">
                        <div className="relative mb-4">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-1 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <div className="w-full h-full rounded-full bg-white p-1">
                              {testimonial.photoUrl ? (
                                <img
                                  src={testimonial.photoUrl}
                                  alt={testimonial.name}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = "flex"
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full rounded-full bg-gradient-to-br ${getColorClasses(testimonial.avatarColor)} flex items-center justify-center text-white text-2xl font-bold ${testimonial.photoUrl ? "hidden" : ""}`}
                              >
                                {getInitials(testimonial.name)}
                              </div>
                            </div>
                          </div>
                          {/* Rating Stars */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-1 shadow-md flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {testimonial.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>{new Date(testimonial.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <div className="relative z-10 mb-6">
                        <p className="text-gray-700 text-base leading-relaxed text-center italic">
                          &ldquo;{testimonial.testimonial}&rdquo;
                        </p>
                      </div>

                      {/* CTA Button */}
                      <Link href="/contact" className="block relative z-10">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group/btn">
                          <span>Get In Touch</span>
                          <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                {/* Fill empty slots if less than 3 testimonials in last slide */}
                {slide.length < 3 && Array.from({ length: 3 - slide.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="hidden md:block" />
                ))}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-white/30"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-white/30"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-3 h-3 bg-white shadow-lg"
                    : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70"
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

