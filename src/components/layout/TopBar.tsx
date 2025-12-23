"use client"

import { ChevronUp } from "lucide-react"

export function TopBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="bg-red-600 text-white py-2 text-sm relative overflow-x-hidden w-full">
      <div className="w-full px-4 relative overflow-x-hidden">
        <p className="text-center">
        For admissions or other details, call us on{" "}
        <a href="tel:+918960147776" className="font-semibold hover:underline">
          +91-8960147776
        </a>
      </p>
        <button
          onClick={scrollToTop}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

