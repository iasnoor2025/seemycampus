import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Flag, BookOpen, Lightbulb, GraduationCap, ChevronRight, TrendingUp, Users, Award, Target, Heart, Sparkles } from "lucide-react"
import { isFeatureEnabled } from "@/lib/featureFlags"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"

export const metadata: Metadata = {
  title: "About Us | SeeMyCampus",
  description: "Learn more about Seemycampus - your go-to platform for college admissions counseling. We've counseled over 50,000 students and connect students to colleges and universities globally.",
  keywords: ["about seemycampus", "education platform", "college counseling", "student guidance", "ed-tech India"],
  openGraph: {
    title: "About Us | SeeMyCampus",
    description: "Learn more about Seemycampus - your go-to platform for college admissions counseling. We've counseled over 50,000 students and connect students to colleges and universities globally.",
    url: `${baseUrl}/about`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/main-logo-xxxx.png`,
        width: 1200,
        height: 630,
        alt: "About SeeMyCampus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | SeeMyCampus",
    description: "Learn more about Seemycampus - your go-to platform for college admissions counseling.",
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
}

export default async function AboutPage() {
  // Check if about page is enabled
  // Fail open: if feature flag check fails (e.g., during build when DB isn't available), show the page
  let isEnabled = true
  try {
    isEnabled = await isFeatureEnabled("public_about")
  } catch (error) {
    // During build time, database might not be available
    // Default to enabled to allow static generation
    console.warn("Feature flag check failed, defaulting to enabled:", error)
    isEnabled = true
  }

  if (!isEnabled) {
    redirect("/")
  }

  const currentYear = new Date().getFullYear()
  const prevYear = currentYear - 1
  const statsYearRange = `2021-${prevYear.toString().slice(-2)}`
  const admissionsYearRange = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`

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
              <Sparkles className="w-5 h-5" />
              <span className="font-medium text-sm">Your Education Partner</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Empowering students to make informed decisions about their future
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section - History, Mission, Vision */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Heart className="w-5 h-5" />
              <span className="font-medium text-sm">Our Story</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Who We Are
            </h2>
          </div>

          {/* Three Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* History Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Seemycampus.com is one of the fastest growing education services providers in India today connecting students to colleges and universities from across geographies. As a robust ed-tech company, Seemycampus offers invaluable information to its students demonstrated by 30 thousand sessions across the website and other social media platforms in the year {statsYearRange}.
                </p>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Mission</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Choosing the best college in the lot is the most crucial step in building the career, the second biggest decision of anyone's life should not go wrong. With the most interactive user interface and most validated content, Seemycampus aspire to be one of the top education portals and help the students in every way in making their decision easier which helps them to nurture their career best and maximize their growth.
                </p>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <CardHeader className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-t-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center relative">
                  <BookOpen className="h-8 w-8 text-white" />
                  <TrendingUp className="h-5 w-5 text-white absolute -top-1 -right-1" />
                </div>
                <CardTitle className="text-white text-xl font-bold text-center">Vision</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  Seemycampus is the creation with a vision to fulfill and empower students with precise knowledge so that they make a insightful decision while choosing their career to build remarkable footprints to create a exceptional growth towards goals of life. Every student's vision connects with Seemycampus vision to best guide them and make them reach the heights of the dream goals they see in their journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Impact</h2>
            <p className="text-white/90">Numbers that speak for themselves</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10+</div>
              <div className="text-sm md:text-base text-white/90">Years Of Experience</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm md:text-base text-white/90">Students Counseled</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">300+</div>
              <div className="text-sm md:text-base text-white/90">Partner Colleges</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">3K+</div>
              <div className="text-sm md:text-base text-white/90">Colleges Listed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium text-sm">Our Journey</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                About See My Campus
              </h2>
            </div>

            {/* Content Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50/30">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-6 text-gray-700 leading-relaxed text-base">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Institutionalizing Student Counseling</p>
                      <p>
                        Seemycampus.com was established to institutionalize student counseling in India. Between 2021 and {prevYear},
                        we have counseled over 50,000 students, making us one of India's fastest-growing education service providers.
                        We connect students to colleges and universities globally.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Robust Ed-Tech Platform</p>
                      <p>
                        Seemycampus.com is a robust ed-tech platform, offering information demonstrated by 30,000 sessions across
                        our website and social media in {statsYearRange}. Our objective is to facilitate student recruitment for colleges
                        and universities across all streams and degrees.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Comprehensive College Information</p>
                      <p>
                        Seemycampus.com boasts over 300 partner colleges and lists 3,000 unique colleges on our website, providing
                        comprehensive information on admissions, entrance tests, infrastructure, courses, and careers. We also offer a
                        customized student outreach program and assist students with counseling and admission services to help them find
                        suitable colleges based on their academic background, skill-set, and potential.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
