"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Search, Menu, X, ChevronRight, ChevronDown, MoreVertical } from "lucide-react"
import { Logo } from "./Logo"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const [visibleLinksCount, setVisibleLinksCount] = useState<number>(100) // Start with high number, will be adjusted
  const [textSize, setTextSize] = useState<string>("text-xs") // Dynamic text size based on space - start with standard size
  const navRef = useRef<HTMLElement>(null)
  const navItemsRef = useRef<HTMLDivElement>(null)
  const isCalculatingRef = useRef<boolean>(false)
  const lastCalculationRef = useRef<{ count: number; size: string }>({ count: 100, size: "text-xs" })
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
      if (window.innerWidth >= 640) {
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
  
  // Get all links that should be in navigation (excluding HOME, ABOUT, COLLEGES, CONTACT which are handled separately)
  const allNavItems = navLinks.filter(link => 
    link.href !== "/" && 
    link.href !== "/about" && 
    link.href !== "/contact" &&
    link.href !== "/colleges"
  )
  
  // Dynamically split links based on available space
  const visibleLinks = allNavItems.slice(0, visibleLinksCount)
  const dropdownLinks = allNavItems.slice(visibleLinksCount)
  
  // Function to check overflow and adjust visible links count
  const checkOverflow = useCallback(() => {
    // Prevent concurrent calculations
    if (isCalculatingRef.current) {
      return
    }
    
    if (!navRef.current || !navItemsRef.current || typeof window === 'undefined') {
      return
    }
    
    // Don't run on mobile
    if (window.innerWidth < 640) {
      return
    }
    
    isCalculatingRef.current = true
    
    const nav = navRef.current
    const navContainer = nav.parentElement
    if (!navContainer) {
      isCalculatingRef.current = false
      return
    }
    
    const rightSide = navContainer.querySelector('[data-right-side]') as HTMLElement
    const logo = navContainer.querySelector('[data-logo]') as HTMLElement
    
    if (!rightSide || !logo) {
      isCalculatingRef.current = false
      // Retry after a short delay if elements aren't ready (only once)
      if (!navItemsRef.current.querySelector('[data-retry-attempted]')) {
        navItemsRef.current.setAttribute('data-retry-attempted', 'true')
        setTimeout(() => {
          navItemsRef.current?.removeAttribute('data-retry-attempted')
          checkOverflow()
        }, 200)
      }
      return
    }
    
    const containerWidth = navContainer.getBoundingClientRect().width
    const logoWidth = logo.getBoundingClientRect().width
    const rightSideWidth = rightSide.getBoundingClientRect().width
    const navLeftMargin = 80 // Increased margin to prevent overlap with logo (ml-4 sm:ml-6 md:ml-8 lg:ml-10 = ~64-80px)
    const padding = 48 // Total horizontal padding
    const availableWidth = containerWidth - logoWidth - rightSideWidth - padding - navLeftMargin
    
    // Measure all navigation items
    const items = Array.from(navItemsRef.current.children) as HTMLElement[]
    if (items.length === 0) return
    
    let totalWidth = 0
    let visibleCount = 0
    const threeDotsWidth = 35 // Estimated width for three dots button
    
    // Start with always visible items (HOME, ABOUT, COLLEGES) - first 3 items
    for (let i = 0; i < Math.min(3, items.length); i++) {
      const width = items[i].getBoundingClientRect().width || 0
      totalWidth += width
      visibleCount++
    }
    
    // Try to fit additional items
    for (let i = 3; i < items.length; i++) {
      const itemWidth = items[i].getBoundingClientRect().width || 0
      if (itemWidth === 0) continue // Skip if item not rendered yet
      
      const remainingItems = allNavItems.length - (visibleCount - 3)
      const needsDropdown = remainingItems > 1
      const estimatedWidth = totalWidth + itemWidth + (needsDropdown ? threeDotsWidth : 0)
      
      if (estimatedWidth <= availableWidth) {
        totalWidth += itemWidth
        visibleCount++
      } else {
        break
      }
    }
    
    // visibleCount includes HOME, ABOUT, COLLEGES (3 items), so subtract those to get nav items count
    const navItemsCount = Math.max(0, visibleCount - 3)
    const newVisibleCount = Math.min(Math.max(0, navItemsCount), allNavItems.length)
    
    // Calculate optimal text size based on available space - using standard sizes
    const calculateTextSize = () => {
      const spaceRatio = availableWidth / (containerWidth * 0.6) // Normalize to container width
      if (spaceRatio > 0.8 && newVisibleCount >= allNavItems.length) {
        return "text-sm" // Standard small size when all items fit
      } else if (spaceRatio > 0.6) {
        return "text-xs" // Extra small
      } else if (spaceRatio > 0.5) {
        return "text-[13px]" // Slightly larger than xs
      } else if (spaceRatio > 0.4) {
        return "text-[12px]" // Standard readable size
      } else if (spaceRatio > 0.3) {
        return "text-[11px]"
      }
      return "text-[10px]" // Minimum readable size
    }
    
    const newTextSize = calculateTextSize()
    
    // Only update if values actually changed to prevent infinite loops
    if (
      lastCalculationRef.current.count !== newVisibleCount ||
      lastCalculationRef.current.size !== newTextSize
    ) {
      lastCalculationRef.current = { count: newVisibleCount, size: newTextSize }
      
      setVisibleLinksCount(newVisibleCount)
      setTextSize(newTextSize)
    }
    
    isCalculatingRef.current = false
  }, [allNavItems.length])
  
  // Check overflow on mount and resize
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Only run on desktop (sm and above)
    const checkIfDesktop = () => window.innerWidth >= 640
    
    if (!checkIfDesktop()) {
      // On mobile, show all items in dropdown
      setVisibleLinksCount(0)
      setTextSize("text-xs")
      return
    }
    
    // Initial check after delays to ensure DOM is ready
    const timeoutId1 = setTimeout(() => {
      if (checkIfDesktop()) checkOverflow()
    }, 100)
    
    const timeoutId2 = setTimeout(() => {
      if (checkIfDesktop()) checkOverflow()
    }, 500)
    
    // Check on resize with debounce
    let resizeTimeout: NodeJS.Timeout
    let lastWidth = window.innerWidth
    const handleResize = () => {
      const currentWidth = window.innerWidth
      // Only recalculate if width changed significantly (more than 50px) to prevent loops
      if (Math.abs(currentWidth - lastWidth) < 50) {
        return
      }
      lastWidth = currentWidth
      
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (checkIfDesktop()) {
          checkOverflow()
        } else {
          if (lastCalculationRef.current.count !== 0 || lastCalculationRef.current.size !== "text-xs") {
            lastCalculationRef.current = { count: 0, size: "text-xs" }
            setVisibleLinksCount(0)
            setTextSize("text-xs")
          }
        }
      }, 200) // Increased debounce time
    }
    
    // Check on resize with throttling
    let lastObservedWidth = 0
    const resizeObserver = new ResizeObserver(() => {
      const currentWidth = window.innerWidth
      // Only trigger if width changed significantly
      if (Math.abs(currentWidth - lastObservedWidth) < 50) {
        return
      }
      lastObservedWidth = currentWidth
      
      if (checkIfDesktop()) {
        handleResize()
      }
    })
    
    if (navRef.current) {
      resizeObserver.observe(navRef.current)
    }
    
    if (navRef.current?.parentElement) {
      resizeObserver.observe(navRef.current.parentElement)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      clearTimeout(resizeTimeout)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [checkOverflow, enabledLinks, navLinks.length])
  
  // Re-check when enabled links change
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 640) return
    
    const timeoutId = setTimeout(() => {
      checkOverflow()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [enabledLinks, checkOverflow])

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white sticky top-0 z-50 shadow-xl border-b border-white/10 w-full backdrop-blur-sm bg-opacity-95">
        <div className="w-full px-3 lg:px-4 xl:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 max-w-[1920px] mx-auto">
            {/* Logo */}
            <div data-logo className="flex-shrink-0 z-10 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] xl:w-[130px] overflow-hidden mr-2 sm:mr-4">
              <Link 
                href="/" 
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                }}
                className="flex items-center group w-full"
              >
                <div className="relative w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-1.5 group-hover:bg-white/20 transition-all">
                    <Logo size="small" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation - Hidden on mobile, show on sm and above */}
            <nav ref={navRef} className="hidden sm:flex items-center gap-0.5 text-white flex-1 min-w-0 overflow-x-auto scrollbar-hide ml-4 sm:ml-6 md:ml-8 lg:ml-10 pr-2 sm:pr-3 md:pr-4 justify-center relative z-10 overflow-visible">
              <div ref={navItemsRef} className="flex items-center gap-0.5 justify-center">
              {/* Always show HOME */}
              <Link 
                href="/" 
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                }}
                  className={cn(
                  `relative font-medium ${textSize} uppercase tracking-tighter whitespace-nowrap px-0.5 sm:px-1 md:px-1.5 lg:px-2 xl:px-2.5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2 rounded transition-all flex-shrink-0`,
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
                    `relative font-medium ${textSize} uppercase tracking-tighter whitespace-nowrap px-0.5 sm:px-1 md:px-1.5 lg:px-2 xl:px-2.5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2 rounded transition-all flex-shrink-0`,
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
                        `font-medium ${textSize} uppercase tracking-tighter whitespace-nowrap bg-transparent text-white/90 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white h-auto py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2 px-0.5 sm:px-1 md:px-1.5 lg:px-2 xl:px-2.5 rounded transition-all flex-shrink-0`
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
              
              {/* Render visible links dynamically based on available space */}
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    // Ensure navigation works
                    e.stopPropagation()
                  }}
                    className={cn(
                      `relative font-medium ${textSize} uppercase tracking-tighter whitespace-nowrap px-0.5 sm:px-1 md:px-1.5 lg:px-2 xl:px-2.5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2 rounded transition-all flex-shrink-0`,
                      pathname === link.href 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                        : "hover:bg-white/10 text-white/90 hover:text-white"
                    )}
                >
                  {link.label === "ABOUT US" ? "ABOUT" : link.label}
                </Link>
              ))}
              
              {/* Three Dots Menu for overflow links */}
              {dropdownLinks.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                      className={cn(
                        `relative font-medium ${textSize} uppercase tracking-tighter whitespace-nowrap px-0.5 sm:px-1 md:px-1.5 lg:px-2 xl:px-2.5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2 rounded transition-all flex-shrink-0 flex items-center justify-center hover:bg-white/10 text-white/90 hover:text-white bg-transparent border-none cursor-pointer`
                      )}
                      aria-label="More menu"
                    >
                      <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="min-w-[180px] bg-slate-800 border-slate-700 z-[100] mt-2">
                    {dropdownLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link
                          href={link.href}
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className={cn(
                            "cursor-pointer text-white/90 hover:text-white hover:bg-white/10",
                            pathname === link.href && "bg-white/10 text-white"
                          )}
                        >
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Always show CONTACT */}
              <Link 
                href="/contact" 
                onClick={(e) => {
                  // Ensure navigation works
                  e.stopPropagation()
                }}
                className={cn(
                  `relative font-medium ${textSize} uppercase tracking-tighter whitespace-nowrap px-0.5 sm:px-1 md:px-1.5 lg:px-2 xl:px-2.5 py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2 rounded transition-all flex-shrink-0`,
                  pathname === "/contact" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                    : "hover:bg-white/10 text-white/90 hover:text-white"
                )}
              >
                CONTACT
              </Link>
              </div>
            </nav>

            {/* Right Side - Desktop */}
            <div data-right-side className="hidden sm:flex items-center gap-2 flex-shrink-0 ml-auto">
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

            {/* Mobile Right Side - Only hamburger on very small screens */}
            <div className="flex sm:hidden items-center gap-2">
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

      {/* Mobile Menu Overlay - Only on very small screens */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out - Only on very small screens */}
      <div 
        className={cn(
          "fixed top-16 right-0 w-[300px] h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white z-50 sm:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-white/10",
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
