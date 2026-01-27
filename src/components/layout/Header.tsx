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
      <header className="bg-slate-900/80 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] w-full backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="w-full px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 max-w-[1920px] mx-auto">
            {/* Logo */}
            <div data-logo className="flex-shrink-0 z-10 w-[80px] sm:w-[100px] md:w-[120px] transition-all duration-500">
              <Link href="/" onClick={(e) => e.stopPropagation()} className="flex items-center group w-full">
                <div className="relative w-full flex items-center justify-center p-1.5 rounded-2xl bg-white/5 group-hover:bg-white/10 border border-white/5 transition-all duration-300">
                  <Logo size="small" />
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav ref={navRef} className="hidden sm:flex items-center gap-1 text-white flex-1 min-w-0 ml-8 lg:ml-12 overflow-visible relative z-10">
              <div ref={navItemsRef} className="flex items-center gap-1">
                {/* Always show HOME */}
                <Link
                  href="/"
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    `relative font-bold ${textSize} uppercase tracking-widest px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0`,
                    pathname === "/"
                      ? "bg-white text-slate-900 shadow-xl"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  HOME
                </Link>

                {/* Show ABOUT only if enabled */}
                {enabledLinks.has("/about") ? (
                  <Link
                    href="/about"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      `relative font-bold ${textSize} uppercase tracking-widest px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0`,
                      pathname === "/about"
                        ? "bg-white text-slate-900 shadow-xl"
                        : "text-white/60 hover:text-white hover:bg-white/5"
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
                          `p-0 font-bold ${textSize} uppercase tracking-widest whitespace-nowrap bg-transparent text-white/60 hover:bg-white/5 hover:text-white data-[state=open]:bg-white data-[state=open]:text-slate-900 h-auto py-2 px-3 rounded-xl transition-all duration-300 flex-shrink-0 border-none focus:ring-0`
                        )}
                      >
                        COLLEGES
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="flex bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                          <ul className="w-[220px] border-r border-white/5 p-2 space-y-1">
                            {displayCategories.length === 0 ? (
                              <li className="px-4 py-3 text-sm text-slate-400 font-bold uppercase tracking-widest">
                                {loading ? "Scanning..." : "No categories"}
                              </li>
                            ) : (
                              displayCategories.map((category) => (
                                <li
                                  key={category.id}
                                  onMouseEnter={() => setHoveredCategory(category.name)}
                                >
                                  <div
                                    className={cn(
                                      "block px-4 py-3 cursor-pointer transition-all duration-300 text-[10px] font-bold uppercase tracking-widest rounded-xl",
                                      hoveredCategory === category.name
                                        ? "bg-white text-slate-900 shadow-lg"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{category.name}</span>
                                      {category.courses && category.courses.length > 0 && (
                                        <ChevronRight className={cn(
                                          "w-3.5 h-3.5 transition-transform duration-300",
                                          hoveredCategory === category.name ? "translate-x-1" : "opacity-30"
                                        )} />
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>

                          <ul
                            className={cn(
                              "w-[280px] max-h-[450px] overflow-y-auto p-2 space-y-1 scrollbar-hide transition-all duration-300",
                              hoveredCategory && coursesToShow.length > 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                            )}
                          >
                            <div className="px-4 py-2 mb-2">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Specialized Path</p>
                            </div>
                            {coursesToShow.map((course, index) => (
                              <li key={`${course.href}-${index}`}>
                                <Link
                                  href={course.href}
                                  onClick={(e) => e.stopPropagation()}
                                  className="block px-4 py-3 text-xs font-bold text-white/70 hover:text-white hover:bg-blue-600 rounded-xl transition-all duration-300"
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

                {/* Render visible links dynamically */}
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      `relative font-bold ${textSize} uppercase tracking-widest px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0`,
                      pathname === link.href
                        ? "bg-white text-slate-900 shadow-xl"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label === "ABOUT US" ? "ABOUT" : link.label}
                  </Link>
                ))}

                {/* Three Dots Menu */}
                {dropdownLinks.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        `relative font-bold ${textSize} uppercase tracking-widest px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0 flex items-center justify-center hover:bg-white/5 text-white/60 hover:text-white bg-transparent border-none cursor-pointer`
                      )}
                      aria-label="More"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={12} className="min-w-[200px] bg-slate-900/95 backdrop-blur-xl border border-white/10 z-[100] p-2 rounded-2xl shadow-2xl">
                      {dropdownLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild>
                          <Link
                            href={link.href}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "cursor-pointer text-white/70 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
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
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    `relative font-bold ${textSize} uppercase tracking-widest px-3 py-2 rounded-xl transition-all duration-300 flex-shrink-0`,
                    pathname === "/contact"
                      ? "bg-white text-slate-900 shadow-xl"
                      : "text-white/60 hover:text-white hover:bg-white/5"
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
                className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
                aria-label="Call Now"
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Phone className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[10px] xl:text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap">
                  Call Now
                </span>
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 sm:hidden animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div
        className={cn(
          "fixed top-0 right-0 w-[85%] max-w-[400px] h-full bg-slate-900/95 backdrop-blur-2xl text-white z-50 sm:hidden transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_50px_rgba(0,0,0,0.5)] border-l border-white/5",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header in Mobile Menu */}
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="w-32">
              <Logo size="small" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <ul className="space-y-2">
              {/* HOME */}
              <li>
                <Link
                  href="/"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setCollegesExpanded(false)
                  }}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300",
                    pathname === "/"
                      ? "bg-white text-slate-900 shadow-2xl"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  HOME
                </Link>
              </li>

              {/* ABOUT */}
              {enabledLinks.has("/about") && (
                <li>
                  <Link
                    href="/about"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setCollegesExpanded(false)
                    }}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300",
                      pathname === "/about"
                        ? "bg-white text-slate-900 shadow-2xl"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    ABOUT
                  </Link>
                </li>
              )}

              {/* COLLEGES */}
              <li>
                <button
                  onClick={() => setCollegesExpanded(!collegesExpanded)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300",
                    collegesExpanded ? "bg-white/5 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>COLLEGES</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    collegesExpanded && "rotate-180"
                  )} />
                </button>

                {collegesExpanded && (
                  <div className="mt-2 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {displayCategories.map((category) => (
                      <div key={category.id} className="space-y-1">
                        <button
                          onClick={() => setExpandedCategoryId(
                            expandedCategoryId === category.id ? null : category.id
                          )}
                          className={cn(
                            "w-full flex items-center justify-between px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                            expandedCategoryId === category.id ? "text-blue-400 bg-blue-500/5" : "text-white/40 hover:text-white"
                          )}
                        >
                          <span>{category.name}</span>
                          {category.courses && category.courses.length > 0 && (
                            <ChevronRight className={cn(
                              "h-3 w-3 transition-transform",
                              expandedCategoryId === category.id && "rotate-90"
                            )} />
                          )}
                        </button>

                        {expandedCategoryId === category.id && category.courses && (
                          <div className="ml-4 space-y-0.5 border-l border-white/5 animate-in slide-in-from-left-2 duration-300">
                            {category.courses.map((course, idx) => (
                              <Link
                                key={idx}
                                href={course.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-6 py-2.5 text-[10px] font-bold text-white/30 hover:text-blue-400 transition-colors uppercase tracking-widest"
                              >
                                {course.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>

              {/* OTHER LINKS */}
              {allNavLinks
                .filter(link => {
                  if (link.href === "/" || link.href === "/about" || link.href === "/contact") return false
                  return enabledLinks.has(link.href)
                })
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300",
                        pathname === link.href
                          ? "bg-white text-slate-900 shadow-2xl"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

              {/* CONTACT */}
              <li>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300",
                    pathname === "/contact"
                      ? "bg-white text-slate-900 shadow-2xl"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>

          <div className="p-6 border-t border-white/5">
            <Link
              href="/colleges"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all"
            >
              <Search className="h-5 w-5" />
              Find Your Campus
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
