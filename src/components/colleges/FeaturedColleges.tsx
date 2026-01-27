"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, GraduationCap, ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isPaused, setIsPaused] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  // Fetch colleges from API
  useEffect(() => {
    async function fetchColleges() {
      try {
        setLoading(true)
        setIsReady(false)
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

  const maxSlides = colleges.length > 0 ? Math.ceil(colleges.length / itemsPerView) : 0

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

    // Silent jump for infinite scroll
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
    if (loading || colleges.length <= itemsPerView || isPaused || !isReady || maxSlides === 0) return

    const interval = setInterval(() => {
      goToNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [loading, colleges.length, isPaused, isReady, currentSlide, itemsPerView, maxSlides])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4)
  }

  const getCardGradient = (index: number) => {
    const gradients = [
      "from-violet-600 to-indigo-700",
      "from-purple-600 to-blue-600",
      "from-indigo-600 to-purple-700",
      "from-blue-600 to-violet-700",
      "from-violet-500 to-fuchsia-600",
      "from-purple-500 to-pink-600",
    ]
    return gradients[index % gradients.length]
  }

  const getCardTextColor = (index: number) => {
    const colors = [
      "text-violet-600",
      "text-purple-600",
      "text-indigo-600",
      "text-blue-600",
      "text-fuchsia-600",
      "text-pink-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full mb-3 shadow-lg">
            <GraduationCap className="w-4 h-4" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Featured Institutions</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 tracking-tight">
            Top Featured Colleges in India
          </h2>
          <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
            Explore premier institutions across multiple disciplines
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="w-full max-w-3xl overflow-x-auto scrollbar-hide">
            <div className="p-1.5 bg-slate-200/30 backdrop-blur-xl rounded-2xl border border-white/40 flex items-center justify-start sm:justify-center gap-1.5 min-w-max">
              {(Object.keys(categoryMap) as CollegeCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeCategory === category
                    ? "bg-white text-blue-600 shadow-sm scale-100"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/20"
                    }`}
                >
                  <span className="text-sm">{categoryIcons[category]}</span>
                  {categoryMap[category].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative group/slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute top-1/2 -left-4 -right-4 -translate-y-1/2 flex justify-between z-20 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-all">
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
            className="flex overflow-x-auto gap-0 pb-8 pt-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {loading ? (
              <div key="loading" className="min-w-full flex-shrink-0 bg-white/40 backdrop-blur-sm rounded-3xl p-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                </div>
              </div>
            ) : colleges.length > 0 ? (
              [0, 1, 2].map((blockIndex) => (
                Array.from({ length: maxSlides }).map((_, slideIndex) => (
                  <div key={`${blockIndex}-${slideIndex}`} className="min-w-full snap-start snap-always flex gap-4 px-2">
                    {colleges.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).map((college, idx) => (
                      <div key={`${blockIndex}-${college.id}`} className="flex-1 min-w-0">
                        <div className="bg-white rounded-3xl h-full shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group border border-slate-100 flex flex-col relative">
                          <div className={`h-52 bg-gradient-to-br ${getCardGradient(idx)} relative overflow-hidden flex-shrink-0`}>
                            {college.images?.[0] && !imageErrors.has(college.id) ? (
                              <>
                                <Image
                                  src={college.images[0]}
                                  alt={college.name}
                                  fill
                                  priority={blockIndex === 1} // Priority for the main visible block
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                                  quality={95}
                                  onError={() => setImageErrors(prev => new Set(prev).add(college.id))}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white font-black text-3xl opacity-30 drop-shadow-2xl">
                                  {getInitials(college.name)}
                                </span>
                              </div>
                            )}

                            {/* Rating Badge - Repositioned for full-bleed design */}
                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl rounded-full px-2.5 py-1 border border-white/20 z-10 shadow-2xl">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-white text-[10px] font-black tracking-tighter">
                                  4.{Math.floor(Math.random() * 5) + 5}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-5 flex flex-col flex-1 bg-white">
                            <h3 className="text-xs font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2rem]">
                              {college.name}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-500 mb-5 mt-auto">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[10px] font-bold truncate">{college.location || "India"}</span>
                            </div>
                            <Link href={`/colleges/${college.slug}`}>
                              <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 h-auto rounded-xl shadow-sm uppercase tracking-wider text-[8px] transition-all">
                                Discover More
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {slideIndex === maxSlides - 1 &&
                      colleges.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length < itemsPerView &&
                      Array.from({ length: itemsPerView - colleges.slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView).length }).map((_, i) => (
                        <div key={`empty-${blockIndex}-${i}`} className="flex-1 min-w-0" />
                      ))}
                  </div>
                ))
              ))
            ) : (
              <div key="empty" className="min-w-full bg-white/60 rounded-3xl p-12 text-center">
                <GraduationCap className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 font-bold text-xs">More coming soon</p>
              </div>
            )}
          </div>
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

        <div className="flex justify-center mt-10">
          <Link href="/colleges">
            <Button
              variant="outline"
              className="rounded-2xl px-8 py-5 h-auto text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group"
            >
              View All {colleges.length > 0 ? colleges.length : ""} Colleges
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
