import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CollegeLogo } from "@/components/college/CollegeLogo"
import { Building2, Handshake, GraduationCap, Users, Award, ChevronRight, TrendingUp, Globe, Target } from "lucide-react"
import { ContactForm } from "@/components/contact/ContactForm"
import { getCollegesPaginated } from "@/lib/colleges"
import { Button } from "@/components/ui/button"
import { PaginationWrapper } from "@/components/colleges/PaginationWrapper"
import { InstagramFeed } from "@/components/home/InstagramFeed"

export const metadata: Metadata = {
  title: "Academic Alliance | SeeMyCampus",
  description: "Learn about our academic partnerships and alliances with leading educational institutions across India.",
  keywords: ["academic alliance", "partnerships", "colleges", "universities", "education partnerships"],
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4)
}

interface AcademicAlliancePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AcademicAlliancePage({ searchParams }: AcademicAlliancePageProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || "1", 10)
  // Get only Academic Alliance partner colleges
  const { colleges, pagination } = await getCollegesPaginated(currentPage, 10, true)

  return (
    <>
      {/* Hero Section - Academic Alliance Banner */}
      <section className="relative py-20 bg-gradient-to-r from-[#18254a] to-[#1e3a5f] text-white overflow-hidden">
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
              <span>ACADEMIC ALLIANCE</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Academic Alliance</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Partnerships for Excellence in Education
            </p>
          </div>
        </div>
      </section>

      {/* Partner Colleges Table Section - Red Background with White Content (Moved to top) */}
      <section className="py-16 bg-red-600">
        <div className="max-w-6xl mx-auto bg-white min-h-[400px] py-8">
          {/* Breadcrumb */}
          <div className="px-6 mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Academic Alliance</span>
          </div>

          {/* Page Header */}
          <div className="px-6 mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Our Partner Colleges
            </h2>
            <p className="text-gray-600">
              Explore our comprehensive directory of partner colleges and universities
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
          {colleges.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">No colleges found. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {colleges.map((college, index) => (
                <div
                  key={college.id}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                    index !== colleges.length - 1 ? "border-b border-gray-200" : ""
                  } hover:bg-gray-50 transition-colors`}
                >
                  {/* Preview - Logo */}
                  <div className="col-span-2 flex justify-center">
                    <CollegeLogo
                      collegeId={college.id}
                      collegeName={college.name}
                      imageUrl={college.images && college.images.length > 0 ? college.images[0] : null}
                      size="lg"
                      variant="circle"
                    />
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

          {/* Pagination */}
          <div className="px-6">
            <PaginationWrapper
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
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
            {/* Partnership Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Handshake className="h-12 w-12 text-gray-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Seemycampus partners with leading educational institutions across India to provide students 
                  with access to the best educational opportunities. Our strategic alliances enable us to offer 
                  comprehensive information and seamless admission processes.
                </p>
              </CardContent>
            </Card>

            {/* Network Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-gray-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Extensive Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Our academic alliances enable us to offer comprehensive information about over 60,000 institutions 
                  and 375,000+ courses, ensuring students have all the resources they need to make informed decisions 
                  about their educational journey.
                </p>
              </CardContent>
            </Card>

            {/* Excellence Card */}
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center relative">
                  <Award className="h-10 w-10 text-gray-600" />
                  <Target className="h-6 w-6 text-gray-600 absolute -top-1 -right-1" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We work with top-tier colleges and universities to ensure quality education delivery. Our partnerships 
                  focus on providing students with access to institutions that maintain high academic standards and 
                  excellent placement records.
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
              <div className="text-5xl md:text-6xl font-bold mb-2">300+</div>
              <div className="text-sm md:text-base">Partner Colleges</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">60K+</div>
              <div className="text-sm md:text-base">Institutions Listed</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">375K+</div>
              <div className="text-sm md:text-base">Courses Available</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl md:text-6xl font-bold mb-2">50K+</div>
              <div className="text-sm md:text-base">Students Counseled</div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed About Academic Alliance Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Academic Alliance</h2>
            
            {/* Icon - Handshake */}
            <div className="mb-6 flex items-center">
              <Handshake className="h-12 w-12 text-[#18254a]" />
            </div>

            {/* Sub-heading */}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Partnerships for Excellence</h3>

            {/* Content Card */}
            <Card className="bg-white shadow-md border-0">
              <CardContent className="pt-6">
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Seemycampus.com has established strategic academic alliances with leading educational institutions 
                    across India. These partnerships enable us to provide students with comprehensive information, 
                    streamlined admission processes, and access to quality education opportunities.
                  </p>
                  <p>
                    Our academic alliance program connects students to over 300 partner colleges and lists information 
                    on more than 60,000 institutions. We provide detailed information on admissions, entrance tests, 
                    infrastructure, courses, and career prospects, helping students make informed decisions about their 
                    educational journey.
                  </p>
                  <p>
                    Through our partnerships, we offer customized student outreach programs and assist students with 
                    counseling and admission services. We help students find suitable colleges based on their academic 
                    background, skill-set, and potential, ensuring they make the right choice for their career.
                  </p>
                  <p>
                    Our alliance partners benefit from our robust ed-tech platform, which facilitates student recruitment 
                    across all streams and degrees. We work together to create a seamless experience for students, 
                    from initial inquiry to enrollment and beyond.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Benefits of Our Academic Alliance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-[#18254a] rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">For Students</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Access to comprehensive information on 60,000+ institutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Streamlined admission processes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Personalized counseling and guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Verified and authentic information</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-[#18254a] rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">For Institutions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Enhanced student recruitment opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Access to a wide network of prospective students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Marketing and promotional support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Data-driven insights and analytics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


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
            {/* Left Column - Instagram Feed */}
            <div className="relative">
              <InstagramFeed />
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
