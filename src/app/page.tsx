import { Metadata } from "next"
import { Users } from "lucide-react"
import { FeaturedColleges } from "@/components/colleges/FeaturedColleges"
import { ContactForm } from "@/components/contact/ContactForm"
import { HeroSection } from "@/components/home/HeroSection"
import { TestimonialsSection } from "@/components/home/TestimonialsSection"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "SeeMyCampus - Find Your Perfect College | Admissions Counseling Platform",
  description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses. Find over 60,000 institutions and 375,000+ courses.",
  keywords: ["college admissions", "course finder", "education counseling", "college recommendations", "MBA", "BBA", "Engineering", "Medical", "Law", "Design", "college search India", "admission guidance"],
  openGraph: {
    title: "SeeMyCampus - Find Your Perfect College",
    description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
    url: baseUrl,
    siteName: "SeeMyCampus",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "SeeMyCampus - Find Your Perfect College",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SeeMyCampus - Find Your Perfect College",
    description: "Seemycampus is student's go-to platform providing holistic approach on all aspects of education, simplifying the college selection process for Indian students pursuing undergraduate (UG) and postgraduate (PG) courses.",
    images: [`${baseUrl}/main-logo-xxxx.png`],
  },
  alternates: {
    canonical: baseUrl,
  },
}

export default function Home() {
  return (
    <>
      {/* Hero Section with Search */}
      <HeroSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Top Featured Colleges */}
      <FeaturedColleges />

      {/* FAQ Section - Compact Professional Design */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FAQ Items */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="bg-[#18254a] text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">How do I secure MBA admission?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Gain work experience, ace entrance exams (GMAT/CAT/XAT), and get expert support from Seemycampus.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="bg-[#18254a] text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">What criteria for MBA admission?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Accredited degree, entrance exam scores, work experience, GPA, essays, and interviews.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="bg-[#18254a] text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Steps for MBA admission?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Research schools, build strong profile, prepare for exams, seek guidance from Seemycampus.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="bg-[#18254a] text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">BBA program admission process?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">12th-grade completion required. Submit transcripts, essays, recommendations, and attend interviews.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="bg-[#18254a] text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">How to secure BBA admission?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Requires 12th marks (50-60%), application, documents. Seemycampus covers 60,000+ institutions.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="bg-[#18254a] text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Top BBA colleges for 93%?</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Christ University, Loyola, St. Xavier's, NMIMS, Symbiosis. Get personalized guidance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For More Guidance Section */}
      <section className="py-16 pb-32 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">For More Guidance</h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Image */}
            <div className="relative">
              <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Users className="h-24 w-24 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Guidance Image Placeholder</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
