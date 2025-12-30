import { Metadata } from "next"
import { redirect } from "next/navigation"
import { ScholarshipsListClient } from "@/components/scholarships/ScholarshipsListClient"
import { baseUrl } from "@/lib/seo/generateMeta"
import { isFeatureEnabled } from "@/lib/featureFlags"

export const metadata: Metadata = {
  title: "Scholarships for Indian Students | Find Financial Aid",
  description:
    "Discover scholarships for Indian students pursuing undergraduate and postgraduate courses. Find merit-based, need-based, and course-specific scholarships.",
  keywords: [
    "scholarships",
    "financial aid",
    "student scholarships",
    "merit scholarships",
    "need-based scholarships",
    "India scholarships",
  ],
  openGraph: {
    title: "Scholarships for Indian Students | SeeMyCampus",
    description:
      "Discover scholarships for Indian students pursuing undergraduate and postgraduate courses.",
    url: `${baseUrl}/scholarships`,
  },
  alternates: {
    canonical: `${baseUrl}/scholarships`,
  },
}

import { Award } from "lucide-react"

export default async function ScholarshipsPage() {
  // Check if scholarships page is enabled
  // Fail open: if feature flag check fails (e.g., during build when DB isn't available), show the page
  let isEnabled = true
  try {
    isEnabled = await isFeatureEnabled("public_scholarships")
  } catch (error) {
    // During build time, database might not be available
    // Default to enabled to allow static generation
    console.warn("Feature flag check failed, defaulting to enabled:", error)
    isEnabled = true
  }
  
  if (!isEnabled) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <Award className="w-5 h-5" />
              <span className="font-medium text-sm">Financial Aid</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              Scholarships for Students
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Find financial aid opportunities to support your education journey
            </p>
          </div>
        </div>
      </section>

      {/* Scholarships Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <ScholarshipsListClient />
        </div>
      </section>
    </div>
  )
}

