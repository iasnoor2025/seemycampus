"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Search, Home } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "./Logo"

export function Header() {
  return (
    <header className="bg-[hsl(210,50%,25%)] text-white sticky top-0 z-50 shadow-lg">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16 max-w-[1400px] mx-auto">
          {/* Logo - Left Side */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Logo />
          </Link>

          {/* Navigation Links - Center */}
          <nav className="hidden lg:flex items-center gap-8 text-white flex-1 justify-center">
            <Link href="/" className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide">
              HOME
            </Link>
            <Link href="/about" className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide">
              ABOUT US
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:text-red-400 transition-colors font-medium flex items-center gap-1 text-sm uppercase tracking-wide">
                COLLEGES
                <span className="text-[10px] leading-none">▼</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="p-2">
                  <div className="font-semibold mb-2">Management</div>
                  <DropdownMenuItem asChild>
                    <Link href="/colleges/management/bba">BBA / BBM Colleges</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/colleges/management/mba">MBA / PGDM Colleges</Link>
                  </DropdownMenuItem>
                </div>
                <div className="p-2 border-t">
                  <div className="font-semibold mb-2">Engineering</div>
                  <DropdownMenuItem asChild>
                    <Link href="/colleges/engineering/btech">B.Tech / B.E Colleges</Link>
                  </DropdownMenuItem>
                </div>
                <div className="p-2 border-t">
                  <div className="font-semibold mb-2">Medical</div>
                  <DropdownMenuItem asChild>
                    <Link href="/colleges/medical/mbbs">MBBS Colleges</Link>
                  </DropdownMenuItem>
                </div>
                <div className="p-2 border-t">
                  <div className="font-semibold mb-2">Design</div>
                  <DropdownMenuItem asChild>
                    <Link href="/colleges/design">Designing And Architecture</Link>
                  </DropdownMenuItem>
                </div>
                <div className="p-2 border-t">
                  <div className="font-semibold mb-2">Law</div>
                  <DropdownMenuItem asChild>
                    <Link href="/colleges/law">LLB</Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/academic-alliance" className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide">
              ACADEMIC ALLIANCE
            </Link>
            <Link href="/career-counseling" className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide">
              CAREER COUNCELLING
            </Link>
            <Link href="/contact" className="hover:text-red-400 transition-colors font-medium text-sm uppercase tracking-wide">
              CONTACT US
            </Link>
          </nav>

          {/* Right Side Utilities */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search Icon in Square Box */}
            <div className="w-9 h-9 border border-white/40 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
              <Search className="h-4 w-4 text-white" />
            </div>
            
            {/* Vertical Separator */}
            <div className="h-7 w-[1px] bg-white/40" />
            
            {/* Search Colleges with House Icon */}
            <Link href="/colleges" className="flex items-center gap-2 text-white hover:text-red-400 transition-colors text-xs font-medium uppercase tracking-wide whitespace-nowrap">
              <Home className="h-4 w-4" />
              <span>SEARCH COLLEGES</span>
            </Link>
            
            {/* Split CALL NOW Button - Pill Shaped */}
            <a 
              href="tel:+918960147776" 
              className="flex items-center overflow-hidden rounded-full hover:opacity-90 transition-opacity shadow-md"
            >
              {/* Red left part with phone icon */}
              <div className="bg-red-600 px-3 py-2.5 flex items-center justify-center h-full">
                <Phone className="h-4 w-4 text-white" />
              </div>
              {/* White right part with text */}
              <div className="bg-white px-4 py-2.5 flex items-center">
                <span className="text-gray-800 font-semibold text-xs uppercase tracking-wide">CALL NOW</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

