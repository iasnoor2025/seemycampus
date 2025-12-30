import { getAllColleges } from "@/lib/colleges"
import { Metadata } from "next"
import { Suspense } from "react"
import { CollegesListClient } from "@/components/colleges/CollegesListClient"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Browse Colleges | SeeMyCampus",
  description: "Discover top colleges and universities. Find the perfect institution for your educational journey. Browse over 60,000 institutions with detailed information.",
  keywords: ["colleges", "universities", "education", "admissions", "college directory", "find college", "college search India"],
  openGraph: {
    title: "Browse Colleges | SeeMyCampus",
    description: "Discover top colleges and universities. Find the perfect institution for your educational journey. Browse over 60,000 institutions with detailed information.",
    url: `${baseUrl}/colleges`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "Browse Colleges - SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Colleges | SeeMyCampus",
    description: "Discover top colleges and universities. Find the perfect institution for your educational journey.",
  },
  alternates: {
    canonical: `${baseUrl}/colleges`,
  },
}

export default async function CollegesPage() {
  const collegesList = await getAllColleges()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 text-xl">Loading colleges...</div>
          </div>
        </div>
      }>
        <CollegesListClient 
          initialColleges={collegesList} 
          initialTotalCount={collegesList.length}
        />
      </Suspense>
    </div>
  )
}

