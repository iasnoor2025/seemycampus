"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, GraduationCap, ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

type CollegeCategory = "management" | "bba" | "medical" | "engineering" | "law" | "design"

interface College {
  id: number
  name: string
  location: string | null
  slug: string
  logo?: string
  images?: string[] | null
}

const categoryMap: Record<CollegeCategory, string> = {
  management: "Management Colleges",
  bba: "BBA Colleges",
  medical: "Medical Colleges",
  engineering: "Engineering Colleges",
  law: "Law Colleges",
  design: "Design Colleges",
}

const categoryIcons: Record<CollegeCategory, string> = {
  management: "🎓",
  bba: "💼",
  medical: "⚕️",
  engineering: "⚙️",
  law: "⚖️",
  design: "🎨",
}

export function FeaturedColleges() {
  const [activeCategory, setActiveCategory] = useState<CollegeCategory>("management")
  const [showAll, setShowAll] = useState(false)
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current

      let scrollTo: number
      if (direction === "left") {
        scrollTo = scrollLeft - clientWidth
        if (scrollTo < 0) scrollTo = scrollWidth // Wrap to end
      } else {
        scrollTo = scrollLeft + clientWidth
        if (scrollTo >= scrollWidth - 10) scrollTo = 0 // Wrap to start
      }

      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  // Auto-slide effect
  useEffect(() => {
    if (loading || colleges.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      scroll("right")
    }, 5000)

    return () => clearInterval(interval)
  }, [loading, colleges.length, isPaused])

  // Fetch colleges from API
  useEffect(() => {
    async function fetchColleges() {
      try {
        setLoading(true)
        const response = await fetch(`/api/colleges/featured?category=${activeCategory}`)
        const data = await response.json()
        if (data.colleges) {
          setColleges(data.colleges)
        }
      } catch (error) {
        console.error("Error fetching colleges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchColleges()
  }, [activeCategory])

  const displayedColleges = showAll ? colleges : colleges.slice(0, 5)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4)
  }

  // Generate a color gradient for each card
  const getCardGradient = (index: number) => {
    const gradients = [
      "from-indigo-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-violet-500 to-purple-600",
      "from-teal-500 to-emerald-600",
      "from-sky-500 to-blue-600",
      "from-purple-500 to-pink-600",
    ]
    return gradients[index % gradients.length]
  }

  const getCardTextColor = (index: number) => {
    const colors = [
      "text-indigo-600",
      "text-blue-600",
      "text-violet-600",
      "text-teal-600",
      "text-sky-600",
      "text-purple-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium text-sm">Featured Institutions</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
            Top Featured Colleges in India
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Discover premier institutions for MBA, BBA, Engineering & More
          </p>
        </div>

        {/* Category Navigation Tabs - Designer-grade Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          <div className="p-1.5 bg-slate-200/50 backdrop-blur-xl rounded-[2rem] border border-white/40 flex flex-wrap justify-center gap-1 shadow-inner">
            {(Object.keys(categoryMap) as CollegeCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] rounded-full transition-all duration-500 flex items-center gap-2 ${activeCategory === category
                  ? "bg-white text-blue-600 shadow-[0_10px_25px_rgba(0,0,0,0.1)] scale-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  }`}
              >
                <span className="text-base leading-none">{categoryIcons[category]}</span>
                {categoryMap[category].split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Colleges Slider - Card Layout */}
        <div
          className="relative group/slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 md:-left-8 -right-4 md:-right-8 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => scroll("left")}
              className="w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all duration-500 pointer-events-auto border border-white group/btn"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center justify-center text-slate-800 hover:bg-blue-600 hover:text-white transition-all duration-500 pointer-events-auto border border-white group/btn"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-8 pb-12 pt-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {loading ? (
              <div className="w-full flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-3xl shadow-xl p-20 text-center border border-slate-200/50">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-20 w-20 bg-slate-200 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-slate-200 rounded w-64 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                </div>
              </div>
            ) : colleges.length > 0 ? (
              colleges.map((college, index) => (
                <div
                  key={college.id}
                  className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] flex-shrink-0 snap-center p-4"
                >
                  <div
                    className="bg-white rounded-[2.5rem] h-full shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_40px_100px_rgba(59,130,246,0.15)] transition-all duration-700 transform hover:-translate-y-4 overflow-hidden group border border-slate-100 flex flex-col relative"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Premium Card Header */}
                    <div className={`h-40 bg-gradient-to-br ${getCardGradient(index)} relative flex items-center justify-center flex-shrink-0 p-6`}>
                      {/* Abstract background graphics */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent)]"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>

                      {/* Rating Badge - High End */}
                      <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/20 z-10 shadow-xl">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-xs font-black tracking-tight">4.{Math.floor(Math.random() * 5) + 5}</span>
                        </div>
                      </div>

                      <div className="w-28 h-28 bg-white/95 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 overflow-hidden border border-white/40 relative z-10">
                        {college.images && Array.isArray(college.images) && college.images.length > 0 && !imageErrors.has(college.id) ? (
                          <div className="relative w-full h-full p-4">
                            <Image
                              src={college.images[0]}
                              alt={`${college.name} logo`}
                              fill
                              className="object-contain p-2"
                              loading="lazy"
                              quality={95}
                              onError={(e) => {
                                setImageErrors(prev => new Set(prev).add(college.id))
                              }}
                            />
                          </div>
                        ) : (
                          <span className={`${getCardTextColor(index)} font-black text-3xl tracking-tighter`}>
                            {getInitials(college.name)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body - Improved spacing and typography */}
                    <div className="pt-8 p-10 flex flex-col flex-1 bg-gradient-to-b from-white to-slate-50/50">
                      <div className="mb-4">
                        <div className="inline-block px-3 py-1 bg-blue-50 rounded-lg text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">
                          {activeCategory} Institution
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-500 leading-[1.1] tracking-tight min-h-[5rem]">
                          {college.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2.2 text-slate-500 mb-8 mt-auto">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors duration-500">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Location</p>
                          <p className="text-sm font-extrabold text-slate-800">{college.location || "India"}</p>
                        </div>
                      </div>

                      {/* Action Button - Designer Style */}
                      <div className="mt-auto pt-4">
                        <Link href={`/colleges/${college.slug}`} className="block">
                          <Button
                            className={`w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-8 rounded-2xl transition-all duration-500 group/btn relative overflow-hidden shadow-xl hover:shadow-blue-500/40 uppercase tracking-widest text-[10px]`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                              Discover Institution
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-300" />
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-20 text-center border border-slate-100">
                <GraduationCap className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 text-xl font-bold italic">
                  Coming soon...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* VIEW ALL Button - High Impact */}
        <div className="flex justify-center mt-12">
          <Link href="/colleges">
            <Button
              className="bg-white hover:bg-blue-600 text-slate-900 hover:text-white font-black px-12 py-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:shadow-blue-500/40 transition-all duration-500 transform hover:scale-105 border border-slate-100 flex items-center gap-3 group/all"
            >
              <span className="uppercase tracking-[0.2em] text-[10px]">View all {colleges.length > 0 ? colleges.length : ""} featured institutions</span>
              <ArrowRight className="w-4 h-4 group-hover/all:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

