"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, ChevronLeft } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  testimonial: string
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
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">Loading testimonials...</div>
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
      className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Abstract pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-12">
          <ChevronRight className="h-8 w-8 text-red-600 rotate-90" />
          <h2 className="text-5xl md:text-6xl font-bold text-white">Testimonials</h2>
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
                className="min-w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-2"
              >
                {slide.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-white shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
                          <div className={`w-full h-full bg-gradient-to-br ${getColorClasses(testimonial.avatarColor)} flex items-center justify-center text-white text-2xl font-bold`}>
                            {getInitials(testimonial.name)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(testimonial.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{testimonial.name}</h3>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-6">
                        {testimonial.testimonial}
                      </p>
                      <Link href="/contact" className="block">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                          GET IN TOUCH
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors backdrop-blur-sm"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors backdrop-blur-sm"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentSlide
                    ? "w-3 h-3 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/75"
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

