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

    const fetchRotatingTexts = async () => {
      try {
        const response = await fetch("/api/hero-rotating-texts")
        if (response.ok) {
          const data = await response.json()
          const texts = (data.texts || []).map((t: { text: string }) => t.text)
          setRotatingTexts(texts.length > 0 ? texts : ["Find Over 25000+ Colleges in India"])
        }
      } catch (error) {
        console.error("Error fetching rotating texts:", error)
        // Fallback to default texts
        setRotatingTexts([
          "Find Over 4 Lakh Reviews in India",
          "Find Over 11000+ Courses in India",
          "Find Over 25000+ Colleges in India",
          "Find Over 250+ Exams in India",
        ])
      }
    }

    fetchSlides()
    fetchRotatingTexts()

    // Fetch study goals
    const fetchStudyGoals = async () => {
      try {
        const response = await fetch("/api/study-goals")
        if (response.ok) {
          const data = await response.json()
          setStudyGoalsData(data.studyGoals || [])
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
      {/* Hero Section */}
      <section 
        className="relative w-full h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images - All slides for smooth transition */}
        <div className="absolute inset-0">
          {slides.length > 0 ? (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || "College campus"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={85}
                  sizes="100vw"
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
            <div className="relative min-h-[50px] sm:min-h-[60px] md:min-h-[100px] mb-3 sm:mb-4 md:mb-6 flex items-center justify-center px-1">
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.2] sm:leading-tight text-center break-words lg:whitespace-nowrap max-w-full">
                {displayText}
                <span className="animate-pulse">|</span>
              </h1>
            </div>

            {/* Subtitle - Optional, can show slide subtitle if needed */}
            {slides.length > 0 && slides[currentIndex]?.subtitle && (
              <div className="relative min-h-[30px] sm:min-h-[40px] mb-3 sm:mb-4 md:mb-6 flex items-center justify-center px-2">
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
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-base font-semibold rounded-lg shadow-lg whitespace-nowrap"
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
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 text-sm sm:text-base font-semibold rounded-lg shadow-lg"
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
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Select Your Study Goal - Find Colleges and Courses in India
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {studyGoalsData.map((goal) => (
                <Link key={goal.id} href={goal.link}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                          {iconMap[goal.icon] || <GraduationCap className="h-8 w-8" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {goal.name}
                          </h3>
                          {goal.collegeCount && (
                            <p className="text-sm text-gray-600">{goal.collegeCount}</p>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {(goal.courses || []).map((course, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-orange-500" />
                            {course}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center text-orange-600 font-semibold text-sm mt-4">
                        Explore <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

