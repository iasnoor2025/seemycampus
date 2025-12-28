"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type CollegeCategory = "management" | "bba" | "medical" | "engineering" | "law" | "design"

interface College {
  id: number
  name: string
  location: string
  slug: string
  category: CollegeCategory
  logo?: string
}

const sampleColleges: College[] = [
  { id: 1, name: "Universal Business School", location: "Mumbai", slug: "universal-business-school", category: "management" },
  { id: 2, name: "Soil Institute of management", location: "Gurgaon", slug: "soil-institute-of-management", category: "management" },
  { id: 3, name: "Ramachandran International Institute of Management", location: "Pune", slug: "ramachandran-international-institute-of-management", category: "management" },
  { id: 4, name: "Institute Of Technology And Management", location: "Mumbai", slug: "institute-of-technology-and-management", category: "management" },
  { id: 5, name: "Fortune institute of international business", location: "Delhi", slug: "fortune-institute-of-international-business", category: "management" },
  { id: 6, name: "Woxsen University", location: "Hydrabad", slug: "woxsen-university", category: "management" },
  { id: 7, name: "ISBR Business School", location: "Bangalore", slug: "isbr-business-school", category: "bba" },
  { id: 8, name: "Birla Institute of Management Technology", location: "Greater Noida", slug: "birla-institute-of-management-technology", category: "bba" },
  { id: 9, name: "BML Munjal University", location: "Haryana", slug: "bml-munjal-university", category: "engineering" },
  { id: 10, name: "IMM Business School", location: "Delhi", slug: "imm-business-school", category: "management" },
  { id: 11, name: "FOSTIIMA Business School", location: "Delhi", slug: "fostiima-business-school", category: "management" },
  { id: 12, name: "ATLAS SkillTech University", location: "Mumbai", slug: "atlas-skilltech-university", category: "management" },
  { id: 13, name: "Shanti Business School", location: "Ahmedabad", slug: "shanti-business-school", category: "management" },
]

const categoryMap: Record<CollegeCategory, string> = {
  management: "Management Colleges",
  bba: "BBA Colleges",
  medical: "Medical Colleges",
  engineering: "Engineering Colleges",
  law: "Law Colleges",
  design: "Design Colleges",
}

export function FeaturedColleges() {
  const [activeCategory, setActiveCategory] = useState<CollegeCategory>("management")
  const [showAll, setShowAll] = useState(false)

  const filteredColleges = sampleColleges.filter(
    (college) => college.category === activeCategory
  )

  const displayedColleges = showAll ? filteredColleges : filteredColleges.slice(0, 5)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4)
  }

  return (
    <section className="py-16 bg-red-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Top Featured Colleges in India - MBA, BBA, Engineering & More</h2>
        
        {/* Category Navigation Tabs */}
        <div className="flex flex-wrap gap-0 mb-0">
          {(Object.keys(categoryMap) as CollegeCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 font-medium text-white transition-colors ${
                activeCategory === category
                  ? "bg-red-800 border-b-4 border-white"
                  : "bg-transparent hover:bg-red-800/50"
              }`}
            >
              {categoryMap[category]}
            </button>
          ))}
        </div>

        {/* Colleges Table */}
        <div className="bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-red-900">
                <th className="px-6 py-4 text-left font-semibold text-white uppercase">PREVIEW</th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase">COLLEGE NAME</th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase">LOCATION</th>
                <th className="px-6 py-4 text-left font-semibold text-white uppercase">VIEW</th>
              </tr>
            </thead>
            <tbody>
              {displayedColleges.length > 0 ? (
                displayedColleges.map((college) => (
                  <tr key={college.id} className="bg-gray-100 border-b border-white">
                    <td className="px-6 py-4">
                      <div className="w-20 h-20 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs text-center p-2">
                        {getInitials(college.name)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{college.name}</td>
                    <td className="px-6 py-4 text-gray-600">{college.location}</td>
                    <td className="px-6 py-4">
                      <Link href={`/colleges/${college.slug}`}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          VIEW MORE
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 bg-gray-100">
                    No colleges found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SEE MORE / HIDE ALL Buttons */}
        {filteredColleges.length > 5 && (
          <div className="mt-8 flex justify-center gap-4">
            {!showAll ? (
              <Button
                onClick={() => setShowAll(true)}
                className="bg-red-900 hover:bg-red-800 text-white border border-white/30 px-8 py-6"
              >
                SEE MORE
              </Button>
            ) : (
              <Button
                onClick={() => setShowAll(false)}
                className="bg-red-900 hover:bg-red-800 text-white border border-white/30 px-8 py-6"
              >
                HIDE ALL
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

