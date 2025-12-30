"use client"

import { useEffect, useState } from "react"
import { Header } from "./Header"

export function HeaderClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder header during SSR
    return (
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white sticky top-0 z-50 shadow-lg backdrop-blur-sm border-b border-white/10">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16 max-w-[1400px] mx-auto">
            <div className="h-16 w-16 bg-white/20 rounded animate-pulse" />
            <nav className="hidden lg:flex items-center gap-8">
              <div className="h-4 w-16 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
            </nav>
          </div>
        </div>
      </header>
    )
  }

  return <Header />
}

