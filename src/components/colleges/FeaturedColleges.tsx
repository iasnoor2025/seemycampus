"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, GraduationCap, ArrowRight, Star } from "lucide-react"

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
        
        {/* Category Navigation Tabs - Modern Design */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {(Object.keys(categoryMap) as CollegeCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-100 shadow-md border border-slate-200"
              }`}
            >
              <span className="mr-2">{categoryIcons[category]}</span>
              {categoryMap[category]}
            </button>
          ))}
        </div>

        {/* Colleges Grid - Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
              <div className="animate-pulse">
                <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-48 mx-auto"></div>
              </div>
            </div>
          ) : displayedColleges.length > 0 ? (
            displayedColleges.map((college, index) => (
              <div
                key={college.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group border border-slate-100"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Card Header with Logo */}
                <div className={`bg-gradient-to-br ${getCardGradient(index)} p-6 relative`}>
                  <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/50">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      <span className="text-white text-sm font-bold">4.{Math.floor(Math.random() * 5) + 5}</span>
                    </div>
                  </div>
                  <div className={`w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden relative`} style={{ aspectRatio: '1/1' }}>
                    {college.images && Array.isArray(college.images) && college.images.length > 0 && !imageErrors.has(college.id) ? (
                      <Image
                        src={college.images[0]}
                        alt={`${college.name} logo`}
                        width={80}
                        height={80}
                        sizes="80px"
                        className="object-contain p-1"
                        loading="lazy"
                        quality={75}
                        decoding="async"
                        style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                        onError={() => {
                          setImageErrors(prev => new Set(prev).add(college.id))
                        }}
                      />
                    ) : (
                      <span className={`${getCardTextColor(index)} font-bold text-lg`}>
                        {getInitials(college.name)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {college.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-5">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{college.location || "India"}</span>
                  </div>

                  {/* Action Button */}
                  <Link href={`/colleges/${college.slug}`}>
                    <Button 
                      className={`w-full bg-gradient-to-r ${getCardGradient(index)} hover:opacity-90 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group/btn`}
                    >
                      <span>Explore College</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
              <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">
                No colleges found in this category.
              </p>
            </div>
          )}
        </div>

        {/* SEE MORE / HIDE ALL Button */}
        {colleges.length > 5 && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowAll(!showAll)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {showAll ? (
                <>
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <span>View All {colleges.length} Colleges</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

