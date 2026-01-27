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
      <header className="bg-slate-900/80 sticky top-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] w-full backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 max-w-[1920px] mx-auto">
            <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
            <nav className="hidden sm:flex items-center gap-4">
              <div className="h-4 w-16 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-4 w-20 bg-white/5 rounded-lg animate-pulse" />
            </nav>
          </div>
        </div>
      </header>
    )
  }

  return <Header />
}

