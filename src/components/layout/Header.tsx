"use client"

import { useState } from "react"
import Link from "next/link"
import { Phone, Search, Home, LogIn } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu } from "@base-ui/react"
import { Logo } from "./Logo"

export function Header() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const categories = [
    {
      name: "MANAGEMENT",
      subcategories: [
        { name: "BBA / BBM COLLEGES", href: "/colleges/management/bba", active: true },
        { name: "MBA / PGDM COLLEGES", href: "/colleges/management/mba", active: false },
      ],
    },
    {
      name: "ENGINEERING",
      subcategories: [
        { name: "B.TECH / B.E COLLEGES", href: "/colleges/engineering/btech", active: true },
      ],
    },
    {
      name: "MEDICAL",
      subcategories: [
        { name: "MBBS COLLEGES", href: "/colleges/medical/mbbs", active: true },
      ],
    },
    {
      name: "DESIGN",
      subcategories: [
        { name: "DESIGNING AND ARCHITECTURE", href: "/colleges/design", active: true },
      ],
    },
    {
      name: "LAW",
      subcategories: [
        { name: "LLB", href: "/colleges/law", active: true },
      ],
    },
  ]

  return (
    <header className="bg-[hsl(210,50%,25%)] text-white sticky top-0 z-50 shadow-lg">
      <div className="w-full">
        {/* Main Header Container */}
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
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-red-400 transition-colors font-medium flex items-center gap-1 text-sm uppercase tracking-wide whitespace-nowrap">
                  COLLEGES
                  <span className="text-[10px] leading-none">▼</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="p-0 min-w-[200px] overflow-visible" 
                  style={{ zIndex: 9999 }}
                >
                  <div className="flex relative" style={{ minHeight: `${categories.length * 40}px` }}>
                    {/* First Level - Categories */}
                    <div className="border-r border-gray-200">
                      {categories.map((category) => {
                        const isHovered = hoveredCategory === category.name
                        return (
                          <div
                            key={category.name}
                            className="relative"
                            style={{ height: '40px' }}
                            onMouseEnter={() => setHoveredCategory(category.name)}
                            onMouseLeave={() => {
                              setTimeout(() => {
                                if (hoveredCategory === category.name) {
                                  setHoveredCategory(null)
                                }
                              }, 200)
                            }}
                          >
                            <Menu.Item
                              className={`px-4 py-2 cursor-pointer transition-colors whitespace-nowrap h-full flex items-center ${
                                isHovered
                                  ? "bg-[hsl(210,50%,25%)] text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <div className="font-medium text-sm uppercase">{category.name}</div>
                            </Menu.Item>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Second Level - Subcategories */}
                    {hoveredCategory && (() => {
                      const hoveredIndex = categories.findIndex(cat => cat.name === hoveredCategory)
                      const topOffset = hoveredIndex * 40
                      const category = categories.find(cat => cat.name === hoveredCategory)
                      
                      return (
                        <div 
                          className="absolute left-full bg-white border border-gray-200 shadow-2xl min-w-[240px]"
                          style={{ 
                            top: `${topOffset}px`,
                            zIndex: 10000,
                            maxHeight: 'none',
                            overflow: 'visible',
                            position: 'absolute'
                          }}
                          onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {category?.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.href}
                              href={subcategory.href}
                              className={`block px-4 py-2.5 transition-colors whitespace-nowrap ${
                                subcategory.active
                                  ? "bg-[hsl(210,50%,25%)] text-white hover:bg-[hsl(210,50%,30%)]"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              <div className="text-sm font-medium uppercase">{subcategory.name}</div>
                            </Link>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
              {/* Search Icon */}
              <button
                className="w-9 h-9 border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            
              {/* Vertical Separator */}
              <div className="h-7 w-[1px] bg-white/40 flex-shrink-0" />
            
              {/* Search Colleges Link */}
              <Link 
                href="/colleges" 
                className="hidden xl:flex items-center gap-2 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap flex-shrink-0"
              >
                <Home className="h-4 w-4" />
                <span>SEARCH COLLEGES</span>
              </Link>
            
              {/* CALL NOW Button */}
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
            
              {/* Admin Login Button */}
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
