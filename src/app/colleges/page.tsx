import { getAllColleges } from "@/lib/colleges"
import { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"
import { ContactForm } from "@/components/contact/ContactForm"
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
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-red-600 flex items-center justify-center">
          <div className="text-white text-xl">Loading colleges...</div>
        </div>
      }>
        <CollegesListClient 
          initialColleges={collegesList} 
          initialTotalCount={collegesList.length}
        />
      </Suspense>

      {/* For More Guidance Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-12 justify-center">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">For More Guidance</h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
            {/* Left Column - Image */}
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/images/guidance-form-image.jpg"
                alt="Student receiving guidance"
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Right Column - Contact Form */}
            <div className="p-4">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

