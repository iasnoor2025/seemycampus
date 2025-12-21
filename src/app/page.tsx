import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Brain, BookOpen, Briefcase, Stethoscope, Scale, Palette, Calendar, ChevronRight } from "lucide-react"
import Image from "next/image"
import { FeaturedColleges } from "@/components/colleges/FeaturedColleges"
import { ContactForm } from "@/components/contact/ContactForm"
import { HeroSection } from "@/components/home/HeroSection"

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

      {/* Welcome Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Home breadcrumb */}
            <div className="mb-8">
              <Link href="/" className="text-red-600 underline text-sm font-medium">
                Home
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Section - Welcome Content */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  Welcome To Seemycampus
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Seemycampus is student's go-to platform providing holistic approach on all aspects of education, 
                  simplifying the college selection process for Indian students pursuing undergraduate (UG) and 
                  postgraduate (PG) courses. It serves as a comprehensive platform, offering a wide range of reliable 
                  and genuine information on over 60,000 institutions and 375,000+ courses. Our platform caters 
                  specifically to UG/PG students across popular educational streams like MBA/BBA, Engineering, 
                  Medical, Law, Design and more.
                </p>
                <Link href="/about">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gray-800 text-gray-800 bg-white hover:bg-gray-50 font-semibold px-8 py-6"
                  >
                    MORE ABOUT
                  </Button>
                </Link>
              </div>

              {/* Right Section - Features Grid 2x2 */}
              <div className="grid grid-cols-2 gap-6">
                {/* Top Left - Register for weekly Career Updates */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-blue-800" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Register for weekly Career Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Sign up and receive weekly newsletter with career updates, content and tips.
                    </p>
                  </CardContent>
                </Card>

                {/* Top Right - Mind Power Training */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <Brain className="h-12 w-12 text-blue-800" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Mind Power Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Exclusive session on Power of Powers to train your Mind, Body and Soul aligning energies for super successful life
                    </p>
                  </CardContent>
                </Card>

                {/* Bottom Left - Personalized Career Counselling */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-blue-800" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Personalized Career Counselling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Get Psychometric Testing & Video Calling enabled Career Guidance from Experts
                    </p>
                  </CardContent>
                </Card>

                {/* Bottom Right - Alumni Directory */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="w-16 h-16 mb-4 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-blue-800" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Alumni Directory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      We belief in a system that ascribes significance to numbers and their influence on our students.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-12">
            <ChevronRight className="h-8 w-8 text-red-600 rotate-90" />
            <h2 className="text-5xl md:text-6xl font-bold text-white">Testimonials</h2>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Testimonial 1 - Ayushi Singh */}
            <Card className="bg-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      AS
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Aug 22, 2023</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ayushi Singh</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  I am extremely satisfied with the support provided by the Seemycampus. Your guidance and advices significantly contributed to my successful admission into the MBA program. Your personalized approach, assistance, and knowledgeable team made the entire admission process seamless. Thank you!
                </p>
                <Link href="/contact" className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    GET IN TOUCH
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Testimonial 2 - Roshni singh Tomar */}
            <Card className="bg-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      RT
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Aug 22, 2023</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Roshni singh Tomar</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  Seemycampus played an important role grateful for guiding me through the PGDM admission process. Your expertise, insightful knowledge and support helped me to go with the best option of college. I appreciate the team's commitment for students like me to get through the process smoothly.
                </p>
                <Link href="/contact" className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    GET IN TOUCH
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Testimonial 3 - Ankur mishra */}
            <Card className="bg-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                      AM
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Aug 22, 2023</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ankur mishra</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  In my journey of searching good pgdm college seemycampus supports me alot and recommend the best colleges and he never see the timings whenever I have doubt he always there to correct them all, beacuse of him I am in good college. Thaank you very much for your support and guidance!
                </p>
                <Link href="/contact" className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    GET IN TOUCH
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
          </div>
        </div>
      </section>

      {/* Career Streams */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Career Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Briefcase className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Engineering</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• BE</li>
                  <li>• B.Tech</li>
                  <li>• ME</li>
                  <li>• M.Tech</li>
                  <li>• Diploma in Engg.</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <GraduationCap className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• MBA</li>
                  <li>• PGDM</li>
                  <li>• BBA</li>
                  <li>• BBM</li>
                  <li>• Executive MBA</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Stethoscope className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Medical</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• MBBS</li>
                  <li>• PG Medical</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Scale className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Law</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• LLB</li>
                  <li>• LLM</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Palette className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Design</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• B.Des</li>
                  <li>• M.Des</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Featured Colleges */}
      <FeaturedColleges />

      {/* FAQ Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="max-w-5xl mx-auto space-y-6">
            {/* FAQ 01 */}
            <div className="flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[hsl(210,50%,25%)] w-24 flex flex-col items-center justify-between py-6 px-4">
                <span className="text-white text-xs font-semibold">FAQ</span>
                <span className="text-white text-4xl font-bold">01</span>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How do I secure admission into an MBA college?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enhance your MBA admission journey by gaining work experience, acing the GMAT / GRE / CAT / XAT / MAT / ATMA / CMAT / SNAP / NMAT / IIFT and thorough school research. Complete applications meticulously, apply in the first round, and benefit from Seemycampus's expert support for a successful admission process.
                </p>
              </div>
            </div>

            {/* FAQ 02 */}
            <div className="flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[hsl(210,50%,25%)] w-24 flex flex-col items-center justify-between py-6 px-4">
                <span className="text-white text-xs font-semibold">FAQ</span>
                <span className="text-white text-4xl font-bold">02</span>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What criteria are considered for MBA admission?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  For successful MBA admission, meet criteria like accredited degree GMAT/GRE/CAT/XAT/MAT/ATMA/CMAT/SNAP/NMAT/IIFT scores, and work experience. Reputed colleges may add GPA, essays, recommendations, and interviews. Enhance chances with proven track record, resourcefulness, time-management, and realistic expectations. Seek Seemycampus's expert assistance for a smoother admission process.
                </p>
              </div>
            </div>

            {/* FAQ 03 */}
            <div className="flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[hsl(210,50%,25%)] w-24 flex flex-col items-center justify-between py-6 px-4">
                <span className="text-white text-xs font-semibold">FAQ</span>
                <span className="text-white text-4xl font-bold">03</span>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What steps should I follow to gain admission to an MBA course?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Systematically secure MBA admission by researching and selecting aligned schools, building a strong profile with work experience and GMAT/GRE/CAT/XAT/MAT/ATMA/CMAT/SNAP/NMAT/IIFT emphasizing qualities beyond formalities, and seeking guidance from platforms like Seemycampus.
                </p>
              </div>
            </div>

            {/* FAQ 04 */}
            <div className="flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[hsl(210,50%,25%)] w-24 flex flex-col items-center justify-between py-6 px-4">
                <span className="text-white text-xs font-semibold">FAQ</span>
                <span className="text-white text-4xl font-bold">04</span>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is the process for admission to a BBA program?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Reputed BBA programs vary in admission processes. Generally, a recognized 12th-grade completion with minimum percentages suffices. Enhance chances with transcripts, essays, recommendations, interviews, or entrance exams. Platforms like Seemycampus provide current BBA insights.
                </p>
              </div>
            </div>

            {/* FAQ 05 */}
            <div className="flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[hsl(210,50%,25%)] w-24 flex flex-col items-center justify-between py-6 px-4">
                <span className="text-white text-xs font-semibold">FAQ</span>
                <span className="text-white text-4xl font-bold">05</span>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How can I secure admission in a BBA program?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Admission to BBA programs typically hinges on 12th-grade marks (50-60%). Research minimum percentage requirements, then complete the application, submit transcripts, essays, recommendation letters, and attend interviews. Entrance exams are common. Platforms like Seemycampus offer reliable information on 60,000+ institutions, including BBA programs.
                </p>
              </div>
            </div>

            {/* FAQ 06 */}
            <div className="flex gap-0 bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[hsl(210,50%,25%)] w-24 flex flex-col items-center justify-between py-6 px-4">
                <span className="text-white text-xs font-semibold">FAQ</span>
                <span className="text-white text-4xl font-bold">06</span>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What are the top BBA colleges I can consider with 93% in Class 12th?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore top BBA colleges like Christ University, Loyola College, St. Xavier's, NMIMS, and Symbiosis. For personalized guidance, check Seemycampus, aiding in informed decisions and career choices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For More Guidance Section */}
      <section className="py-16 bg-white">
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
