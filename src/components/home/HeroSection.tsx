"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, GraduationCap, Briefcase, ShoppingCart, Palette, Stethoscope, Scale, BookOpen, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SearchAutocomplete } from "@/components/colleges/SearchAutocomplete"

interface HeroSlide {
  id: number
  title: string | null
  subtitle: string | null
  imageUrl: string
  buttonText: string | null
  buttonLink: string | null
}

interface StudyGoal {
  id: number
  name: string
  slug: string
  icon: string
  collegeCount: string | null
  courses: string[]
  link: string
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="h-8 w-8" />,
  Briefcase: <Briefcase className="h-8 w-8" />,
  ShoppingCart: <ShoppingCart className="h-8 w-8" />,
  Palette: <Palette className="h-8 w-8" />,
  Stethoscope: <Stethoscope className="h-8 w-8" />,
  Scale: <Scale className="h-8 w-8" />,
  BookOpen: <BookOpen className="h-8 w-8" />,
}

export function HeroSection() {
  const router = useRouter()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPaused, setIsPaused] = useState(false)
  const [displayText, setDisplayText] = useState("")
  const [studyGoalsData, setStudyGoalsData] = useState<StudyGoal[]>([])
  const [rotatingTexts, setRotatingTexts] = useState<string[]>([])

  // Move typewriter logic to its own component to prevent whole HeroSection re-renders
  const TypewriterHeader = ({ rotatingTexts }: { rotatingTexts: string[] }) => {
    const [textIndex, setTextIndex] = useState(0)
    const [displayStr, setDisplayStr] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [charIdx, setCharIdx] = useState(0)

    useEffect(() => {
      if (rotatingTexts.length === 0) return
      const currentText = rotatingTexts[textIndex]
      if (!currentText) return

      if (!isDeleting && charIdx < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayStr(currentText.substring(0, charIdx + 1))
          setCharIdx(charIdx + 1)
        }, 50)
        return () => clearTimeout(timeout)
      } else if (!isDeleting && charIdx === currentText.length) {
        const timeout = setTimeout(() => setIsDeleting(true), 2000)
        return () => clearTimeout(timeout)
      } else if (isDeleting && charIdx > 0) {
        const timeout = setTimeout(() => {
          setDisplayStr(currentText.substring(0, charIdx - 1))
          setCharIdx(charIdx - 1)
        }, 30)
        return () => clearTimeout(timeout)
      } else if (isDeleting && charIdx === 0) {
        const timeout = setTimeout(() => {
          setIsDeleting(false)
          setTextIndex((prev) => (prev + 1) % rotatingTexts.length)
        }, 500)
        return () => clearTimeout(timeout)
      }
    }, [textIndex, charIdx, isDeleting, rotatingTexts])

    // Center stabilization: Use an invisible span of the full text to keep layout stable
    const fullText = rotatingTexts[textIndex] || ""

    return (
      <div className="relative h-[80px] sm:h-[100px] md:h-[120px] mb-6 flex items-center justify-center overflow-hidden">
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl relative">
          {/* Static invisible spacer to prevent width jumping */}
          <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
            {fullText}
          </span>
          {/* Actual animated text overlayed */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-max text-white whitespace-nowrap">
            {displayStr}
            <span className="inline-block w-1 h-8 sm:h-12 md:h-16 bg-blue-400 ml-1 animate-pulse shadow-[0_0_10px_#60a5fa] align-middle"></span>
          </span>
        </h1>
      </div>
    )
  }

  useEffect(() => {
    // Use Promise.all for parallel fetching to improve performance
    // Use AbortController for timeout handling
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 5000) // 5s timeout

    const fetchData = async () => {
      try {
        const [slidesResponse, textsResponse] = await Promise.all([
          fetch("/api/hero-slides", {
            cache: 'default',
            signal: abortController.signal
          }),
          fetch("/api/hero-rotating-texts", {
            cache: 'default',
            signal: abortController.signal
          })
        ])

        clearTimeout(timeoutId)

        if (slidesResponse.ok) {
          const slidesData = await slidesResponse.json()
          setSlides(slidesData.slides || [])
        }

        if (textsResponse.ok) {
          const textsData = await textsResponse.json()
          const texts = (textsData.texts || []).map((t: { text: string }) => t.text)
          setRotatingTexts(texts.length > 0 ? texts : ["Find Over 25000+ Colleges in India"])
        } else {
          // Fallback to default texts
          setRotatingTexts([
            "Find Over 4 Lakh Reviews in India",
            "Find Over 11000+ Courses in India",
            "Find Over 25000+ Colleges in India",
            "Find Over 250+ Exams in India",
          ])
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching hero data:", error)
        }
        // Fallback to default texts
        setRotatingTexts([
          "Find Over 4 Lakh Reviews in India",
          "Find Over 11000+ Courses in India",
          "Find Over 25000+ Colleges in India",
          "Find Over 250+ Exams in India",
        ])
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      abortController.abort()
      clearTimeout(timeoutId)
    }

    // Fetch study goals - defer to not block critical rendering
    const fetchStudyGoals = async () => {
      try {
        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleFetch = () => {
          fetch("/api/study-goals")
            .then(response => {
              if (response.ok) {
                return response.json()
              }
              return { studyGoals: [] }
            })
            .then(data => {
              setStudyGoalsData(data.studyGoals || [])
            })
            .catch(error => {
              console.error("Error fetching study goals:", error)
            })
        }

        if ('requestIdleCallback' in window) {
          requestIdleCallback(scheduleFetch, { timeout: 2000 })
        } else {
          setTimeout(scheduleFetch, 1000)
        }
      } catch (error) {
        console.error("Error fetching study goals:", error)
      }
    }
    fetchStudyGoals()
  }, [])

  // Rotate background slides every 5 seconds
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length, isPaused])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const currentSlide = slides[currentIndex] || null
  const defaultImage = "/images/college-hero-default.jpg"

  return (
    <>
      <section
        className="relative w-full h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center overflow-hidden"
        style={{
          contain: 'layout style',
          minHeight: '450px',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0" style={{ contain: 'strict' }}>
          {slides.length > 0 ? (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                  }`}
                style={{ willChange: 'opacity' }}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || "College campus"}
                  fill
                  className="object-cover"
                  priority={index === currentIndex || index === (currentIndex + 1) % slides.length}
                  quality={90}
                  sizes="100vw"
                  fetchPriority={index === currentIndex ? "high" : "auto"}
                  style={{ transform: 'translateZ(0)' }} // Force GPU acceleration
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (target) target.style.display = 'none'
                  }}
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <TypewriterHeader rotatingTexts={rotatingTexts} />

            <p className="text-sm sm:text-base md:text-xl text-blue-100/90 mb-8 max-w-2xl mx-auto font-medium tracking-wide drop-shadow-lg min-h-[1.5rem]">
              {slides.length > 0 && slides[currentIndex]?.subtitle
                ? slides[currentIndex].subtitle
                : "Discover the best colleges and courses for your future"}
            </p>

            {/* Search Bar - Glass Morphism */}
            <div className="mb-10 transform transition-all duration-500 hover:scale-[1.01]">
              <div className="glass-morphism p-2 sm:p-3 rounded-2xl flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto backdrop-blur-xl border-white/20 shadow-2xl">
                <div className="flex-1 relative group">
                  <SearchAutocomplete
                    placeholder="Search for colleges, exams, courses and more.."
                    size="lg"
                    onSearch={(query) => setSearchQuery(query)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all duration-300"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="flex justify-center gap-4 animate-bounce-slow">
              <Link href="/career-counseling">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:border-white/50"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Get Expert Guidance
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Select Your Study Goal Section */}
      {studyGoalsData.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium text-sm">Explore Categories</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 leading-tight">
                Select Your Study Goal
              </h2>
              <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
                Find Colleges and Courses in India
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {studyGoalsData.map((goal, index) => {
                // Different gradient colors for each card
                const gradients = [
                  "from-blue-500 to-cyan-600",
                  "from-indigo-500 to-purple-600",
                  "from-violet-500 to-purple-600",
                  "from-teal-500 to-emerald-600",
                  "from-sky-500 to-blue-600",
                  "from-purple-500 to-pink-600",
                  "from-rose-500 to-pink-600",
                ]
                const gradient = gradients[index % gradients.length]

                return (
                  <Link key={goal.id} href={goal.link}>
                    <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-slate-200 bg-white overflow-hidden group">
                      <CardContent className="p-0">
                        {/* Card Header with Gradient */}
                        <div className={`bg-gradient-to-br ${gradient} p-6 relative`}>
                          <div className="absolute top-4 right-4 opacity-20">
                            {iconMap[goal.icon] || <GraduationCap className="h-16 w-16 text-white" />}
                          </div>
                          <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                              <div className="text-white">
                                {iconMap[goal.icon] || <GraduationCap className="h-8 w-8" />}
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                              {goal.name}
                            </h3>
                            {goal.collegeCount && (
                              <p className="text-white/90 text-sm font-medium">{goal.collegeCount}</p>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          <ul className="space-y-3 mb-6">
                            {(goal.courses || []).slice(0, 3).map((course, courseIndex) => (
                              <li key={courseIndex} className="text-sm text-gray-700 flex items-center gap-2 group-hover:text-gray-900 transition-colors">
                                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`}></div>
                                <span>{course}</span>
                              </li>
                            ))}
                            {(goal.courses || []).length > 3 && (
                              <li className="text-xs text-gray-500 italic">
                                +{goal.courses.length - 3} more courses
                              </li>
                            )}
                          </ul>

                          {/* CTA Button */}
                          <div className={`flex items-center justify-between bg-gradient-to-r ${gradient} text-white px-4 py-3 rounded-lg font-semibold text-sm group-hover:shadow-lg transition-all duration-300`}>
                            <span>Explore</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

