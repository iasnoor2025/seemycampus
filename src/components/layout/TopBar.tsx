"use client"

import { ChevronUp } from "lucide-react"

export function TopBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 sm:py-2.5 text-xs sm:text-sm relative w-full border-b border-white/10">
      <div className="w-full px-3 sm:px-4 relative max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-center text-white/95 flex-1 px-8 sm:px-12 md:px-16">
          <span className="whitespace-nowrap">For admissions or other details, call us on{" "}</span>
          <a 
            href="tel:+918960147776" 
            className="font-semibold hover:text-white underline decoration-2 underline-offset-2 transition-colors whitespace-nowrap"
          >
            +91-8960147776
          </a>
        </p>
        <button
          onClick={scrollToTop}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all flex-shrink-0"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  )
}

