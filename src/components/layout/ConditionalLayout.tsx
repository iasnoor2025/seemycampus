"use client"

import { usePathname } from "next/navigation"
import { TopBar } from "./TopBar"
import { HeaderClient } from "./HeaderClient"
import { Footer } from "./Footer"
import { SocialIcons } from "./SocialIcons"
import { ScrollToTop } from "./ScrollToTop"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")

  if (isDashboard) {
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

