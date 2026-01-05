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
  const [textIndex, setTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)
  const [studyGoalsData, setStudyGoalsData] = useState<StudyGoal[]>([])
  const [rotatingTexts, setRotatingTexts] = useState<string[]>([])

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

  // Initialize display text when rotating texts are loaded
  useEffect(() => {
    if (rotatingTexts.length > 0 && displayText === "") {
      setDisplayText(rotatingTexts[0])
      setCharIndex(rotatingTexts[0].length)
    }
  }, [rotatingTexts.length])

  // Typewriter animation effect
  useEffect(() => {
    if (rotatingTexts.length === 0) return
    
    const currentText = rotatingTexts[textIndex]
    if (!currentText) return
    
    if (!isDeleting && charIndex < currentText.length) {
      // Typing forward
      const timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, 50) // Typing speed
      
      return () => clearTimeout(timeout)
    } else if (!isDeleting && charIndex === currentText.length) {
      // Finished typing, wait then start deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true)
      }, 2000) // Wait 2 seconds before deleting
      
      return () => clearTimeout(timeout)
    } else if (isDeleting && charIndex > 0) {
      // Deleting backward
      const timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      }, 30) // Deleting speed (faster)
      
      return () => clearTimeout(timeout)
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting, move to next text
      setIsDeleting(false)
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length)
    }
  }, [textIndex, charIndex, isDeleting])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const currentSlide = slides[currentIndex] || null
  const defaultImage = "/images/college-hero-default.jpg"
  
  // Default content if no slides
  const defaultTitle = "Find Over 250+ Exams in India"
  const defaultSubtitle = "Discover the best colleges and courses for your future"

  return (
    <>
      {/* Hero Section - Fixed height to prevent layout shift */}
      <section 
        className="relative w-full h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center overflow-hidden"
        style={{ 
          contain: 'layout style paint',
          minHeight: '450px',
          aspectRatio: 'auto'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images - All slides for smooth transition */}
        <div className="absolute inset-0" style={{ contain: 'layout style paint' }}>
          {slides.length > 0 ? (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                }`}
                style={{ willChange: index === currentIndex ? 'opacity' : 'auto' }}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || "College campus"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={index === 0 ? 95 : 90}
                  sizes="100vw"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                  style={{ willChange: index === 0 ? 'auto' : 'opacity' }}
                  onError={(e) => {
                    // Silently handle image errors to prevent 400 errors in console
                    const target = e.target as HTMLImageElement
                    if (target) {
                      target.style.display = 'none'
                    }
                  }}
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-3 sm:px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading - Typewriter animation with delete and type effect */}
            <div 
              className="relative h-[50px] sm:h-[60px] md:h-[100px] mb-3 sm:mb-4 md:mb-6 flex items-center justify-center px-1" 
              style={{ 
                aspectRatio: 'auto',
                minHeight: '50px',
                contain: 'layout'
              }}
            >
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.2] sm:leading-tight text-center break-words lg:whitespace-nowrap max-w-full">
                <span className="inline-block min-w-[1ch]" style={{ minWidth: '1ch' }}>{displayText || '\u00A0'}</span>
                <span className="animate-pulse">|</span>
              </h1>
            </div>

            {/* Subtitle - Optional, can show slide subtitle if needed */}
            {slides.length > 0 && slides[currentIndex]?.subtitle && (
              <div className="relative h-[30px] sm:h-[40px] mb-3 sm:mb-4 md:mb-6 flex items-center justify-center px-2" style={{ aspectRatio: 'auto' }}>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 transition-opacity duration-500">
                  {slides[currentIndex].subtitle}
                </p>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-3xl mx-auto">
                <div className="flex-1">
                  <SearchAutocomplete
                    placeholder="Search for colleges, exams, courses and more.."
                    size="lg"
                    onSearch={(query) => setSearchQuery(query)}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-base font-semibold rounded-lg shadow-lg whitespace-nowrap"
                  style={{ color: '#ffffff' }}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Expert Guidance Button */}
            <div className="flex justify-center">
              <Link href="/career-counseling">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-base font-semibold rounded-lg shadow-lg"
                  style={{ color: '#ffffff' }}
                >
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

