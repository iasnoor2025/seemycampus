"use client"

import { ChevronUp } from "lucide-react"

export function TopBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  // For "Admissions Open", we typically show the upcoming academic cycle.
  // In Jan-May, we are in the 2025-26 session, but admissions for 2026-27 are opening.
  // In June-Dec, we are definitely in the 2026-27 cycle.
  const academicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`

  return (
    <div className="bg-slate-950 text-white py-2 relative w-full border-b border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 animate-pulse"></div>
      <div className="w-full px-4 relative max-w-[1920px] mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 overflow-hidden">
          <p className="text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white/60 animate-in fade-in slide-in-from-top-1 duration-700">
            <span className="hidden sm:inline">Admissions & Counseling Open {academicYear} • </span>
            <span className="text-blue-400">Expert Guidance: </span>
            <a
              href="tel:+918960147776"
              className="text-white hover:text-blue-400 underline decoration-blue-500/50 underline-offset-4 transition-all"
            >
              +91-8960147776
            </a>
          </p>
        </div>
        <button
          onClick={scrollToTop}
          className="bg-white/5 hover:bg-white/10 rounded-lg p-1.5 transition-all group border border-white/5"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}

