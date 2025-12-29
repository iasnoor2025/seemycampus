import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { ChevronRight, Home } from "lucide-react"
import { ContactForm } from "@/components/contact/ContactForm"
import { InstagramFeed } from "@/components/home/InstagramFeed"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Contact Us | SeeMyCampus",
  description: "Get in touch with Seemycampus for college admissions counseling and guidance. We're here to help you find your perfect college match.",
  keywords: ["contact seemycampus", "college counseling", "admission help", "student guidance", "education consultation"],
  openGraph: {
    title: "Contact Us | SeeMyCampus",
    description: "Get in touch with Seemycampus for college admissions counseling and guidance. We're here to help you find your perfect college match.",
    url: `${baseUrl}/contact`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "Contact SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | SeeMyCampus",
    description: "Get in touch with Seemycampus for college admissions counseling and guidance.",
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
}

export default function ContactPage() {
  return (
    <>
      {/* Hero Section - Contact Us Banner */}
      <section className="relative py-20 bg-gradient-to-r from-[#18254a] to-[#1e3a5f] text-white overflow-hidden">
        {/* Background Image with Blur Effect - Office Setting */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='600' viewBox='0 0 800 600' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='800' height='600' fill='%23f0f0f0'/%3E%3Cpath d='M200 200 L600 200 L600 400 L200 400 Z' fill='%23d0d0d0'/%3E%3Ccircle cx='400' cy='300' r='50' fill='%23a0a0a0'/%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E")` }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-center gap-2 text-white/80 text-sm">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                HOME
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>ABOUT US</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
          </div>
        </div>
      </section>

      {/* For More Guidance Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <ChevronRight className="h-5 w-5 text-white rotate-90" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">For More Guidance</h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Instagram Feed */}
            <div className="relative">
              <InstagramFeed />
            </div>

            {/* Right Column - Contact Form */}
            <Suspense fallback={<div>Loading form...</div>}>
            <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}

