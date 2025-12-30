import { getAllColleges } from "@/lib/colleges"
import { Metadata } from "next"
import { Suspense } from "react"
import { CollegesListClient } from "@/components/colleges/CollegesListClient"
import { colleges } from "@/db/schema"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "Browse Colleges in India | 60,000+ Colleges | Admission, Courses, Fees, Rankings | SeeMyCampus",
  description: "Discover top colleges and universities in India. Browse over 60,000 institutions with detailed information about admission process, courses, fees, placements, rankings, and cutoffs. Find the perfect college for your educational journey with expert guidance.",
  keywords: [
    "colleges in India",
    "universities in India",
    "college directory",
    "college search",
    "find college",
    "best colleges",
    "top colleges",
    "college admission",
    "college courses",
    "college fees",
    "college ranking",
    "college placement",
    "college cutoffs",
    "education",
    "admissions",
    "college finder",
    "university search",
    "institute search",
  ],
  openGraph: {
    title: "Browse Colleges in India | 60,000+ Colleges | SeeMyCampus",
    description: "Discover top colleges and universities in India. Browse over 60,000 institutions with detailed information about admission, courses, fees, placements, and rankings.",
    url: `${baseUrl}/colleges`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "Browse Colleges in India - SeeMyCampus",
      },
    ],
    locale: "en_IN",
    siteName: "SeeMyCampus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Colleges in India | 60,000+ Colleges | SeeMyCampus",
    description: "Discover top colleges and universities in India. Browse over 60,000 institutions with detailed information about admission, courses, fees, placements, and rankings.",
    images: [`${baseUrl}/main-logo-xxxx.png`],
  },
  alternates: {
    canonical: `${baseUrl}/colleges`,
  },
}

export default async function CollegesPage() {
  // Handle database errors gracefully during build time
  let collegesList: (typeof colleges.$inferSelect)[] = []
  try {
    collegesList = await getAllColleges()
  } catch (error) {
    // During build time, database might not be available or schema might be incomplete
    // Default to empty array - the client component will handle loading data at runtime
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to fetch colleges during build, will load at runtime:", error)
    }
  }

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

