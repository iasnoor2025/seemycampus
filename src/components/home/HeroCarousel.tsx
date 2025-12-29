"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HeroSlide {
  id: number
  title: string | null
  subtitle: string | null
  imageUrl: string
  buttonText: string | null
  buttonLink: string | null
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch("/api/hero-slides")
        if (response.ok) {
          const data = await response.json()
          setSlides(data.slides || [])
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  if (loading) {
    return (
      <section className="relative bg-[#18254a] py-20 text-white min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    // Fallback to default content if no slides
    return (
      <section className="relative bg-[#18254a] py-20 text-white min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-4 font-medium text-white/90">Now You Can Get</p>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                The Best Education for<br />
                <span className="text-white">Bright Future</span>
              </h1>
              <Link href="/quiz">
                <Button size="lg" className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white">
                  MORE ABOUT
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/50">
                  <p className="text-sm">Graduate Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const currentSlide = slides[currentIndex]

  return (
    <section className="relative bg-[#18254a] py-20 text-white min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentSlide.imageUrl}
          alt={currentSlide.title || "Hero slide"}
          fill
          className="object-cover"
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? "eager" : "lazy"}
          quality={85}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            {currentSlide.subtitle && (
              <p className="text-lg mb-4 font-medium text-white/90">{currentSlide.subtitle}</p>
            )}
            {currentSlide.title && (
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                {currentSlide.title}
              </h1>
            )}
            {currentSlide.buttonText && currentSlide.buttonLink && (
              <Link href={currentSlide.buttonLink}>
                <Button size="lg" className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white">
                  {currentSlide.buttonText}
                </Button>
              </Link>
            )}
          </div>
          <div className="hidden lg:block relative">
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title || "Hero slide"}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                loading={currentIndex === 0 ? "eager" : "lazy"}
                quality={85}
                sizes="(max-width: 1024px) 0vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

