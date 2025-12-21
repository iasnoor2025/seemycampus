import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TopBar } from "@/components/layout/TopBar"
import { HeaderClient } from "@/components/layout/HeaderClient"
import { Footer } from "@/components/layout/Footer"
import { SocialIcons } from "@/components/layout/SocialIcons"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SeeMyCampus - Find Your Perfect College",
  description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
  keywords: ["college admissions", "course finder", "education counseling", "college recommendations", "MBA", "BBA", "Engineering", "Medical", "Law", "Design"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopBar />
        <HeaderClient />
        <main>{children}</main>
        <SocialIcons />
        <Footer />
      </body>
    </html>
  )
}
