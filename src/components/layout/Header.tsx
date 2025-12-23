"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Phone, Search, Home, GitCompare } from "lucide-react"
import { Logo } from "./Logo"
import { HeaderAuthButton } from "./HeaderAuthButton"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface MenuCourse {
  name: string
  href: string
}

interface MenuCategory {
  id: number
  name: string
  courses: MenuCourse[]
}

export function Header() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("/api/menu")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.menu || [])
        }
      } catch (error) {
        console.error("Error fetching menu:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  const displayCategories = loading ? [] : categories
  
  // Get courses for hovered category
  const hoveredCategoryData = displayCategories.find(cat => cat.name === hoveredCategory)
  const coursesToShow = hoveredCategoryData?.courses || []

  return (
    <header className="bg-[hsl(210,50%,25%)] text-white sticky top-0 z-50 shadow-lg w-full overflow-x-hidden">
      <div className="w-full overflow-x-hidden">
        <div className="w-full px-2 xl:px-4 overflow-x-hidden">
          <div className="flex items-center h-16 w-full overflow-x-hidden">
            {/* Logo */}
            <div className="flex-shrink-0 absolute left-2 xl:left-4">
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
            </div>

            {/* Navigation Menu - Centered */}
            <nav className="flex items-center justify-center flex-1 gap-2 xl:gap-3 text-white overflow-x-hidden min-w-0 mx-auto">
              <Link 
                href="/" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                HOME
              </Link>
              
              <Link 
                href="/about" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                ABOUT US
              </Link>
              
              {/* Colleges Dropdown - Following shadcn/ui pattern */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap bg-transparent text-white hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-red-400 h-auto py-0 flex-shrink-0 px-1 xl:px-2"
                    >
                      COLLEGES
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      {/* Two-column layout: Categories + Courses */}
                      <div className="flex">
                        {/* Categories Column */}
                        <ul className="w-[200px] border-r border-gray-200">
                          {displayCategories.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-gray-500">
                              {loading ? "Loading..." : "No categories"}
                            </li>
                          ) : (
                            displayCategories.map((category) => (
                              <li 
                                key={category.id}
                                onMouseEnter={() => setHoveredCategory(category.name)}
                              >
                                <div
                                  className={cn(
                                    "block px-4 py-3 cursor-pointer transition-colors text-sm font-medium uppercase tracking-wide",
                                    hoveredCategory === category.name 
                                      ? "bg-[hsl(210,50%,25%)] text-white" 
                                      : "text-gray-900 hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{category.name}</span>
                                    {category.courses && category.courses.length > 0 && (
                                      <span className={cn(
                                        "ml-2",
                                        hoveredCategory === category.name ? "text-white/70" : "text-gray-400"
                                      )}>›</span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                        
                        {/* Courses Column - Shows when hovering a category */}
                        <ul 
                          className={cn(
                            "w-[250px] max-h-[400px] overflow-y-auto transition-opacity duration-150",
                            hoveredCategory && coursesToShow.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                          )}
                          onMouseEnter={() => {
                            // Keep showing courses when hovering over courses panel
                            if (hoveredCategory) {
                              setHoveredCategory(hoveredCategory)
                            }
                          }}
                        >
                          {coursesToShow.map((course, index) => (
                            <li key={`${course.href}-${index}`}>
                              <Link
                                href={course.href}
                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                {course.name}
                              </Link>
                            </li>
                          ))}
                          {coursesToShow.length === 0 && hoveredCategory && (
                            <li className="px-4 py-3 text-sm text-gray-500">
                              No courses available
                            </li>
                          )}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Link 
                href="/compare" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex items-center gap-1 flex-shrink-0 px-1 xl:px-2"
              >
                <GitCompare className="h-4 w-4 flex-shrink-0" />
                COMPARE
              </Link>
              
              <Link 
                href="/academic-alliance" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                ALLIANCE
              </Link>
              
              <Link 
                href="/career-counseling" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                COUNSEL
              </Link>
              
              <Link 
                href="/scholarships" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                SCHOLARSHIPS
              </Link>
              
              <Link 
                href="/fee-calculator" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                FEE CALC
              </Link>
              
              <Link 
                href="/contact" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap flex-shrink-0 px-1 xl:px-2"
              >
                CONTACT
              </Link>
            </nav>

            {/* Right Utilities */}
            <div className="flex items-center gap-1 xl:gap-2 absolute right-2 xl:right-4 flex-shrink-0">
              <button
                className="w-8 h-8 xl:w-9 xl:h-9 border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            
              <div className="h-6 xl:h-7 w-[1px] bg-white/40 flex-shrink-0" />
            
              <Link 
                href="/colleges" 
                className="flex items-center gap-1 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0"
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                SEARCH
              </Link>
            
              <a 
                href="tel:+918960147776" 
                className="flex items-center overflow-hidden rounded-full hover:opacity-90 transition-opacity shadow-md flex-shrink-0"
                aria-label="Call Now"
              >
                <div className="bg-red-600 px-3 py-2 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-3 xl:px-4 py-2 flex items-center">
                  <span className="text-gray-800 font-semibold text-xs uppercase tracking-wide">
                    CALL NOW
                  </span>
                </div>
              </a>
            
              <HeaderAuthButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
