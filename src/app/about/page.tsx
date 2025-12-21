import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Flag, BookOpen, Lightbulb, GraduationCap, ChevronRight, TrendingUp } from "lucide-react"
import { ContactForm } from "@/components/contact/ContactForm"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About Us | SeeMyCampus",
  description: "Learn more about Seemycampus - your go-to platform for college admissions counseling.",
}

export default function AboutPage() {
  return (
    <>
      {/* Hero Section - About Us Banner */}
      <section className="relative py-20 bg-gradient-to-r from-[hsl(210,50%,25%)] to-[hsl(210,50%,30%)] text-white overflow-hidden">
        {/* Background Image with Blur Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E")` }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-center gap-2 text-white/80 text-sm">
              <Link href="/" className="hover:text-white transition-colors">HOME</Link>
              <ChevronRight className="h-4 w-4" />
              <span>ABOUT US</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
          </div>
        </div>
      </section>

      {/* Main Content Section - Light Gray Patterned Background */}
      <section className="py-16 bg-gray-100" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 20px)`
      }}>
        <div className="container mx-auto px-4">
          {/* Three Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* History Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building className="h-12 w-12 text-gray-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Seemycampus.com is one of the fastest growing education services providers in India today connecting students to colleges and universities from across geographies. As a robust ed-tech company, Seemycampus offers invaluable information to its students demonstrated by 30 thousand sessions across the website and other social media platforms in the year 2021-23.
                </p>
              </CardContent>
            </Card>

            {/* Mission Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Flag className="h-12 w-12 text-gray-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Choosing the best college in the lot is the most crucial step in building the career, the second biggest decision of anyone's life should not go wrong. With the most interactive user interface and most validated content, Seemycampus aspire to be one of the top education portals and help the students in every way in making their decision easier which helps them to nurture their career best and maximize their growth.
                </p>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center relative">
                  <BookOpen className="h-10 w-10 text-gray-600" />
                  <TrendingUp className="h-6 w-6 text-gray-600 absolute -top-1 -right-1" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Seemycampus is the creation with a vision to fulfill and empower students with precise knowledge so that they make a insightful decision while choosing their career to build remarkable footprints to create a exceptional growth towards goals of life. Every student's vision connects with Seemycampus vision to best guide them and make them reach the heights of the dream goals they see in their journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section - Red/Orange Gradient Background */}
      <section className="relative py-16 bg-gradient-to-r from-red-600 to-orange-600 overflow-hidden">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-orange-600/90">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">10+</div>
              <div className="text-sm md:text-base">Years Of Experience</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">9000+</div>
              <div className="text-sm md:text-base">Enrolled students</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">200+</div>
              <div className="text-sm md:text-base">Partnered colleges</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">40+</div>
              <div className="text-sm md:text-base">Seasoned counselors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About us</h2>
            
            {/* Icon - Graduation Cap */}
            <div className="mb-6 flex items-center">
              <GraduationCap className="h-12 w-12 text-[hsl(210,50%,25%)]" />
            </div>

            {/* Sub-heading */}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">About See My Campus</h3>

            {/* Content Card */}
            <Card className="bg-white shadow-md border-0">
              <CardContent className="pt-6">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Seemycampus.com was established to institutionalize student counseling in India. Between 2021 and 2023, 
                    we have counseled over 50,000 students, making us one of India's fastest-growing education service providers. 
                    We connect students to colleges and universities globally.
                  </p>
                  <p>
                    Seemycampus.com is a robust ed-tech platform, offering information demonstrated by 30,000 sessions across 
                    our website and social media in 2021-23. Our objective is to facilitate student recruitment for colleges 
                    and universities across all streams and degrees.
                  </p>
                  <p>
                    Seemycampus.com boasts over 300 partner colleges and lists 3,000 unique colleges on our website, providing 
                    comprehensive information on admissions, entrance tests, infrastructure, courses, and careers. We also offer a 
                    customized student outreach program and assist students with counseling and admission services to help them find 
                    suitable colleges based on their academic background, skill-set, and potential.
                  </p>
                </div>
              </CardContent>
            </Card>
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
            {/* Left Column - Image */}
            <div className="relative">
              <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <GraduationCap className="h-24 w-24 mx-auto mb-4 opacity-50" />
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
