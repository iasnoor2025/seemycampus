import { Metadata } from "next"
import { CollegeComparison } from "@/components/colleges/CollegeComparison"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Compare Colleges | SeeMyCampus",
  description: "Compare multiple colleges side-by-side. Compare fees, rankings, courses, placements, and more to make an informed decision.",
  keywords: ["compare colleges", "college comparison", "college fees comparison", "college ranking comparison", "education comparison"],
  openGraph: {
    title: "Compare Colleges | SeeMyCampus",
    description: "Compare multiple colleges side-by-side. Compare fees, rankings, courses, placements, and more.",
    url: `${baseUrl}/compare`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "Compare Colleges - SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Colleges | SeeMyCampus",
    description: "Compare multiple colleges side-by-side to make an informed decision.",
  },
  alternates: {
    canonical: `${baseUrl}/compare`,
  },
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 relative z-10">
        <div className="mb-6 sm:mb-8">
          <Link href="/colleges">
            <Button variant="ghost" className="mb-4 sm:mb-6 text-sm hover:bg-white/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Colleges
            </Button>
          </Link>
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-sm">Smart Comparison Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Compare Colleges
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Select up to 4 colleges to compare side-by-side and make an informed decision
            </p>
          </div>
        </div>

        <CollegeComparison />
      </div>
    </div>
  )
}

