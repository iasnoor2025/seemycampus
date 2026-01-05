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

  if (isDashboard || isAuth) {
    return <>{children}</>
  }

  return (
    <div className="overflow-x-hidden">
      <TopBar />
      <HeaderClient />
      <main className="overflow-x-hidden">{children}</main>
      <SocialIcons />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

