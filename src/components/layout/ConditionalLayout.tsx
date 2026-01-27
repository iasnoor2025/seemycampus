"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { TopBar } from "./TopBar"
import { HeaderClient } from "./HeaderClient"

// Lazy load below-the-fold components
const Footer = dynamic(() => import("./Footer").then(mod => ({ default: mod.Footer })), {
  ssr: true,
  loading: () => null,
})

const SocialIcons = dynamic(() => import("./SocialIcons").then(mod => ({ default: mod.SocialIcons })), {
  ssr: false,
  loading: () => null,
})

const ScrollToTop = dynamic(() => import("./ScrollToTop").then(mod => ({ default: mod.ScrollToTop })), {
  ssr: false,
  loading: () => null,
})

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")
  const isAuth = pathname?.startsWith("/auth")
  const isAttendanceQR = pathname === "/attendance-qr"

  if (isDashboard || isAuth || isAttendanceQR) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-blue-600/20 selection:text-blue-600">
      <TopBar />
      <HeaderClient />
      <main className="flex-grow relative w-full overflow-x-hidden pt-0 transition-all duration-500">
        {children}
      </main>
      <SocialIcons />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

