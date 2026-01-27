"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calculator, TrendingUp, FileText, GitCompare, Target, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const tools = [
  {
    name: "Admission Predictor",
    description: "Check your admission chances",
    Icon: TrendingUp,
    link: "/admission-predictor",
    gradient: "from-blue-500 to-cyan-600",
    color: "text-blue-600"
  },
  {
    name: "Fee Calculator",
    description: "Calculate total college costs",
    Icon: Calculator,
    link: "/fee-calculator",
    gradient: "from-indigo-500 to-purple-600",
    color: "text-indigo-600"
  },
  {
    name: "Compare Colleges",
    description: "Side-by-side comparison",
    Icon: GitCompare,
    link: "/compare",
    gradient: "from-violet-500 to-purple-600",
    color: "text-violet-600"
  },
  {
    name: "Career Path",
    description: "Explore career options",
    Icon: Target,
    link: "/career-path",
    gradient: "from-teal-500 to-emerald-600",
    color: "text-teal-600"
  },
  {
    name: "Essay Assistant",
    description: "AI-powered essay help",
    Icon: FileText,
    link: "/essay-assistant",
    gradient: "from-sky-500 to-blue-600",
    color: "text-sky-600"
  }
]

export function QuickToolsSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerView(5)
      } else if (window.innerWidth >= 1024) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxSlides = Math.ceil(tools.length / itemsPerView)

  // Initialize scroll position to the middle set of slides
  useEffect(() => {
    if (scrollContainerRef.current && maxSlides > 0 && !isReady) {
      const { clientWidth } = scrollContainerRef.current
      scrollContainerRef.current.scrollLeft = maxSlides * clientWidth
      setIsReady(true)
    }
  }, [maxSlides, isReady])

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isReady) return
    const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current
    if (clientWidth === 0) return

    // Calculate which slide we are on (0 to maxSlides - 1)
    const absoluteSlideIndex = Math.round(scrollLeft / clientWidth)
    const logicalSlideIndex = absoluteSlideIndex % maxSlides

    if (logicalSlideIndex !== currentSlide) {
      setCurrentSlide(logicalSlideIndex)
    }

    // Infinite loop jump: 
    // If we've scrolled into the first block (indices 0 to maxSlides-1) 
    // or the third block (indices maxSlides*2 to maxSlides*3-1), 
    // silently jump back to the middle block.
    if (scrollLeft <= clientWidth * 0.5) { // If scrolled past the first slide of the first block
      // Near start of first block, jump to start of second block
      scrollContainerRef.current.scrollLeft = scrollLeft + (maxSlides * clientWidth)
    } else if (scrollLeft >= clientWidth * (maxSlides * 2 + maxSlides - 0.5)) { // If scrolled past the last slide of the third block
      // Near end of third block, jump back to second block
      scrollContainerRef.current.scrollLeft = scrollLeft - (maxSlides * clientWidth)
    }
  }

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return
    // Always target the middle block (index + maxSlides) for smooth transitions
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
    <section className="py-16 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full mb-4 shadow-lg">
            <Lightbulb className="w-4 h-4" />
            <span className="font-medium text-xs">Powerful Tools</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3 leading-tight">
            Everything You Need
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            Smart tools to help you make the right decisions
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel max-w-7xl mx-auto">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide py-4"
          >
            {/* Render 3 sets of slides for infinite loop */}
            {[0, 1, 2].map((blockIndex) => (
              Array.from({ length: maxSlides }).map((_, slideIndex) => (
                <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-4 md:gap-6 px-4">
                  {tools
                    .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                    .map((tool, index) => (
                      <Link key={index} href={tool.link} className="flex-1 min-w-0">
                        <Card className="h-full hover:shadow-[0_15px_30px_rgba(37,99,235,0.1)] transition-all duration-500 transform hover:-translate-y-2 border-slate-200/60 bg-white/80 backdrop-blur-sm group overflow-hidden relative rounded-2xl">
                          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tool.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                          <CardContent className="p-5 md:p-6">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} text-white mb-4 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                              <tool.Icon className="w-6 h-6" />
                            </div>
                            <h3 className={`text-base md:text-lg font-bold mb-2 group-hover:${tool.color} transition-colors duration-300 line-clamp-1`}>
                              {tool.name}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                              {tool.description}
                            </p>

                            <div className="mt-4 flex items-center text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Try now <span className="ml-1.5">→</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  {/* Fill empty spaces in the last slide to keep widths consistent */}
                  {slideIndex === maxSlides - 1 &&
                    tools.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                    Array.from({ length: itemsPerView - tools.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                      <div key={`empty-${blockIndex}-${i}`} className="flex-1" />
                    ))}
                </div>
              ))
            ))}
          </div>

          {/* Navigation Controls */}
          <button
            onClick={goToPrevious}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 bg-white shadow-xl rounded-full p-3 text-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 border border-slate-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 bg-white shadow-xl rounded-full p-3 text-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 border border-slate-100"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
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
    </section>
  )
}
