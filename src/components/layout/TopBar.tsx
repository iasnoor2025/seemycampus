"use client"

import { ChevronUp } from "lucide-react"

export function TopBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2.5 text-sm relative overflow-x-hidden w-full border-b border-white/10">
      <div className="w-full px-4 relative overflow-x-hidden max-w-7xl mx-auto">
        <p className="text-center text-white/95">
          For admissions or other details, call us on{" "}
          <a href="tel:+918960147776" className="font-semibold hover:text-white underline decoration-2 underline-offset-2 transition-colors">
            +91-8960147776
          </a>
        </p>
        <button
          onClick={scrollToTop}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1 transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

