"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Search, Menu, X, ChevronRight, ChevronDown } from "lucide-react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collegesExpanded, setCollegesExpanded] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setCollegesExpanded(false)
    setExpandedCategoryId(null)
  }, [pathname])

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

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const displayCategories = loading ? [] : categories
  
  // Get courses for hovered category
  const hoveredCategoryData = displayCategories.find(cat => cat.name === hoveredCategory)
  const coursesToShow = hoveredCategoryData?.courses || []

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/about", label: "ABOUT US" },
    { href: "/compare", label: "COMPARE" },
    { href: "/academic-alliance", label: "ALLIANCE" },
    { href: "/career-counseling", label: "COUNSELING" },
    { href: "/scholarships", label: "SCHOLARSHIPS" },
    { href: "/events", label: "EVENTS" },
    { href: "/blog", label: "BLOG" },
    { href: "/essay-assistant", label: "ESSAY AI" },
    { href: "/career-path", label: "CAREER PATH" },
    { href: "/entrance-exams", label: "TIMELINE" },
    { href: "/fee-calculator", label: "FEE CALC" },
    { href: "/contact", label: "CONTACT" },
  ]

  return (
    <>
      <header className="bg-[#18254a] text-white sticky top-0 z-50 shadow-lg w-full">
        <div className="w-full px-3 lg:px-4">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-white">
              <Link 
                href="/" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2"
              >
                HOME
              </Link>
              
              <Link 
                href="/about" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2"
              >
                ABOUT
              </Link>
              
              {/* Colleges Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap bg-transparent text-white hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-red-400 h-auto py-0 px-2"
                    >
                      COLLEGES
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex">
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
                                      ? "bg-[#18254a] text-white" 
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
                        
                        <ul 
                          className={cn(
                            "w-[250px] max-h-[400px] overflow-y-auto transition-opacity duration-150",
                            hoveredCategory && coursesToShow.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
                          )}
                          onMouseEnter={() => {
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
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Link href="/compare" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                COMPARE
              </Link>
              
              <Link href="/academic-alliance" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                ALLIANCE
              </Link>
              
              <Link href="/career-counseling" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                COUNSEL
              </Link>
              
              <Link href="/scholarships" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                SCHOLARSHIPS
              </Link>
              
              <Link href="/entrance-exams" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                TIMELINE
              </Link>
              
              <Link href="/fee-calculator" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                FEE CALC
              </Link>
              
              <Link href="/contact" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                CONTACT
              </Link>
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                className="w-9 h-9 border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
              
              <a 
                href="tel:+918960147776" 
                className="flex items-center overflow-hidden rounded-full hover:opacity-90 transition-opacity shadow-md"
                aria-label="Call Now"
              >
                <div className="bg-red-600 px-3 py-2 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-4 py-2 flex items-center">
                  <span className="text-gray-800 font-semibold text-xs uppercase tracking-wide">
                    CALL NOW
                  </span>
                </div>
              </a>
              
              <HeaderAuthButton />
            </div>

            {/* Mobile Right Side */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Call Button - Mobile */}
              <a 
                href="tel:+918960147776" 
                className="flex items-center overflow-hidden rounded-full hover:opacity-90 transition-opacity shadow-md"
                aria-label="Call Now"
              >
                <div className="bg-red-600 px-2.5 py-1.5 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-2.5 py-1.5 flex items-center">
                  <span className="text-gray-800 font-semibold text-[10px] uppercase tracking-wide">
                    CALL
                  </span>
                </div>
              </a>
              
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div 
        className={cn(
          "fixed top-14 right-0 w-[280px] h-[calc(100vh-56px)] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-xl",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="py-4">
          {/* Auth Button at top */}
          <div className="px-4 pb-4 border-b border-gray-200">
            <HeaderAuthButton />
          </div>

          {/* Navigation Links */}
          <ul className="py-2">
            {navLinks.slice(0, 2).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setCollegesExpanded(false)
                    setExpandedCategoryId(null)
                  }}
                  className="block px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {/* Colleges with Expandable Categories */}
            <li>
              <button
                onClick={() => {
                  setCollegesExpanded(!collegesExpanded)
                  if (collegesExpanded) {
                    setExpandedCategoryId(null)
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                <span>COLLEGES</span>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-400 transition-transform",
                  collegesExpanded && "rotate-180"
                )} />
              </button>
              
              {collegesExpanded && (
                <ul className="bg-gray-50">
                  {displayCategories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setExpandedCategoryId(
                          expandedCategoryId === category.id ? null : category.id
                        )}
                        className="w-full flex items-center justify-between px-6 py-2.5 text-gray-700 text-sm hover:bg-gray-100 transition-colors"
                      >
                        <span>{category.name}</span>
                        {category.courses && category.courses.length > 0 && (
                          <ChevronRight className={cn(
                            "h-4 w-4 text-gray-400 transition-transform",
                            expandedCategoryId === category.id && "rotate-90"
                          )} />
                        )}
                      </button>
                      
                      {expandedCategoryId === category.id && category.courses && category.courses.length > 0 && (
                        <ul className="bg-gray-100">
                          {category.courses.map((course, idx) => (
                            <li key={idx}>
                              <Link
                                href={course.href}
                                onClick={() => {
                                  setMobileMenuOpen(false)
                                  setCollegesExpanded(false)
                                  setExpandedCategoryId(null)
                                }}
                                className="block px-8 py-2 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                              >
                                {course.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            
            {navLinks.slice(2).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setCollegesExpanded(false)
                    setExpandedCategoryId(null)
                  }}
                  className="block px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search at bottom */}
          <div className="px-4 pt-4 border-t border-gray-200">
            <Link
              href="/colleges"
              onClick={() => {
                setMobileMenuOpen(false)
                setCollegesExpanded(false)
                setExpandedCategoryId(null)
              }}
              className="flex items-center gap-2 px-4 py-3 bg-[#18254a] text-white rounded-lg hover:bg-[#0f1a33] transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="font-medium">Search Colleges</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
