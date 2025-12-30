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
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    const fetchMenu = async () => {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController()
        timeoutId = setTimeout(() => {
          controller.abort()
        }, 5000) // 5 second timeout
        
        const response = await fetch("/api/menu", {
          signal: controller.signal,
          cache: 'no-store'
        })
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        if (response.ok && isMounted) {
          const data = await response.json()
          setCategories(data.menu || [])
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching menu:", error)
        }
        // Set empty array on error to prevent infinite loading
        if (isMounted) {
          setCategories([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }
    
    fetchMenu()
    
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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

  // Check which links are enabled - start with all links enabled (fail open)
  useEffect(() => {
    let isMounted = true
    
    // Initialize with all links enabled immediately (fail open approach)
    const initialEnabled = new Set<string>()
    allNavLinks.forEach(link => {
      initialEnabled.add(link.href)
    })
    setEnabledLinks(initialEnabled)
    
    const checkLinks = async () => {
      const enabled = new Set<string>()
      
      // Always enable home and contact
      enabled.add("/")
      enabled.add("/contact")
      
      try {
        // Check all other links - isPathEnabledClient now handles timeouts internally
        // Use Promise.allSettled to not block on individual failures
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
              // Error is already handled in isPathEnabledClient, but add link anyway (fail open)
              if (isMounted) {
                enabled.add(link.href) // Fail open - show link if check fails
              }
            }
          })
        
        // Wait for all checks to complete (non-blocking)
        await Promise.allSettled(checkPromises)
      } catch (error) {
        console.error("Error in checkLinks:", error)
        // On error, enable all links (fail open)
        allNavLinks.forEach(link => {
          if (link.href !== "/" && link.href !== "/contact") {
            enabled.add(link.href)
          }
        })
      }
      
      // Update enabled links after checks complete (non-blocking update)
      if (isMounted) {
        setEnabledLinks(enabled)
      }
    }
    
    // Run checks asynchronously without blocking UI
    checkLinks().catch(() => {
      // Silently handle any errors - links are already shown
    })
    
    // Re-check links periodically (in case feature flags were updated)
    // Increased interval to reduce re-renders
    const interval = setInterval(() => {
      if (isMounted) {
        checkLinks().catch(() => {
          // Silently handle any errors
        })
      }
    }, 60000) // Check every 60 seconds to reduce load
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, []) // Only run on mount, not on pathname change

  // Filter nav links based on feature flags
  const navLinks = allNavLinks.filter(link => enabledLinks.has(link.href))

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white sticky top-0 z-50 shadow-xl border-b border-white/10 w-full backdrop-blur-sm bg-opacity-95">
        <div className="w-full px-3 lg:px-4 xl:px-6">
          <div className="flex items-center justify-between h-16 lg:h-18 max-w-[1920px] mx-auto gap-2">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                }}
                className="flex items-center group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-1.5 group-hover:bg-white/20 transition-all">
                    <Logo size="small" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Scrollable */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-white flex-1 min-w-0 overflow-x-auto scrollbar-hide px-2 justify-center">
              {/* Always show HOME */}
              <Link 
                href="/" 
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                }}
                className={cn(
                  "relative font-medium text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all flex-shrink-0",
                  pathname === "/" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                )}
              >
                HOME
              </Link>
              
              {/* Show ABOUT only if enabled - check directly */}
              {enabledLinks.has("/about") ? (
                <Link 
                  href="/about" 
                  onClick={(e) => {
                    // Ensure navigation works
                    e.stopPropagation()
                  }}
                  className={cn(
                    "relative font-medium text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all flex-shrink-0",
                    pathname === "/about" 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                      : "hover:bg-white/10 text-white/90 hover:text-white"
                  )}
                >
                  ABOUT
                </Link>
              ) : null}
              
              {/* Colleges Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger 
                      className={cn(
                        "font-medium text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap bg-transparent text-white/90 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white h-auto py-1.5 xl:py-2 px-2 xl:px-2.5 rounded-lg transition-all flex-shrink-0"
                      )}
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
                                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                                      : "text-gray-900 hover:bg-blue-50"
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
                                onClick={(e) => {
                                  // Ensure navigation works - stop propagation to prevent NavigationMenu from interfering
                                  e.stopPropagation()
                                }}
                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer font-medium"
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
              {allNavLinks
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
                    onClick={(e) => {
                      // Ensure navigation works
                      e.stopPropagation()
                    }}
                    className={cn(
                      "relative font-medium text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all flex-shrink-0",
                      pathname === link.href 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                        : "hover:bg-white/10 text-white/90 hover:text-white"
                    )}
                  >
                    {link.label === "ABOUT US" ? "ABOUT" : link.label}
                  </Link>
                ))}
              
              {/* Always show CONTACT */}
              <Link 
                href="/contact" 
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                }}
                className={cn(
                  "relative font-medium text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all flex-shrink-0",
                  pathname === "/contact" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                )}
              >
                CONTACT
              </Link>
            </nav>

            {/* Right Side - Desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link
                href="/colleges"
                className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/30 transition-all group"
                aria-label="Search Colleges"
              >
                <Search className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
              </Link>
              
              <a 
                href="tel:+918960147776" 
                className="flex items-center overflow-hidden rounded-lg hover:scale-105 transition-all shadow-lg hover:shadow-xl group"
                aria-label="Call Now"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 xl:px-4 py-2 xl:py-2.5 flex items-center justify-center group-hover:from-blue-700 group-hover:to-indigo-700 transition-all">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white px-3 xl:px-4 py-2 xl:py-2.5 flex items-center">
                  <span className="text-gray-800 font-semibold text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap">
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
                className="flex items-center overflow-hidden rounded-lg hover:scale-105 transition-all shadow-md"
                aria-label="Call Now"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 flex items-center justify-center">
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
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors rounded-lg border border-white/20"
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
          "fixed top-16 right-0 w-[300px] h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-white/10",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="py-4">

          {/* Navigation Links */}
          <ul className="py-4">
            {/* HOME - always show */}
            <li>
              <Link
                href="/"
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                  setMobileMenuOpen(false)
                  setCollegesExpanded(false)
                  setExpandedCategoryId(null)
                }}
                className={cn(
                  "block px-6 py-3 font-medium transition-all rounded-lg mx-2 mb-1",
                  pathname === "/" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                HOME
              </Link>
            </li>
            
            {/* ABOUT - only if enabled */}
            {enabledLinks.has("/about") && (
              <li>
                <Link
                  href="/about"
                  onClick={(e) => {
                    // Ensure navigation works
                    e.stopPropagation()
                    setMobileMenuOpen(false)
                    setCollegesExpanded(false)
                    setExpandedCategoryId(null)
                  }}
                  className={cn(
                    "block px-6 py-3 font-medium transition-all rounded-lg mx-2 mb-1",
                    pathname === "/about" 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
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
                className="w-full flex items-center justify-between px-6 py-3 font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all rounded-lg mx-2 mb-1"
              >
                <span>COLLEGES</span>
                <ChevronDown className={cn(
                  "h-5 w-5 text-white/60 transition-transform",
                  collegesExpanded && "rotate-180"
                )} />
              </button>
              
              {collegesExpanded && (
                <ul className="bg-white/5 backdrop-blur-sm mx-2 rounded-lg border border-white/10">
                  {displayCategories.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setExpandedCategoryId(
                          expandedCategoryId === category.id ? null : category.id
                        )}
                        className="w-full flex items-center justify-between px-6 py-2.5 text-white/80 text-sm hover:bg-white/10 hover:text-white transition-colors rounded-lg"
                      >
                        <span>{category.name}</span>
                        {category.courses && category.courses.length > 0 && (
                          <ChevronRight className={cn(
                            "h-4 w-4 text-white/60 transition-transform",
                            expandedCategoryId === category.id && "rotate-90"
                          )} />
                        )}
                      </button>
                      
                      {expandedCategoryId === category.id && category.courses && category.courses.length > 0 && (
                        <ul className="bg-white/5 backdrop-blur-sm border-t border-white/10">
                          {category.courses.map((course, idx) => (
                            <li key={idx}>
                              <Link
                                href={course.href}
                                onClick={(e) => {
                                  // Ensure navigation works
                                  e.stopPropagation()
                                  setMobileMenuOpen(false)
                                  setCollegesExpanded(false)
                                  setExpandedCategoryId(null)
                                }}
                                className="block px-8 py-2 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors"
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
            {allNavLinks
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
                    onClick={(e) => {
                      // Ensure navigation works
                      e.stopPropagation()
                      setMobileMenuOpen(false)
                      setCollegesExpanded(false)
                      setExpandedCategoryId(null)
                    }}
                    className={cn(
                      "block px-6 py-3 font-medium transition-all rounded-lg mx-2 mb-1",
                      pathname === link.href 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            
            {/* Always show CONTACT in mobile menu */}
            <li>
              <Link
                href="/contact"
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                  setMobileMenuOpen(false)
                  setCollegesExpanded(false)
                  setExpandedCategoryId(null)
                }}
                className={cn(
                  "block px-6 py-3 font-medium transition-all rounded-lg mx-2 mb-1",
                  pathname === "/contact" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                CONTACT
              </Link>
            </li>
          </ul>

          {/* Search at bottom */}
          {enabledLinks.has("/colleges") && (
            <div className="px-4 pt-4 border-t border-white/10">
              <Link
                href="/colleges"
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                  setMobileMenuOpen(false)
                  setCollegesExpanded(false)
                  setExpandedCategoryId(null)
                }}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
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
