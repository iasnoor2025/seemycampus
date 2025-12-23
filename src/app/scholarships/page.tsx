import { Metadata } from "next"
import { ScholarshipsListClient } from "@/components/scholarships/ScholarshipsListClient"
import { baseUrl } from "@/lib/seo/generateMeta"

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

export default async function ScholarshipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scholarships for Students
          </h1>
          <p className="text-lg text-gray-600">
            Find financial aid opportunities to support your education journey
          </p>
        </div>
        <ScholarshipsListClient />
      </div>
    </div>
  )
}

