"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Phone, Search, Home, LogIn } from "lucide-react"
import { Logo } from "./Logo"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const menuContentRef = useRef<HTMLDivElement>(null)
  const coursesPanelRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  useEffect(() => {
    if (hoveredCategory && menuContentRef.current) {
      const categoryElement = categoryRefs.current.get(hoveredCategory)
      if (categoryElement && menuContentRef.current) {
        const menuRect = menuContentRef.current.getBoundingClientRect()
        const categoryRect = categoryElement.getBoundingClientRect()
        setMenuPosition({
          top: categoryRect.top - menuRect.top,
          left: 200,
        })
      }
    }
  }, [hoveredCategory])

  const displayCategories = loading ? [] : categories

  return (
    <header className="bg-[hsl(210,50%,25%)] text-white sticky top-0 z-50 shadow-lg">
      <div className="w-full">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 max-w-[1400px] mx-auto">
            {/* Left Section - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
            </div>

            {/* Center Section - Navigation Menu */}
            <nav className="hidden lg:flex items-center justify-center flex-1 gap-4 xl:gap-6 text-white mx-8 xl:mx-12">
              <Link 
                href="/" 
                className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide whitespace-nowrap"
              >
                HOME
              </Link>
              
              <Link 
                href="/about" 
                className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide whitespace-nowrap"
              >
                ABOUT US
              </Link>
              
              {/* Colleges Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide whitespace-nowrap bg-transparent text-white hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-red-400 h-auto py-0">
                      COLLEGES
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="!p-0 w-auto" style={{ overflow: 'visible' }}>
                      <div 
                        ref={menuContentRef}
                        className="flex relative" 
                        style={{ minWidth: '200px', overflow: 'visible' }}
                      >
                        {/* Categories Column */}
                        <div className="w-[200px] flex-shrink-0 border-r border-gray-200 bg-white">
                          {displayCategories.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500">No categories</div>
                          ) : (
                            displayCategories.map((category) => {
                              const isHovered = hoveredCategory === category.name
                              return (
                                <div
                                  key={category.id}
                                  ref={(el) => {
                                    if (el) {
                                      categoryRefs.current.set(category.name, el)
                                    } else {
                                      categoryRefs.current.delete(category.name)
                                    }
                                  }}
                                  className="relative"
                                  style={{ minHeight: '48px' }}
                                  onMouseEnter={() => {
                                    if (hoverTimeoutRef.current) {
                                      clearTimeout(hoverTimeoutRef.current)
                                      hoverTimeoutRef.current = null
                                    }
                                    setHoveredCategory(category.name)
                                  }}
                                  onMouseLeave={() => {
                                    hoverTimeoutRef.current = setTimeout(() => {
                                      setHoveredCategory(null)
                                    }, 300)
                                  }}
                                >
                                  <div
                                    className={`px-4 py-3 cursor-pointer transition-colors ${
                                      isHovered ? "bg-gray-50" : "hover:bg-gray-50"
                                    }`}
                                  >
                                    <div className="font-medium text-sm text-gray-900 uppercase tracking-wide">
                                      {category.name}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                      
                      {/* Courses Panel - Rendered via Portal outside viewport */}
                      {typeof window !== 'undefined' && hoveredCategory && menuPosition && menuContentRef.current && (() => {
                        const category = displayCategories.find(cat => cat.name === hoveredCategory)
                        
                        if (!category) {
                          return null
                        }
                        
                        if (!category.courses || category.courses.length === 0) {
                          return createPortal(
                            <div 
                              className="fixed bg-white border-l border-gray-200 shadow-xl min-w-[220px] px-4 py-3 text-sm text-gray-500 rounded-r-md z-[10001]"
                              style={{
                                left: `${menuContentRef.current.getBoundingClientRect().left + menuPosition.left}px`,
                                top: `${menuContentRef.current.getBoundingClientRect().top + menuPosition.top}px`,
                              }}
                              onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                              onMouseLeave={() => {
                                setTimeout(() => {
                                  setHoveredCategory(null)
                                }, 200)
                              }}
                            >
                              No courses available
                            </div>,
                            document.body
                          )
                        }

                        return createPortal(
                          <div
                            ref={coursesPanelRef}
                            className="fixed bg-white border-l border-gray-200 shadow-xl min-w-[220px] rounded-r-md z-[10001]"
                            style={{
                              left: `${menuContentRef.current.getBoundingClientRect().left + menuPosition.left}px`,
                              top: `${menuContentRef.current.getBoundingClientRect().top + menuPosition.top}px`,
                              maxHeight: '500px',
                              overflowY: 'auto',
                            }}
                            onMouseEnter={() => {
                              if (hoverTimeoutRef.current) {
                                clearTimeout(hoverTimeoutRef.current)
                                hoverTimeoutRef.current = null
                              }
                              setHoveredCategory(hoveredCategory)
                            }}
                            onMouseLeave={() => {
                              hoverTimeoutRef.current = setTimeout(() => {
                                setHoveredCategory(null)
                              }, 300)
                            }}
                          >
                            {category.courses.map((course, index) => (
                              <Link
                                key={`${course.href}-${index}`}
                                href={course.href}
                                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                              >
                                {course.name}
                              </Link>
                            ))}
                          </div>,
                          document.body
                        )
                      })()}
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Link 
                href="/academic-alliance" 
                className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide whitespace-nowrap"
              >
                ACADEMIC ALLIANCE
              </Link>
              
              <Link 
                href="/career-counseling" 
                className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide whitespace-nowrap"
              >
                CAREER COUNCELLING
              </Link>
              
              <Link 
                href="/contact" 
                className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide whitespace-nowrap"
              >
                CONTACT US
              </Link>
            </nav>

            {/* Right Section - Utilities */}
            <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0 ml-auto">
              <button
                className="w-9 h-9 border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            
              <div className="h-7 w-[1px] bg-white/40 flex-shrink-0" />
            
              <Link 
                href="/colleges" 
                className="hidden xl:flex items-center gap-2 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0"
              >
                <Home className="h-4 w-4" />
                <span>SEARCH COLLEGES</span>
              </Link>
            
              <a 
                href="tel:+918960147776" 
                className="flex items-center overflow-hidden rounded-full hover:opacity-90 transition-opacity shadow-md flex-shrink-0"
                aria-label="Call Now"
              >
                <div className="bg-red-600 px-3 py-2.5 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-4 py-2.5 flex items-center">
                  <span className="text-gray-800 font-semibold text-xs uppercase tracking-wide">
                    CALL NOW
                  </span>
                </div>
              </a>
            
              <Link 
                href="/auth/signin"
                className="flex items-center gap-2 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0"
                aria-label="Admin Login"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden xl:inline">ADMIN LOGIN</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
