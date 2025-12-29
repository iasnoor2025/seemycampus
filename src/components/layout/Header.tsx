"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Search, Menu, X, ChevronRight, ChevronDown } from "lucide-react"
import { Logo } from "./Logo"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { isPathEnabledClient } from "@/lib/client-feature-flags"

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

  const [enabledLinks, setEnabledLinks] = useState<Set<string>>(new Set())
  const [linksLoading, setLinksLoading] = useState(true)

  const allNavLinks = [
    { href: "/", label: "HOME" },
    { href: "/about", label: "ABOUT US" },
    { href: "/compare", label: "COMPARE" },
    { href: "/admission-predictor", label: "PREDICTOR" },
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

  // Check which links are enabled
  useEffect(() => {
    let isMounted = true
    
    const checkLinks = async () => {
      const enabled = new Set<string>()
      
      // Always enable home and contact
      enabled.add("/")
      enabled.add("/contact")
      
      // Check all other links
      const checkPromises = allNavLinks
        .filter(link => link.href !== "/" && link.href !== "/contact")
        .map(async (link) => {
          try {
            const isEnabled = await isPathEnabledClient(link.href)
            if (isMounted && isEnabled === true) {
              enabled.add(link.href)
            }
            // If isEnabled is false, don't add to enabled set (link will be hidden)
          } catch (error) {
            console.error(`Error checking feature flag for ${link.href}:`, error)
            // On error, don't add the link (fail closed for disabled features)
          }
        })
      
      // Wait for all checks to complete
      await Promise.all(checkPromises)
      
      if (isMounted) {
        setEnabledLinks(enabled)
        setLinksLoading(false)
      }
    }
    
    checkLinks()
    
    // Re-check links periodically (in case feature flags were updated)
    const interval = setInterval(() => {
      if (isMounted) {
        checkLinks()
      }
    }, 10000) // Check every 10 seconds for faster updates
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, []) // Only run on mount, not on pathname change

  // Filter nav links based on feature flags
  const navLinks = allNavLinks.filter(link => enabledLinks.has(link.href))

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
              {/* Always show HOME */}
              <Link 
                href="/" 
                className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2"
              >
                HOME
              </Link>
              
              {/* Show ABOUT only if enabled - check directly */}
              {!linksLoading && enabledLinks.has("/about") ? (
                <Link 
                  href="/about" 
                  className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2"
                >
                  ABOUT
                </Link>
              ) : null}
              
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
              
              {/* Render remaining enabled links (excluding HOME, ABOUT, CONTACT, and COLLEGES which are handled separately) */}
              {!linksLoading && allNavLinks
                .filter(link => {
                  // Exclude links that are handled separately
                  if (link.href === "/" || 
                      link.href === "/about" || 
                      link.href === "/contact" ||
                      link.href === "/colleges") {
                    return false
                  }
                  // Only show if explicitly enabled in enabledLinks set
                  return enabledLinks.has(link.href)
                })
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2"
                  >
                    {link.label === "ABOUT US" ? "ABOUT" : link.label}
                  </Link>
                ))}
              
              {/* Always show CONTACT */}
              {!linksLoading && (
                <Link href="/contact" className="hover:text-red-400 transition-colors font-medium text-xs xl:text-sm uppercase tracking-wide whitespace-nowrap px-2">
                  CONTACT
                </Link>
              )}
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

          {/* Navigation Links */}
          <ul className="py-2">
            {/* HOME - always show */}
            <li>
              <Link
                href="/"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setCollegesExpanded(false)
                  setExpandedCategoryId(null)
                }}
                className="block px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                HOME
              </Link>
            </li>
            
            {/* ABOUT - only if enabled */}
            {!linksLoading && enabledLinks.has("/about") && (
              <li>
                <Link
                  href="/about"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setCollegesExpanded(false)
                    setExpandedCategoryId(null)
                  }}
                  className="block px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  ABOUT US
                </Link>
              </li>
            )}
            
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
            
            {/* Mobile menu links - filter out HOME, ABOUT, CONTACT and only show enabled links */}
            {!linksLoading && allNavLinks
              .filter(link => {
                // Exclude HOME, ABOUT, and CONTACT (handled separately or always shown)
                if (link.href === "/" || link.href === "/about" || link.href === "/contact") {
                  return false
                }
                // Only show if explicitly enabled in enabledLinks
                return enabledLinks.has(link.href)
              })
              .map((link) => (
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
            
            {/* Always show CONTACT in mobile menu */}
            {!linksLoading && (
              <li>
                <Link
                  href="/contact"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setCollegesExpanded(false)
                    setExpandedCategoryId(null)
                  }}
                  className="block px-4 py-3 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  CONTACT
                </Link>
              </li>
            )}
          </ul>

          {/* Search at bottom */}
          {enabledLinks.has("/colleges") && (
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
          )}
        </nav>
      </div>
    </>
  )
}
