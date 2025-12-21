import { getAllColleges } from "@/lib/colleges"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContactForm } from "@/components/contact/ContactForm"

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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
}

export default async function CollegesPage() {
  const collegesList = await getAllColleges()

  return (
    <div className="min-h-screen bg-red-600">
      {/* Main Content - White Central Column */}
      <div className="max-w-6xl mx-auto bg-white min-h-screen py-8">
        {/* Page Header */}
        <div className="px-6 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Browse Colleges
          </h1>
          <p className="text-gray-600">
            Explore our comprehensive directory of colleges and universities
          </p>
        </div>

        {/* Table Header */}
        <div className="px-6 mb-4">
          <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-300 font-semibold text-gray-900">
            <div className="col-span-2 text-center">PREVIEW</div>
            <div className="col-span-5">COLLEGE NAME</div>
            <div className="col-span-3">LOCATION</div>
            <div className="col-span-2 text-center">VIEW</div>
          </div>
        </div>

        {/* Colleges List */}
        {collegesList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600">No colleges found. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-0">
            {collegesList.map((college, index) => (
              <div
                key={college.id}
                className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                  index !== collegesList.length - 1 ? "border-b border-gray-200" : ""
                } hover:bg-gray-50 transition-colors`}
              >
                {/* Preview - Logo */}
                <div className="col-span-2 flex justify-center">
                  {college.images && college.images.length > 0 ? (
                    <Image
                      src={college.images[0]}
                      alt={`${college.name} logo`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200">
                      {getInitials(college.name)}
                    </div>
                  )}
                </div>

                {/* College Name */}
                <div className="col-span-5">
                  <h3 className="text-base font-semibold text-gray-900">
                    {college.name}
                  </h3>
                </div>

                {/* Location */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">
                    {college.location || college.city || "Location not specified"}
                  </p>
                </div>

                {/* View Button */}
                <div className="col-span-2 flex justify-center">
                  <Link href={`/colleges/${college.slug}`}>
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {collegesList.length > 20 && (
          <div className="px-6 mt-8 text-center">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
              Load More Colleges
            </Button>
          </div>
        )}
      </div>

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
    </div>
  )
}

